# CHANGES for regextras

## 0.7.0

- Linting (ESLint): Update per latest ash-nazg; switch to 2sp.
  indent; lint HTML, Markdown
- Maintenance: Add `.editorconfig`
- Fix: Properly add any extra u (unicode) flag
- Enhancement: Add any extra s (dotAll) flag
- Testing: Use ESM
- Testing: Add nyc for coverage
- Testing: Begin use of BDD style
- Testing: Add tests for mixinRegex and plain prototype.js
- Testing: Add HTML reporter
- npm: Update devDeps

## 0.6.1

- npm: Drop `peerDependencies` (though still required)

## 0.6.0

- Enhancement: Add `main` ES and UMD builds (without generators)
- Linting (ESLint): Apply ash-nazg; use js file format
- Linting: Add `lgtm.yml`
- Testing: Avoid missing `regenerator-runtime` and `core-js-bundle`;
    favicon no-ops; use strict; put `write` in own module
- npm: Update devDeps, peerDep; add ash-nazg and its peerDeps; ignore rollup

## 0.5.0

- Babel: Add `.babelrc`, preset-env
- Linting: Switch to .json file; update to avoid new standard rule
- Testing: Switch from end-of-lifed nodeunit to Mocha
- npm: Update devDeps; use terser and @babel/core; opn-cli -> open-cli
- npm: Add regenerator-runtime and core-js-bundle peerDeps and devDeps

## 0.4.0

- Breaking change: Stop exporting default
- npm: Update devDep
- npm: Separate nodeunit script from linting/rollup

## 0.3.0

- Breaking change: Move now ES6 source files from `lib` to `src`
- Enhancement: ES6 Modules export (incomplete)
- Refactoring: Swap main with index
- Linting: Add ESLint, `.remarkrc`
- License: Remove mistakenly copied portion from my other repo
- License: Rename to reflect type (MIT)
- npm: Add `packge-lock.json`
- npm: Update devDeps

## 0.1.1

- Fix README

## 0.1.0

- Initial release
