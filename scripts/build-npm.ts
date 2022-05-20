import * as DNT from "https://deno.land/x/dnt@0.21.2/mod.ts";
import { parse } from "https://deno.land/x/semver@v1.4.0/mod.ts";
import { join } from "https://deno.land/std@0.132.0/path/mod.ts";
import * as A from "../affect.ts";
import * as D from "../decoder.ts";
import { flow, pipe } from "../fns.ts";

// Local Constants
const PACKAGE_NAME = "fun";
const PACKAGE_DESCRIPTION =
  "A deno native functional programing utility library.";
const ENTRYPOINTS = ["./mod.ts"];

// Additional Decoders
const semver = pipe(
  D.string,
  D.compose((i) => {
    const semVer = parse(i);
    return semVer === null
      ? D.failure(i, "Semantic Version")
      : D.success(semVer);
  }),
);

const Env = D.struct({
  VERSION: semver,
  BUILD_DIR: D.string,
});

type Env = D.TypeOf<typeof Env>;

// Errors
type BuildError = { message: string; context: unknown };

function buildError(message: string, context?: unknown): BuildError {
  return { message, context };
}

// Lift external functions into Affect
const build = A.tryCatch(
  DNT.build,
  (err, args) => buildError("Unable to build node package.", { err, args }),
);

const emptyDir = A.tryCatch(
  DNT.emptyDir,
  (err, args) => buildError("Unable to empty build directory.", { err, args }),
);

const copyFile = A.tryCatch(
  (buildDir: string, filename: string) =>
    Deno.copyFile(filename, join(buildDir, filename)),
  (err, args) => buildError("Unable to copy file.", { err, args }),
);

// Clear build directory
const clearBuildDir = pipe(
  emptyDir,
  A.map(({ BUILD_DIR }: Env) => [BUILD_DIR]),
);

// Build node package
const buildNodePackage = pipe(
  build,
  A.mapArgs(({ BUILD_DIR, VERSION }: Env) => [{
    entryPoints: ENTRYPOINTS,
    outDir: BUILD_DIR,
    typeCheck: true,
    test: true,
    shims: {
      deno: true,
    },
    package: {
      name: PACKAGE_NAME,
      version: VERSION.toString(),
      description: PACKAGE_DESCRIPTION,
      license: "MIT",
      repository: {
        type: "git",
        url: "git+https://github.com/nullpub/fun.git",
      },
      bugs: {
        url: "https://github.com/nullpub/fun/issues",
      },
    },
  }]),
);

// Copy additional files
const copyAdditionalFiles = A.chain(({ BUILD_DIR }: Env) =>
  A.sequenceTuple(
    copyFile(BUILD_DIR, "LICENSE"),
    copyFile(BUILD_DIR, "README.md"),
  )
);

// Execute
const execute = flow(
  Env,
  A.fromEither,
  A.mapLeft((err) => buildError("Unable to decode environmern", { err })),
);
