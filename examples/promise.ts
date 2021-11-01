import * as P from "../promise.ts";
import { pipe, wait } from "../fns.ts";

const log = <A>(a: A): Promise<A> => pipe(P.of(a), P.tap(console.log));

const result = async (n: number) =>
  await pipe(
    P.sequenceTuple(
      pipe(
        wait(n * 1000),
        P.tap(() => console.log("After wait")),
        P.map(() => `Waited ${n} second(s)`),
      ),
      log(n),
      log("hello" + n),
      log({ n }),
    ),
  );

console.log(await result(2));
