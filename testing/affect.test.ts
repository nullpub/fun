import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";

import * as A from "../affect.ts";
import * as E from "../either.ts";
import * as O from "../option.ts";
import * as T from "../task.ts";
import * as TE from "../task_either.ts";
import * as IO from "../io.ts";
import * as IOE from "../io_either.ts";
import { pipe, resolve, then } from "../fns.ts";

Deno.test("Affect make", async () => {
  const a = await resolve(1);
  assertEquals(a, 1);
});

Deno.test("Affect then", async () => {
  const t1 = await pipe(
    resolve(1),
    then((n) => n + 1),
  );
  assertEquals(t1, 2);
});

Deno.test("Affect right", async () => {
  const t1 = A.right(1);
  assertEquals(await t1(1 as never), E.right(1));
});

Deno.test("Affect left", async () => {
  const t1 = A.left(1);
  assertEquals(await t1(1 as never), E.left(1));
});

Deno.test("Affect fold", async () => {
  const t1 = pipe(
    A.right(1),
    A.fold(() => "left", String),
  );
  assertEquals(await t1(), "1");

  const t2 = pipe(
    A.left(1),
    A.fold(String, () => "right"),
  );
  assertEquals(await t2(), "1");
});

Deno.test("Affect ask", async () => {
  const t1 = A.ask<number>();
  assertEquals(await t1(1), E.right(1));

  const t2 = pipe(
    A.ask<number>(),
    A.map((n) => n + 1),
  );
  assertEquals(await t2(1), E.right(2));
});

Deno.test("Affect askLeft", async () => {
  const t1 = A.askLeft<number>();
  assertEquals(await t1(1), E.left(1));

  const t2 = pipe(
    A.askLeft<number>(),
    A.map((n) => n + 1),
  );
  assertEquals(await t2(1), E.left(1));
});
Deno.test("Affect fromOption", async () => {
  const fromOption = A.fromOption(() => 0);
  const t1 = fromOption(O.some(1));
  const t2 = fromOption(O.none);
  assertEquals(await t1(), E.right(1));
  assertEquals(await t2(), E.left(0));
});

Deno.test("Affect fromEither", async () => {
  const t1 = A.fromEither<number, number, [number]>(E.right(0));
  const t2 = A.fromEither<number, number, [number]>(E.left(0));
  assertEquals(await t1(0), E.right(0));
  assertEquals(await t2(0), E.left(0));
});

Deno.test("Affect fromTask", async () => {
  const t1 = A.fromTask<number, number, [number]>(T.of(0));
  assertEquals(await t1(1), E.right(0));
});

Deno.test("Affect fromTaskEither", async () => {
  const t1 = A.fromTaskEither<number, number, [number]>(TE.of(0));
  const t2 = A.fromTaskEither<number, number, [number]>(TE.left(0));
  assertEquals(await t1(1), E.right(0));
  assertEquals(await t2(1), E.left(0));
});

Deno.test("Affect fromIO", async () => {
  const t1 = A.fromIO<number, number, [number]>(IO.of(0));
  assertEquals(await t1(1), E.right(0));
});

Deno.test("Affect fromIOEither", async () => {
  const t1 = A.fromIOEither<number, number, [number]>(IOE.of(0));
  const t2 = A.fromIOEither<number, number, [number]>(IOE.left(0));
  assertEquals(await t1(1), E.right(0));
  assertEquals(await t2(1), E.left(0));
});

Deno.test("Affect of", async () => {
  const t1 = A.of(1);
  assertEquals(await t1(1 as never), E.right(1));
});

Deno.test("Affect ap", async () => {
  const t1 = pipe(
    A.ask<number>(),
    A.ap(A.of((n: number) => n + 1)),
  );
  assertEquals(await t1(1), await A.right(2)());

  const t2 = pipe(
    A.askLeft<number>(),
    A.ap(A.of((n) => n + 1)),
  );
  assertEquals(await t2(1), await A.left(1)());

  const t3 = pipe(
    A.ask<number>(),
    A.ap(A.left(0)),
  );
  assertEquals(await t3(1), await A.left(0)());

  const t4 = pipe(
    A.askLeft<number>(),
    A.ap(A.left(0)),
  );
  assertEquals(await t4(1), await A.left(1)());
});

Deno.test("Affect map", async () => {
  const t1 = pipe(
    A.right(1),
    A.map((n) => n + 1),
  );
  assertEquals(await t1(), E.right(2));

  const t2 = pipe(
    A.left(1),
    A.map((n) => n + 1),
  );
  assertEquals(await t2(), E.left(1));
});

Deno.test("Affect join", async () => {
  const ta1 = A.right(A.right(1));
  const ta2 = A.right(A.left(1));

  assertEquals(await A.join(ta1)(), E.right(1));
  assertEquals(await A.join(ta2)(), E.left(1));
});

Deno.test("Affect chain", async () => {
  const chain = A.chain((n: number) => n < 0 ? A.left(n) : A.right(n));
  const ta1 = A.right(1);
  const ta2 = A.right(-1);
  const ta3 = A.left(1);

  assertEquals(await chain(ta1)(), E.right(1));
  assertEquals(await chain(ta2)(), E.left(-1));
  assertEquals(await chain(ta3)(), E.left(1));
});

Deno.test("Affect throwError", async () => {
  assertEquals(await A.throwError(1)(), E.left(1));
});

Deno.test("Affect bimap", async () => {
  const bimap = A.bimap((n: number) => n + 1, (n: number) => n + 1);
  const ta1 = A.right(1);
  const ta2 = A.left(1);

  assertEquals(await bimap(ta1)(), E.right(2));
  assertEquals(await bimap(ta2)(), E.left(2));
});

Deno.test("Affect mapLeft", async () => {
  const mapLeft = A.mapLeft((n: number) => n + 1);
  const ta1 = A.right(1);
  const ta2 = A.left(1);

  assertEquals(await mapLeft(ta1)(), E.right(1));
  assertEquals(await mapLeft(ta2)(), E.left(2));
});

Deno.test("Affect sequenceTuple", async () => {
  const t1 = A.sequenceTuple(A.right(1), A.right(2));
  assertEquals(await t1(), E.right([1, 2]));

  const t2 = A.sequenceTuple(A.right(1), A.left(2));
  assertEquals(await t2(), E.left(2));

  const t3 = A.sequenceTuple(A.left(1), A.right(2));
  assertEquals(await t3(), E.left(1));

  const t4 = A.sequenceTuple(A.left(1), A.left(2));
  assertEquals(await t4(), E.left(2));
});

Deno.test("Affect sequenceStruct", async () => {
  const ta1 = A.sequenceStruct({ one: A.right(1), two: A.right(2) });
  assertEquals(await ta1(1), E.right({ one: 1, two: 2 }));

  const ta2 = A.sequenceStruct({ one: A.right(1), two: A.left(2) });
  assertEquals(await ta2(1), E.left(2));

  const ta3 = A.sequenceStruct({ one: A.left(1), two: A.right(2) });
  assertEquals(await ta3(1), E.left(1));

  const ta4 = A.sequenceStruct({ one: A.left(1), two: A.left(2) });
  assertEquals(await ta4(1), E.left(2));
});

Deno.test("Affect recover", async () => {
  const t1 = pipe(
    A.left(1),
    A.recover((n) => n + 1),
  );
  assertEquals(await t1(), E.right(2));

  const t2 = pipe(
    A.right(1),
    A.recover((n: number) => n + 1),
  );
  assertEquals(await t2(), E.right(1));
});

// Deno.test("Affect Do, bind, bindTo", async () => {
//   const ta1 = pipe(
//     A.Do(),
//     A.bind("one", () => A.right(1)),
//   );
//   const ta2 = pipe(
//     A.right(1),
//     A.bindTo("one"),
//   );
//   const ta3 = pipe(
//     A.left(2),
//     A.bindTo("one"),
//   );

//   assertEquals(await ta1(), E.right({ one: 1 }));
//   assertEquals(await ta2(), E.right({ one: 1 }));
//   assertEquals(await ta3(), E.left(2));
// });
