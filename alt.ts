// deno-lint-ignore-file no-explicit-any
import type { Functor } from "./functor.ts";
import type { Kind, URIS } from "./kind.ts";

/**
 * The Alt algebraic structure for a given ADT has an appriopriately named
 * `alt` function. This function takes two instances of the given ADT that
 * have matching internal data types. If the "first" value does not meet some
 * requirement then the "second" value is returned. The requirement is
 * specific the the ADT and the given implementation of Alt.
 *
 * For example, the standard implementation of Alt for `Option<number>` will
 * look at the "first" option, if that option is `None` then it will return
 * the "second" option. If the "first" option is `Some<number>` then it will
 * return the "first" option. 
 *
 * The simplest example is the implementation of Alt for the Option ADT. Let's
 * say that
 */
export interface Alt<URI extends URIS, _ extends any[] = any[]>
  extends Functor<URI, _> {
  readonly alt: <A, B extends _[0], C extends _[1], D extends _[2]>(
    second: Kind<URI, [A, B, C, D]>,
  ) => (first: Kind<URI, [A, B, C, D]>) => Kind<URI, [A, B, C, D]>;
}
