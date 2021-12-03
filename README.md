# functional [![Coverage Status](https://coveralls.io/repos/github/nullpub/fun/badge.svg?branch=main)](https://coveralls.io/github/nullpub/fun?branch=main)

functional is a set of utility modules in the vein of
[Ramda](https://ramdajs.com/) and [fp-ts](https://gcanti.github.io/fp-ts/). It
uses a
[lightweight higher kinded type encoding](https://github.com/nullpub/fun/blob/main/hkt.ts)
to implement
[type classes](https://github.com/nullpub/fun/blob/main/type_classes.ts) such as
Functor, Monad, and Traversable. Originally, it followed the
[static-land](https://github.com/fantasyland/static-land/blob/master/docs/spec.md)
specification for these modules, but has since diverged and settled on a curried
form of those same module definitions. It contains many common algebraic types
such as [Option](https://github.com/nullpub/fun/blob/main/option.ts),
[Either](https://github.com/nullpub/fun/blob/main/either.ts), and other tools
such as [Lenses](https://github.com/nullpub/fun/blob/main/optics/lens.ts) and
[Schemables](https://github.com/nullpub/fun/blob/main/schemable/schemable.ts).

The primary goals of functional are to be:

- **Pragmatic**: The API surface of functional should favor ease-of-use and
  consistency over cleverness or purity. This project is ultimately for getting
  work done.
- **Understandable**: The HKT and Type Class implementations are meant to be as
  simple as possible so their logic can be easily audited.
- **Performant**: Once the first two goals are satisfied, the long term changes
  within functional are likely going to be beneath the API surface and aimed at
  speeding things up where possible.

Some non-goals of functional are:

- To be an exact port of fp-ts. Many changes have been implemented throughout
  functional that diverge sharply from fp-ts, this is often on purpose.

## History

functional started as an exploratory project in late 2020 to learn more about
higher kinded type implementations in TypeScript and to assess how much effort
it would take to port fp-ts to a Deno-native format. Through that process it
became clear that the things I had learned could serve as both a useful tool and
as a learning resource in and of itself. At various times functional has used
multiple hkt encodings, type class definitions, and implementation methods. Some
of the key history moments of functional are in the hkts history. Specifically,
the
[hkts implementation](https://github.com/nullpub/hkts/commit/684e3e56c2d6ae7313fc70c2f35a942c8abad8d8)
in the initial commit and the last
[major type system rewrite](https://github.com/nullpub/hkts/tree/32ddaa0ddde4d437807a66e914c7854867ed847d)
might be interesting. Now, however, the API for version 1.0.0 is set and will
only change between major versions (which should be extremely rare).

This project is incredibly indebted to [gcanti](https://github.com/gcanti),
[pelotom](https://github.com/pelotom), and the TypeScript community at large.
There is nothing new in this project, it's all a reimaginings of ideas that
already existed.

For anyone getting started with functional programming I highly recommend
writing your own implementation of an ADT such as Option or Either. From Functor
to IndexedTraversable with everything inbetween, there is a lot to learn about
the mechanics of programming in general by taking these small pieces apart and
putting them back together.

## Documentation

Deno comes with a documentation generator. The
[documentation generation](https://github.com/denoland/deno_doc) doesn't handle
re-exports or types on consts that are functions, as that work progresses the
documentation for functional will improve. The current documentation for any
module at the `HEAD` of the `main` branch can be found here:

- [affect](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/affect.ts)
- [alt](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/alt.ts)
- [alternative](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/alternative.ts)
- [applicative](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/applicative.ts)
- [apply](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/apply.ts)
- [array](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/array.ts)
- [async_iterable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/async_iterable.ts)
- [at](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/at.ts)
- [bifunctor](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/bifunctor.ts)
- [boolean](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/boolean.ts)
- [category](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/category.ts)
- [chain](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/chain.ts)
- [comonad](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/comonad.ts)
- [const](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/const.ts)
- [contravariant](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/contravariant.ts)
- [datum](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/datum.ts)
- [decoder](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/decoder.ts)
- [derivations](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/derivations.ts)
- [either](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/either.ts)
- [extend](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/extend.ts)
- [filterable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/filterable.ts)
- [fns](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/fns.ts)
- [foldable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/foldable.ts)
- [from_traversable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/from_traversable.ts)
- [functor](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/functor.ts)
- [group](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/group.ts)
- [guard](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/guard.ts)
- [identity](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/identity.ts)
- [index](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/index.ts)
- [indexed_foldable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/indexed_foldable.ts)
- [indexed_functor](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/indexed_functor.ts)
- [indexed_traversable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/indexed_traversable.ts)
- [io](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/io.ts)
- [io_either](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/io_either.ts)
- [iso](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/iso.ts)
- [iterable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/iterable.ts)
- [json](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/json.ts)
- [kind](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/kind.ts)
- [lens](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/lens.ts)
- [map](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/map.ts)
- [monad](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/monad.ts)
- [monad_throw](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/monad_throw.ts)
- [monoid](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/monoid.ts)
- [newtype](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/newtype.ts)
- [nilable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/nilable.ts)
- [number](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/number.ts)
- [option](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/option.ts)
- [optional](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/optional.ts)
- [ord](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/ord.ts)
- [plus](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/plus.ts)
- [prism](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/prism.ts)
- [profunctor](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/profunctor.ts)
- [reader](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/reader.ts)
- [reader_either](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/reader_either.ts)
- [record](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/record.ts)
- [result](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/result.ts)
- [schemable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/schemable.ts)
- [semigroup](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/semigroup.ts)
- [semigroupoid](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/semigroupoid.ts)
- [set](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/set.ts)
- [setoid](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/setoid.ts)
- [show](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/show.ts)
- [state](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/state.ts)
- [string](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/string.ts)
- [task](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/task.ts)
- [task_either](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/task_either.ts)
- [these](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/these.ts)
- [traversable](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/traversable.ts)
- [traversal](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/traversal.ts)
- [tree](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/tree.ts)
- [type_classes](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/type_classes.ts)
- [types](https://doc.deno.land/https://raw.githubusercontent.com/nullpub/fun/main/types.ts)

In general, you can take any specific module url and put it into
[https://doc.deno.land/](https://doc.deno.land/) to get a decent rendering of
the documentation. (Note: Currently the deno_doc crate, which is what
doc.deno.land uses, does not handle re-exports or const arrow function exports
well. Eventually, the documentation will get better even if this libraries
maintainers have to write those patches themselves).

## Versions

| Version | Deno Release                                                  | TypeScript Version                                                   |
| ------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1.0.0   | [1.9.2](https://github.com/denoland/deno/releases/tag/v1.9.2) | [4.2.2](https://github.com/microsoft/TypeScript/releases/tag/v4.2.2) |

## Contributions

Contributions are welcome! Currently, the only maintainer for functional is
[baetheus](https://github.com/baetheus). If you want to add to functional or
change something, open an issue and ask away. The guidelines for contribution
are:

1. We use
   [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/)
2. We use [semantic versioning](https://semver.org/)
3. We don't break APIs
4. We keep test coverage at 100%
