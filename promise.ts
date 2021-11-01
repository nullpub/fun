import type * as TC from "./type_classes.ts";
import type * as HKT from "./hkt.ts";

import { pipe, then } from "./fns.ts";
import { createDo } from "./derivations.ts";
import { createSequenceStruct, createSequenceTuple } from "./sequence.ts";

/** ****************************************************************************
 * Kind Registration
 * ************************************************************************** */

/**
 * URI constant for Promise
 */
export const URI = "Promise";

/**
 * URI constant type for Promise
 */
export type URI = typeof URI;

/**
 * Kind declaration for Promise
 */
declare module "./hkt.ts" {
  // deno-lint-ignore no-explicit-any
  export interface Kinds<_ extends any[]> {
    [URI]: Promise<_[0]>;
  }
}

/** ****************************************************************************
 * Functions
 * ************************************************************************** */

export function of<A>(a: A): Promise<A> {
  return Promise.resolve(a);
}

export function map<A, I>(fai: (a: A) => I): (ta: Promise<A>) => Promise<I> {
  return then(fai);
}

export function ap<A, I>(
  tfai: Promise<(a: A) => I>,
): (ta: Promise<A>) => Promise<I> {
  return async (ta) => {
    const fai = await tfai;
    const a = await ta;
    return fai(a);
  };
}

export function chain<A, I>(
  fati: (a: A) => Promise<I>,
): (ta: Promise<A>) => Promise<I> {
  return then(fati);
}

export async function join<A>(tta: Promise<Promise<A>>): Promise<A> {
  return await tta;
}

export function tap<A>(
  fa: (a: A) => void | Promise<void>,
): (ta: Promise<A>) => Promise<A> {
  return then((a) => {
    fa(a);
    return a;
  });
}

/** ****************************************************************************
 * Modules
 * ************************************************************************** */

export const Functor: TC.Functor<URI> = { map };

export const Apply: TC.Apply<URI> = { ap, map };

export const Applicative: TC.Applicative<URI> = { of, ap, map };

export const Chain: TC.Chain<URI> = { ap, map, chain };

export const Monad: TC.Monad<URI> = { of, ap, map, join, chain };

/** ****************************************************************************
 * Derived Functions
 * ************************************************************************** */

export const sequenceTuple = createSequenceTuple(Apply);

export const sequenceStruct = createSequenceStruct(Apply);

export const { Do, bind, bindTo } = createDo(Monad);
