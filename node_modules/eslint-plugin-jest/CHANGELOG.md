# [23.18.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.17.1...v23.18.0) (2020-07-05)


### Features

* **valid-title:** support `mustMatch` & `mustNotMatch` options ([#608](https://github.com/jest-community/eslint-plugin-jest/issues/608)) ([4c7207e](https://github.com/jest-community/eslint-plugin-jest/commit/4c7207ebbb274f7b584225ad65ffb96a4328240e)), closes [#233](https://github.com/jest-community/eslint-plugin-jest/issues/233)

## [23.17.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.17.0...v23.17.1) (2020-06-23)


### Bug Fixes

* **lowercase-name:** ignore all top level describes when option is true ([#614](https://github.com/jest-community/eslint-plugin-jest/issues/614)) ([624018a](https://github.com/jest-community/eslint-plugin-jest/commit/624018aa181e7c0ce87457a4f9c212c7891987a8)), closes [#613](https://github.com/jest-community/eslint-plugin-jest/issues/613)

# [23.17.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.16.0...v23.17.0) (2020-06-23)


### Features

* **lowercase-name:** support `ignoreTopLevelDescribe` option ([#611](https://github.com/jest-community/eslint-plugin-jest/issues/611)) ([36fdcc5](https://github.com/jest-community/eslint-plugin-jest/commit/36fdcc553ca40bc2ca2e9ca7e04f8e9e4a315274)), closes [#247](https://github.com/jest-community/eslint-plugin-jest/issues/247)

# [23.16.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.15.0...v23.16.0) (2020-06-21)


### Features

* create `no-conditional-expect` rule ([aba53e4](https://github.com/jest-community/eslint-plugin-jest/commit/aba53e4061f3b636ab0c0270e183c355c6f301e0))
* deprecate `no-try-expect` in favor of `no-conditional-expect` ([6d07cad](https://github.com/jest-community/eslint-plugin-jest/commit/6d07cadd5f78ed7a64a86792931d49d3cd943d69))

# [23.15.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.14.0...v23.15.0) (2020-06-21)


### Features

* **no-standalone-expect:** support `additionalTestBlockFunctions` ([#585](https://github.com/jest-community/eslint-plugin-jest/issues/585)) ([ed220b2](https://github.com/jest-community/eslint-plugin-jest/commit/ed220b2c515f2e97ce639dd1474c18a7f594c06c))

# [23.14.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.13.2...v23.14.0) (2020-06-20)


### Bug Fixes

* **no-test-callback:** check argument is an identifier ([f70612d](https://github.com/jest-community/eslint-plugin-jest/commit/f70612d8b414575725a5831ed9dfad1eaf1e6548))
* **no-test-callback:** provide suggestion instead of autofix ([782d8fa](https://github.com/jest-community/eslint-plugin-jest/commit/782d8fa00149143f453e7cb066f90c017e2d3f61))
* **prefer-strict-equal:** provide suggestion instead of autofix ([2eaed2b](https://github.com/jest-community/eslint-plugin-jest/commit/2eaed2bf30c72b03ee205910887f8aab304047a5))


### Features

* **prefer-expect-assertions:** provide suggestions ([bad88a0](https://github.com/jest-community/eslint-plugin-jest/commit/bad88a006135258e8da18902a84bdb52a9bb9fa7))

## [23.13.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.13.1...v23.13.2) (2020-05-26)


### Bug Fixes

* add `fail` to globals ([#595](https://github.com/jest-community/eslint-plugin-jest/issues/595)) ([aadc5ec](https://github.com/jest-community/eslint-plugin-jest/commit/aadc5ec5610ec024eac4b0aa6077cc012a0ba98e))

## [23.13.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.13.0...v23.13.1) (2020-05-17)


### Bug Fixes

* **no-if:** use correct syntax for placeholder substitution in message ([6d1eda8](https://github.com/jest-community/eslint-plugin-jest/commit/6d1eda89ac48c93c2675dcf24a92574a20b2edb9))

# [23.13.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.12.0...v23.13.0) (2020-05-16)


### Features

* **valid-expect:** support `minArgs` & `maxArgs` options ([#584](https://github.com/jest-community/eslint-plugin-jest/issues/584)) ([9e0e2fa](https://github.com/jest-community/eslint-plugin-jest/commit/9e0e2fa966b43c1099d11b2424acb1590c241c03))

# [23.12.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.11.0...v23.12.0) (2020-05-16)


### Features

* deprecate `no-expect-resolves` rule ([b6a22e5](https://github.com/jest-community/eslint-plugin-jest/commit/b6a22e5aa98abcb57aac217c6d4583d0a3388e7b))
* deprecate `no-truthy-falsy` rule ([a67d92d](https://github.com/jest-community/eslint-plugin-jest/commit/a67d92d2834568122f24bf3d8455999166da95ea))
* deprecate `prefer-inline-snapshots` rule ([1360e9b](https://github.com/jest-community/eslint-plugin-jest/commit/1360e9b0e840f4f778a9d251371c943919f84600))

# [23.11.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.10.0...v23.11.0) (2020-05-12)


### Features

* create `no-restricted-matchers` rule ([#575](https://github.com/jest-community/eslint-plugin-jest/issues/575)) ([ac926e7](https://github.com/jest-community/eslint-plugin-jest/commit/ac926e779958240506ee506047c9a5364bb70aea))

# [23.10.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.9.0...v23.10.0) (2020-05-09)


### Features

* **no-deprecated-functions:** support jest `version` setting ([#564](https://github.com/jest-community/eslint-plugin-jest/issues/564)) ([05f20b8](https://github.com/jest-community/eslint-plugin-jest/commit/05f20b80ecd42b8d1f1f18ca19d4bc9cba45e22e))

# [23.9.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.8.2...v23.9.0) (2020-05-04)


### Features

* create `no-deprecated-functions` ([#560](https://github.com/jest-community/eslint-plugin-jest/issues/560)) ([55d0504](https://github.com/jest-community/eslint-plugin-jest/commit/55d0504cadc945b770d7c3b6d3cab425c9b76d0f))

## [23.8.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.8.1...v23.8.2) (2020-03-06)

### Bug Fixes

- **prefer-to-contain:** check that expect argument is defined before use
  ([#542](https://github.com/jest-community/eslint-plugin-jest/issues/542))
  ([56f909b](https://github.com/jest-community/eslint-plugin-jest/commit/56f909b326034236953d04b18dab3f64b16a2973))

## [23.8.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.8.0...v23.8.1) (2020-02-29)

### Bug Fixes

- remove tests from published package
  ([#541](https://github.com/jest-community/eslint-plugin-jest/issues/541))
  ([099a150](https://github.com/jest-community/eslint-plugin-jest/commit/099a150b87fa693ccf1c512ee501aed1457ba656))

# [23.8.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.7.0...v23.8.0) (2020-02-23)

### Bug Fixes

- **valid-title:** ensure argument node is defined before accessing props
  ([#538](https://github.com/jest-community/eslint-plugin-jest/issues/538))
  ([7730f75](https://github.com/jest-community/eslint-plugin-jest/commit/7730f757561100559509b756fd362ca33b9ab1d4))

### Features

- **no-large-snapshots:** add setting to define maxSize by snapshot type
  ([#524](https://github.com/jest-community/eslint-plugin-jest/issues/524))
  ([0d77300](https://github.com/jest-community/eslint-plugin-jest/commit/0d77300e61adc7a5aa84f34ff4ccc164075d5f41))

# [23.7.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.6.0...v23.7.0) (2020-02-07)

### Bug Fixes

- **expect-expect:** use `u` flag in regex
  ([#532](https://github.com/jest-community/eslint-plugin-jest/issues/532))
  ([c12b725](https://github.com/jest-community/eslint-plugin-jest/commit/c12b7251ef1506073d268973b93c7fc9fbcf50af))

### Features

- **valid-title:** support `disallowedWords` option
  ([#522](https://github.com/jest-community/eslint-plugin-jest/issues/522))
  ([38bbe93](https://github.com/jest-community/eslint-plugin-jest/commit/38bbe93794ed456c6e9e5d7be848b2aeb55ce0ba))

# [23.6.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.5.0...v23.6.0) (2020-01-12)

### Features

- **no-if:** support `switch` statements
  ([#515](https://github.com/jest-community/eslint-plugin-jest/issues/515))
  ([be4e49d](https://github.com/jest-community/eslint-plugin-jest/commit/be4e49dcecd64711e743f5e09d1ff24e4c6e1648))

# [23.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.4.0...v23.5.0) (2020-01-12)

### Features

- **expect-expect:** support glob patterns for assertFunctionNames
  ([#509](https://github.com/jest-community/eslint-plugin-jest/issues/509))
  ([295ca9a](https://github.com/jest-community/eslint-plugin-jest/commit/295ca9a6969c77fadaa1a42d76e89cae992520a6))
- **valid-expect:** refactor `valid-expect` linting messages
  ([#501](https://github.com/jest-community/eslint-plugin-jest/issues/501))
  ([7338362](https://github.com/jest-community/eslint-plugin-jest/commit/7338362420eb4970f99be2016bb4ded5732797e3))

# [23.4.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.3.0...v23.4.0) (2020-01-10)

### Features

- **expect-expect:** support chained function names
  ([#471](https://github.com/jest-community/eslint-plugin-jest/issues/471))
  ([#508](https://github.com/jest-community/eslint-plugin-jest/issues/508))
  ([beb1aec](https://github.com/jest-community/eslint-plugin-jest/commit/beb1aececee80589c182e95bc64ef01d97eb5e78))
- **rules:** add support for function declaration as test case
  ([#504](https://github.com/jest-community/eslint-plugin-jest/issues/504))
  ([ac7fa48](https://github.com/jest-community/eslint-plugin-jest/commit/ac7fa487d05705bee1b2d5264d5096f0232ae1e1))

# [23.3.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.2.0...v23.3.0) (2020-01-04)

### Features

- **rules:** add .concurrent support
  ([#498](https://github.com/jest-community/eslint-plugin-jest/issues/498))
  ([#502](https://github.com/jest-community/eslint-plugin-jest/issues/502))
  ([dcba5f1](https://github.com/jest-community/eslint-plugin-jest/commit/dcba5f1f1c6429a8bce2ff9aae71c02a6ffa1c2b))

# [23.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.1.1...v23.2.0) (2019-12-28)

### Features

- **valid-expect:** warn on `await expect()` with no assertions
  ([#496](https://github.com/jest-community/eslint-plugin-jest/issues/496))
  ([19798dd](https://github.com/jest-community/eslint-plugin-jest/commit/19798dd540c8a0f5ac7883f67a28ee67d9e5fc7a))

## [23.1.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.1.0...v23.1.1) (2019-11-30)

### Bug Fixes

- **no-focused-tests:** detect table format uage of `.only.each`
  ([#489](https://github.com/jest-community/eslint-plugin-jest/issues/489))
  ([d03bcf4](https://github.com/jest-community/eslint-plugin-jest/commit/d03bcf49e9e4f068bead25a4bc4c962762d56c02))

# [23.1.0](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.5...v23.1.0) (2019-11-29)

### Features

- **no-focused-tests:** check each with table format
  ([#430](https://github.com/jest-community/eslint-plugin-jest/issues/430))
  ([154c0b8](https://github.com/jest-community/eslint-plugin-jest/commit/154c0b8e5310f0c1bf715a8c60de5d84faa1bc48))

## [23.0.5](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.4...v23.0.5) (2019-11-27)

### Bug Fixes

- typo in the `require-to-throw-message` docs
  ([#487](https://github.com/jest-community/eslint-plugin-jest/issues/487))
  ([3526213](https://github.com/jest-community/eslint-plugin-jest/commit/35262135e3bb407b9c40991d2651ca4b201eebff))

## [23.0.4](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.3...v23.0.4) (2019-11-14)

### Bug Fixes

- get correct ruleName without specifying file extension
  ([#473](https://github.com/jest-community/eslint-plugin-jest/issues/473))
  ([f09203e](https://github.com/jest-community/eslint-plugin-jest/commit/f09203ed05a69c83baadf6149ae17513c85b170f))

## [23.0.3](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.2...v23.0.3) (2019-11-08)

### Bug Fixes

- **no-test-callback:** don't provide fix for `async` functions
  ([#469](https://github.com/jest-community/eslint-plugin-jest/issues/469))
  ([09111e0](https://github.com/jest-community/eslint-plugin-jest/commit/09111e0c951aaa930c9a2c8e0ca84251b3196e94)),
  closes [#466](https://github.com/jest-community/eslint-plugin-jest/issues/466)

## [23.0.2](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.1...v23.0.2) (2019-10-28)

### Bug Fixes

- **prefer-todo:** ensure argument exists before trying to access it
  ([#462](https://github.com/jest-community/eslint-plugin-jest/issues/462))
  ([a87c8c2](https://github.com/jest-community/eslint-plugin-jest/commit/a87c8c29e1faf9d5364c9074d988aa95ef6cc987))

## [23.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v23.0.0...v23.0.1) (2019-10-28)

### Bug Fixes

- **valid-title:** ignore string addition
  ([#461](https://github.com/jest-community/eslint-plugin-jest/issues/461))
  ([b7c1be2](https://github.com/jest-community/eslint-plugin-jest/commit/b7c1be2f279b87366332fb2d3a3e49a71aa75711))

# [22.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v22.1.3...v22.2.0) (2019-01-29)

### Features

- **rules:** add prefer-todo rule
  ([#218](https://github.com/jest-community/eslint-plugin-jest/issues/218))
  ([0933d82](https://github.com/jest-community/eslint-plugin-jest/commit/0933d82)),
  closes [#217](https://github.com/jest-community/eslint-plugin-jest/issues/217)
