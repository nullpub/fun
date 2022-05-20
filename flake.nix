{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils/master";
    dnt.url = "github:denoland/dnt/0.23.0";
    dnt.flake = false;
  };

  outputs = { self, nixpkgs, flake-utils, dnt }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        fun = with pkgs; derivation {
          inherit system;
          name = "fun";
          src = ./.;
          cp = "${coreutils}/bin/cp";
          mkdir = "${coreutils}/bin/mkdir";
          builder = "${dash}/bin/dash";
          args = [ "-c" "$mkdir $out; $cp $src/*.ts $out;" ];
        };
      in
      {
        packages.fun = fun;
        packages.default = fun;

        devShell = pkgs.mkShell {
          dnt = dnt;
          buildInputs = [ pkgs.deno fun ];
        };
      }
    );
}

