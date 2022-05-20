import * as T from "./types.ts";
import type { Kinds } from "./kind.ts";
import type { Either } from "./either.ts";
import type { Option } from "./option.ts";
import type { Task } from "./task.ts";
import type { TaskEither } from "./task_either.ts";
import type { IO } from "./io.ts";
import type { IOEither } from "./io_either.ts";

import {
  ap as eitherAp,
  bimap as eitherBimap,
  fold as eitherFold,
  isLeft as eitherIsLeft,
  left as eitherLeft,
  map as eitherMap,
  mapLeft as eitherMapLeft,
  right as eitherRight,
} from "./either.ts";
import { isNone } from "./option.ts";
import { flow, identity, pipe, resolve, then } from "./fns.ts";
import { createSequenceStruct, createSequenceTuple } from "./apply.ts";

// Affect args must type to a tuple, but if they don't then we must
// fail them at the type level.
type ToArgs<C> = C extends readonly [...infer AS] ? readonly [...AS] : [never];

/**
 * The Affect type can best be thought of as an asynchronous function that
 * returns an `Either`. ie. `async (...c: ToArgs<C>) => Promise<Either<B, A>>`. This
 * forms the basis of most Promise based asynchronous communication in
 * TypeScript.
 *
 * Notice how there is a generic type `C` injected here.
 * This enables us to pass `c` context around which can be thought of
 * as dependency injection.
 *
 * This is the crystalized version of the pattern:
 * `Reader<Task<Either<L,R>>>` that is commonly known as ReaderTaskEither
 * or `RTE` for short in the fp-ts community.
 *
 * The difference being, the resulting Promise is not wrapped in a thunk.
 * `RTE = (c: C) => () => Promise<Either<B,A>>`
 * `Aff = (c: C) => Promise<Either<B,A>>`
 */
export type Affect<C, B, A> = (...c: ToArgs<C>) => Promise<Either<B, A>>;

/**
 * URI constant for the Affect ADT
 */
export const URI = "Affect";

/**
 * URI constant type for the Affect ADT
 */
export type URI = typeof URI;

/**
 * Kind declaration for Affect
 */
declare module "./kind.ts" {
  // deno-lint-ignore no-explicit-any
  export interface Kinds<_ extends any[]> {
    [URI]: Affect<_[2], _[1], _[0]>;
  }
}

export function alt<A, B, C>(
  tb: Affect<C, B, A>,
): (ta: Affect<C, B, A>) => Affect<C, B, A> {
  return (ta) =>
    async (...c) => {
      const ea = await ta(...c);
      return eitherIsLeft(ea) ? tb(...c) : ea;
    };
}

/**
 * The parallel [Apply](./apply.ts) implementation for the Affect ADT.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const addOne = (n: number) => n + 1;
 * const computation = pipe(
 *   A.ask<number>(),
 *   A.ap(A.right(addOne)),
 * );
 * const result = await computation(1);
 *
 * assertEquals(result, E.right(2));
 * ```
 */
export function ap<A, I, B, C>(
  tfai: Affect<C, B, (a: A) => I>,
): (ta: Affect<C, B, A>) => Affect<C, B, I> {
  return (ta) =>
    (...c) =>
      Promise.all([tfai(...c), ta(...c)]).then(([efai, ea]) =>
        pipe(ea, eitherAp(efai))
      );
}

export function apSeq<A, I, B, C>(
  tfai: Affect<C, B, (a: A) => I>,
): (ta: Affect<C, B, A>) => Affect<C, B, I> {
  return (ta) =>
    async (...c) => pipe(await ta(...c), eitherAp(await tfai(...c)));
}

export function ask<A, B = never>(): Affect<[A], B, A> {
  return (a) => resolve(eitherRight(a));
}

export function askLeft<B, A = never>(): Affect<[B], B, A> {
  return (b) => resolve(eitherLeft(b));
}

/**
 * The Bifunctor implementation for the Affect ADT.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 *
 * const addOne = (n: number) => n + 1;
 * const toUpper = (s: string) => s.toUpperCase();
 * const bimap = A.bimap(toUpper, addOne);
 *
 * const ta = bimap(A.ask<number>());
 * const tb = bimap(A.askLeft<string>());
 *
 * const ra = await ta(1);
 * const rb = await tb("hello");
 *
 * assertEquals(ra, E.right(2));
 * assertEquals(rb, E.left("HELLO"));
 * ```
 */
export function bimap<A, B, I, J>(
  fbj: (b: B) => J,
  fai: (a: A) => I,
): <C>(ta: Affect<C, B, A>) => Affect<C, J, I> {
  return (ta) => flow(ta, then(eitherBimap(fbj, fai)));
}

/**
 * The Chain implementation for the Affect ADT.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const computation = pipe(
 *   A.ask<number, string>(),
 *   A.chain(n => n > 0 ? A.right(n) : A.left("Number too small")),
 * );
 *
 * const ra = await computation(1);
 * const rb = await computation(-1);
 *
 * assertEquals(ra, E.right(1));
 * assertEquals(rb, E.left("Number too small"));
 * ```
 */
export function chain<A, I, J, C>(
  fati: (a: A) => Affect<C, J, I>,
): <B>(ta: Affect<C, B, A>) => Affect<C, B | J, I> {
  return (ta) =>
    async (...c) => {
      const ea = await ta(...c);
      return eitherIsLeft(ea) ? ea : fati(ea.right)(...c);
    };
}

/**
 * Constructs an Affect from an Either.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const ta = pipe(
 *   A.fromEither(E.right(1)), // construct an Affect from either
 * );
 * const result = await ta(""); // The argument to ta is ignored in this case,
 *
 * assertEquals(result, E.right(1));
 * ```
 */
export function fromEither<A, B, C = never>(
  ma: Either<B, A>,
): Affect<C, B, A> {
  return () => resolve(ma);
}

/**
 * Constructs an Affect from an IO.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import * as I from "./io.ts";
 * import { pipe } from "./fns.ts";
 *
 * const ta = pipe(
 *   A.fromIO(I.of(1)),
 * );
 * const result = await ta("");
 *
 * assertEquals(result, E.right(1));
 * ```
 */
export function fromIO<A, B = never, C = never>(
  ma: IO<A>,
): Affect<C, B, A> {
  return flow(ma, eitherRight, resolve);
}

/**
 * Constructs an Affect from an IOEither.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import * as I from "./io_either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const ta = pipe(
 *   A.fromIOEither(I.right(1)),
 * );
 * const result = await ta("");
 *
 * assertEquals(result, E.right(1));
 * ```
 */
export function fromIOEither<A, B, C = never>(
  ma: IOEither<B, A>,
): Affect<C, B, A> {
  return flow(ma, resolve);
}

/**
 * Constructs an Affect from an Option.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import * as O from "./option.ts";
 *
 * const fromOption = A.fromOption(() => 0);
 *
 * const t1 = fromOption(O.some(1));
 * const t2 = fromOption(O.none);
 * assertEquals(await t1(2), E.right(1));
 * assertEquals(await t2(2), E.left(0));
 * ```
 */
export function fromOption<B>(
  onNone: () => B,
): <A>(ta: Option<A>) => Affect<never, B, A> {
  return (ta) =>
    () =>
      isNone(ta)
        ? resolve(eitherLeft(onNone()))
        : resolve(eitherRight(ta.value));
}

export function fromPromise<A, B = never, C = never>(
  ta: Promise<A>,
): Affect<C, B, A> {
  return () => ta.then(eitherRight);
}

export function fromThrowablePromise<A, B = never, C = never>(
  ta: Promise<A>,
  onThrow: (e: unknown) => B,
): Affect<C, B, A> {
  return () => ta.then(eitherRight).catch((e) => eitherLeft(onThrow(e)));
}

/**
 * Constructs an Affect from a Task.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import * as T from "./task.ts";
 * import { pipe } from "./fns.ts";
 *
 * const ta = pipe(
 *   A.fromTask(T.of(1)),
 * );
 * const result = await ta("");
 *
 * assertEquals(result, E.right(1));
 * ```
 */
export function fromTask<A, B = never, C = never>(
  ma: Task<A>,
): Affect<C, B, A> {
  return flow(ma, then(eitherRight));
}

/**
 * Constructs an Affect from a TaskEither.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import * as T from "./task_either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const ta = pipe(
 *   A.fromTaskEither(T.right(1)),
 * );
 * const result = await ta("");
 *
 * assertEquals(result, E.right(1));
 * ```
 */
export function fromTaskEither<A, B, C = never>(
  ma: TaskEither<B, A>,
): Affect<C, B, A> {
  return ma;
}

/**
 * The Monad implementation for the Affect ADT.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const computation = pipe(
 *   A.ask<number>(),
 *   A.map(n => A.right<number, number, number>(n + 1)),
 *   A.join,
 * );
 * const result = await computation(1);
 *
 * assertEquals(result, E.right(2));
 * ```
 */
export function join<A, B, C>(
  ta: Affect<C, B, Affect<C, B, A>>,
): Affect<C, B, A> {
  return pipe(ta, chain(identity));
}

/**
 * Constructs an Affect from a value and wraps it in an inner *Left*.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 *
 * const computation = A.left<number, number, {}>(1);
 * const result = await computation({});
 *
 * assertEquals(result, E.left(1));
 * ```
 */
export function left<A = never, B = never, C = never>(
  left: B,
): Affect<C, B, A> {
  return () => resolve(eitherLeft(left));
}

/**
 * The Functor implementation for the Affect ADT.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 * import { pipe } from "./fns.ts";
 *
 * const computation = pipe(
 *   A.ask<string>(),
 *   A.map(s => s.length),
 * );
 * const result = await computation("hello");
 *
 * assertEquals(result, E.right(5));
 * ```
 */
export function map<A, I>(
  fai: (a: A) => I,
): <B, C>(ta: Affect<C, B, A>) => Affect<C, B, I> {
  return (ta) => flow(ta, then(eitherMap(fai)));
}

export function mapLeft<B, J>(
  fbj: (b: B) => J,
): <A, C>(ta: Affect<C, B, A>) => Affect<C, J, A> {
  return (ta) => flow(ta, then(eitherMapLeft(fbj)));
}

export function of<A, B = never, C = never>(
  a: A,
): Affect<C, B, A> {
  return right(a);
}

export function recover<E, A>(
  fea: (e: E) => A,
): <C>(ta: Affect<C, E, A>) => Affect<C, E, A> {
  return (ta) =>
    flow(ta, then(eitherFold(flow(fea, eitherRight), eitherRight)));
}

export function tryCatch<C, B, A>(
  fca: (...c: ToArgs<C>) => A | PromiseLike<A>,
  onThrow: (e: unknown, c: ToArgs<C>) => B,
): Affect<C, B, A> {
  return async (...c) => {
    try {
      return eitherRight(await fca(...c));
    } catch (e) {
      return eitherLeft(onThrow(e, c));
    }
  };
}

export function fold<C, B, A, O>(
  onLeft: (left: B) => O,
  onRight: (right: A) => O,
): (ta: Affect<C, B, A>) => (...c: ToArgs<C>) => Promise<O> {
  return (ta) => (...c) => ta(...c).then(eitherFold(onLeft, onRight));
}

/**
 * Constructs an Affect from a value and wraps it in an inner *Right*.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import * as A from "./affect.ts";
 * import * as E from "./either.ts";
 *
 * const computation = A.right<number, number, number>(1);
 * const result = await computation(0);
 *
 * assertEquals(result, E.right(1));
 * ```
 */
export function right<A, B = never, C = never>(
  right: A,
): Affect<C, B, A> {
  return () => resolve(eitherRight(right));
}

export function throwError<A = never, B = never, C = never>(
  b: B,
): Affect<C, B, A> {
  return left(b);
}

export const Functor: T.Functor<URI> = { map };

export const Bifunctor: T.Bifunctor<URI> = { bimap, mapLeft };

export const Apply: T.Apply<URI> = { ap, map };

export const Applicative: T.Applicative<URI> = { of, ap, map };

export const Chain: T.Chain<URI> = { ap, map, chain };

export const Monad: T.Monad<URI> = { of, ap, map, join, chain };

export const MonadThrow: T.MonadThrow<URI> = {
  of,
  ap,
  map,
  join,
  chain,
  throwError,
};

export const Alt: T.Alt<URI> = { alt, map };

export const ApplySeq: T.Apply<URI> = { ap: apSeq, map };

export const ApplicativeSeq: T.Applicative<URI> = { of, ap: apSeq, map };

export const ChainSeq: T.Chain<URI> = { ap: apSeq, map, chain };

export const MonadSeq: T.Monad<URI> = { of, ap: apSeq, map, join, chain };

export const MonadThrowSeq: T.MonadThrow<URI> = {
  of,
  ap: apSeq,
  map,
  join,
  chain,
  throwError,
};

export const sequenceStruct = createSequenceStruct(Apply);

export const sequenceTuple = createSequenceTuple(Apply);
