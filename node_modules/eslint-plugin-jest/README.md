<div align="center">
  <a href="https://eslint.org/">
    <img width="150" height="150" src="https://eslint.org/assets/img/logo.svg">
  </a>
  <a href="https://facebook.github.io/jest/">
    <img width="150" height="150" vspace="" hspace="25" src="https://jestjs.io/img/jest.png">
  </a>
  <h1>eslint-plugin-jest</h1>
  <p>ESLint plugin for Jest</p>
</div>

[![Actions Status](https://github.com/jest-community/eslint-plugin-jest/workflows/Unit%20tests/badge.svg?branch=master)](https://github.com/jest-community/eslint-plugin-jest/actions)
[![Renovate badge](https://badges.renovateapi.com/github/jest-community/eslint-plugin-jest)](https://renovatebot.com/)

## Installation

```
$ yarn add --dev eslint eslint-plugin-jest
```

**Note:** If you installed ESLint globally then you must also install
`eslint-plugin-jest` globally.

## Usage

Add `jest` to the plugins section of your `.eslintrc` configuration file. You
can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["jest"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error"
  }
}
```

You can also whitelist the environment variables provided by Jest by doing:

```json
{
  "env": {
    "jest/globals": true
  }
}
```

The behaviour of some rules (specifically `no-deprecated-functions`) change
depending on the version of `jest` being used.

This setting is detected automatically based off the version of the `jest`
package installed in `node_modules`, but it can also be provided explicitly if
desired:

```json
{
  "settings": {
    "jest": {
      "version": 26
    }
  }
}
```

## Shareable configurations

### Recommended

This plugin exports a recommended configuration that enforces good testing
practices.

To enable this configuration use the `extends` property in your `.eslintrc`
config file:

```json
{
  "extends": ["plugin:jest/recommended"]
}
```

### Style

This plugin also exports a configuration named `style`, which adds some
stylistic rules, such as `prefer-to-be-null`, which enforces usage of `toBeNull`
over `toBe(null)`.

To enable this configuration use the `extends` property in your `.eslintrc`
config file:

```json
{
  "extends": ["plugin:jest/style"]
}
```

See
[ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files)
for more information about extending configuration files.

### All

If you want to enable all rules instead of only some you can do so by adding the
`all` configuration to your `.eslintrc` config file:

```json
{
  "extends": ["plugin:jest/all"]
}
```

While the `recommended` and `style` configurations only change in major versions
the `all` configuration may change in any release and is thus unsuited for
installations requiring long-term consistency.

## Rules

<!-- begin rules list -->

| Rule                                                                   | Description                                                     | Configurations   | Fixable      |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------- | ------------ |
| [consistent-test-it](docs/rules/consistent-test-it.md)                 | Have control over `test` and `it` usages                        |                  | ![fixable][] |
| [expect-expect](docs/rules/expect-expect.md)                           | Enforce assertion to be made in a test body                     | ![recommended][] |              |
| [lowercase-name](docs/rules/lowercase-name.md)                         | Enforce lowercase test names                                    |                  | ![fixable][] |
| [no-alias-methods](docs/rules/no-alias-methods.md)                     | Disallow alias methods                                          | ![style][]       | ![fixable][] |
| [no-commented-out-tests](docs/rules/no-commented-out-tests.md)         | Disallow commented out tests                                    | ![recommended][] |              |
| [no-deprecated-functions](docs/rules/no-deprecated-functions.md)       | Disallow use of deprecated functions                            |                  | ![fixable][] |
| [no-disabled-tests](docs/rules/no-disabled-tests.md)                   | Disallow disabled tests                                         | ![recommended][] |              |
| [no-duplicate-hooks](docs/rules/no-duplicate-hooks.md)                 | Disallow duplicate setup and teardown hooks                     |                  |              |
| [no-export](docs/rules/no-export.md)                                   | Prevent exporting from test files                               | ![recommended][] |              |
| [no-focused-tests](docs/rules/no-focused-tests.md)                     | Disallow focused tests                                          | ![recommended][] | ![fixable][] |
| [no-hooks](docs/rules/no-hooks.md)                                     | Disallow setup and teardown hooks                               |                  |              |
| [no-identical-title](docs/rules/no-identical-title.md)                 | Disallow identical titles                                       | ![recommended][] |              |
| [no-if](docs/rules/no-if.md)                                           | Disallow conditional logic                                      |                  |              |
| [no-jasmine-globals](docs/rules/no-jasmine-globals.md)                 | Disallow Jasmine globals                                        | ![recommended][] | ![fixable][] |
| [no-jest-import](docs/rules/no-jest-import.md)                         | Disallow importing Jest                                         | ![recommended][] |              |
| [no-large-snapshots](docs/rules/no-large-snapshots.md)                 | disallow large snapshots                                        |                  |              |
| [no-mocks-import](docs/rules/no-mocks-import.md)                       | Disallow manually importing from **mocks**                      | ![recommended][] |              |
| [no-restricted-matchers](docs/rules/no-restricted-matchers.md)         | Disallow specific matchers & modifiers                          |                  |              |
| [no-standalone-expect](docs/rules/no-standalone-expect.md)             | Prevents expects that are outside of an it or test block.       | ![recommended][] |              |
| [no-test-callback](docs/rules/no-test-callback.md)                     | Avoid using a callback in asynchronous tests                    | ![recommended][] | ![fixable][] |
| [no-test-prefixes](docs/rules/no-test-prefixes.md)                     | Use `.only` and `.skip` over `f` and `x`                        | ![recommended][] | ![fixable][] |
| [no-test-return-statement](docs/rules/no-test-return-statement.md)     | Disallow explicitly returning from tests                        |                  |              |
| [no-try-expect](docs/rules/no-try-expect.md)                           | Prefer using toThrow for exception tests                        | ![recommended][] |              |
| [prefer-called-with](docs/rules/prefer-called-with.md)                 | Suggest using `toBeCalledWith()` OR `toHaveBeenCalledWith()`    |                  |              |
| [prefer-expect-assertions](docs/rules/prefer-expect-assertions.md)     | Suggest using `expect.assertions()` OR `expect.hasAssertions()` |                  |              |
| [prefer-hooks-on-top](docs/rules/prefer-hooks-on-top.md)               | Suggest to have all hooks at top level                          |                  |              |
| [prefer-spy-on](docs/rules/prefer-spy-on.md)                           | Suggest using `jest.spyOn()`                                    |                  | ![fixable][] |
| [prefer-strict-equal](docs/rules/prefer-strict-equal.md)               | Suggest using toStrictEqual()                                   |                  | ![fixable][] |
| [prefer-to-be-null](docs/rules/prefer-to-be-null.md)                   | Suggest using `toBeNull()`                                      | ![style][]       | ![fixable][] |
| [prefer-to-be-undefined](docs/rules/prefer-to-be-undefined.md)         | Suggest using `toBeUndefined()`                                 | ![style][]       | ![fixable][] |
| [prefer-to-contain](docs/rules/prefer-to-contain.md)                   | Suggest using `toContain()`                                     | ![style][]       | ![fixable][] |
| [prefer-to-have-length](docs/rules/prefer-to-have-length.md)           | Suggest using `toHaveLength()`                                  | ![style][]       | ![fixable][] |
| [prefer-todo](docs/rules/prefer-todo.md)                               | Suggest using `test.todo`                                       |                  | ![fixable][] |
| [require-to-throw-message](docs/rules/require-to-throw-message.md)     | Require a message for `toThrow()`                               |                  |              |
| [require-top-level-describe](docs/rules/require-top-level-describe.md) | Prevents test cases and hooks to be outside of a describe block |                  |              |
| [valid-describe](docs/rules/valid-describe.md)                         | Enforce valid `describe()` callback                             | ![recommended][] |              |
| [valid-expect](docs/rules/valid-expect.md)                             | Enforce valid `expect()` usage                                  | ![recommended][] |              |
| [valid-expect-in-promise](docs/rules/valid-expect-in-promise.md)       | Enforce having return statement when testing with promises      | ![recommended][] |              |
| [valid-title](docs/rules/valid-title.md)                               | Enforce valid titles                                            |                  | ![fixable][] |

<!-- end rules list -->

## Credit

- [eslint-plugin-mocha](https://github.com/lo1tuma/eslint-plugin-mocha)
- [eslint-plugin-jasmine](https://github.com/tlvince/eslint-plugin-jasmine)

## Related Projects

### eslint-plugin-jest-formatting

This project aims to provide formatting rules (auto-fixable where possible) to
ensure consistency and readability in jest test suites.

https://github.com/dangreenisrael/eslint-plugin-jest-formatting

[recommended]: https://img.shields.io/badge/-recommended-lightgrey.svg
[fixable]: https://img.shields.io/badge/-fixable-green.svg
[style]: https://img.shields.io/badge/-style-blue.svg
