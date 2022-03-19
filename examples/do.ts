import * as O from "../option.ts";
import { Kind, URIS } from "../kind.ts";
import { Monad } from "../types.ts";
import { pipe } from "../fns.ts";

export function Do<URI extends URIS, T>(
  M: Monad<URI>,
  g: () => Generator<T, Kind<URI, [any]>, any>,
) {
  const generator = g();

  function doRec(v: unknown = undefined): Kind<URI, [any]> {
    const { value, done } = generator.next(v);
    return (done
      ? value
      : pipe(value as any, M.chain(doRec as any))) as unknown as Kind<
        URI,
        [any]
      >;
  }

  return doRec();
}

const A = Do(O.Monad, function* () {
  const user = yield O.some("Hello");
  return user;
});

console.log(A);
