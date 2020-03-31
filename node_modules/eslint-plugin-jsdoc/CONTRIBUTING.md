# CONTRIBUTING to eslint-plugin-jsdoc

## Testing changes locally

You might try a TDD approach and add tests within the `test` directory,
to try different configs, you may find it easier to try out changes in
a separate local directory.

You can run [`npm link`](https://docs.npmjs.com/cli/link) for this purpose,
pointing from your project to this project. For example, while in your project
root and with `eslint-plugin-jsdoc` as a sibling, run:

```shell
npm link ../eslint-plugin-jsdoc
```

## Building the project

After running `npm install` to get the latest dependencies and devDependencies,
you can run the following command to update the `dist` files, with `dist/index.js`
being the `main` entrance point from `package.json`:

```shell
npm run build
```

## Coding standards

The project follows ESLint rules from [`canonical`](https://www.npmjs.com/package/eslint-config-canonical)
and testing follows its subconfig, `canonical/mocha`.

## Testing

Tests are expected. Each rule file should be in CamelCase (despite the rule names themselves being hyphenated) and should be added within `test/assertions` and then imported/required by
`test/rules/index.js`.

Each rule file should be an ESM default export of an object which has `valid` and `invalid` array properties containing the tests. Tests of each type should be provided.

`parserOptions` will be `ecmaVersion: 6` by default, but tests can override `parserOptions`
with their own.

See ESLint's [RuleTester](https://eslint.org/docs/developer-guide/nodejs-api#ruletester)
for more on the allowable properties (e.g., `code`, `errors` (for invalid rules),
`options`, `settings`, etc.).

Note that besides `npm test`, there is `npm run test-cov` which shows more
detailed information on coverage. Coverage should be maintained at 100%, and
if there are a few guards in place for future use, the code block in question
can be ignored by being preceded by `/* istanbul ignore next */` (including
for warnings where the block is never passed over (i.e., the block is always
entered)). If you want to test without coverage at all, you can use
`npm run test-no-cov`. To only test rules rather than other files, you
can use `npm run test-index`.

To test specific rules, you can supply a comma-separated list with the `--rule`
flag passed to `test-index`, e.g., for `check-examples` and `require-example`:

`npm run --rule=check-examples,require-example test-index`.

You can further limit this by providing `--invalid` and/or `--valid` flags
with a comma-separated list of 0-based indexes that you wish to include (also
accepts negative offsets from the end, e.g., `-1` for the last item). For
example, to check the first and third invalid tests of `check-examples`
alon with the second valid test, you can run:

`npm run --rule=check-examples --invalid=0,2 --valid=1 test-index`.

## Requirements for PRs

PRs should be mergeable, [rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
first against the latest `master`.

The number of commits will ideally be limited in number, unless extra commits
can better show a progression of features.

Commit messages should be worded clearly and the reason for any PR made clear
by linking to an issue or giving a full description of what it achieves.

## Merging

We use [semantic-release](https://github.com/semantic-release/semantic-release)
for preparing releases, so the commit messages (or at least the merge that
brings them into `master`) must follow the
[AngularJS commit guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines) with a special format such as `feat: describe new feature`
in order for the releasing to occur and for the described items to be added
to the release notes.
