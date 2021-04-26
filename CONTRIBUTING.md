# Contributing ✏️

When contributing to this repository, please first discuss the change you wish to make via issue,
[email, or any other method with the owners of this repository](https://jamesiv.es) before making a change. If you are planning to work on an issue that already exists please let us know before writing any code incase it's already in flight!

## Before Making a Pull Request 🎒

1. Ensure that you've tested your feature/change yourself. As the primary focus of this project is deployment, providing a link to a deployed repository using your branch is preferred. You can reference the forked action using your GitHub username, for example `yourname/github-pages-deplpy-action@dev`.
2. Ensure your change passes all of the integration tests.
3. Make sure you update the README if you've made a change that requires documentation.
4. When making a pull request, highlight any areas that may cause a breaking change so the maintainer can update the version number accordingly on the GitHub marketplace and package registries.
5. Make sure you've formatted and linted your code. You can do this by running `yarn format` and `yarn lint`.
6. Fix or add any tests where applicable. You can run `yarn test` to run the suite. As this action is small in scope it's important that a high level of test coverage is maintained. All tests are written using [Jest](https://jestjs.io/).
7. As this package is written in [TypeScript](https://www.typescriptlang.org/) please ensure all typing is accurate and the action compiles correctly by running `yarn build`.

## Deploying 🚚

In order to deploy and test your own fork of this action, you must commit the `node_modules` dependencies. Be sure to run `nvm use` before installing any dependencies. You can learn more about nvm [here](https://github.com/nvm-sh/nvm/blob/master/README.md).

To do this you can follow the instructions below:

Install the project:

```
yarn install
```

Comment out the following in distribution branches:

```
# node_modules/
# lib/
```

Build the project:

```
yarn build
```

Commit:

```
$ git checkout -b branchnamehere
$ git commit -a -m "prod dependencies"
```

The `node_modules` and `lib` folders should _not_ be included when making a pull request. These are only required for GitHub Actions when it consumes the distribution branch, the `dev` branch of the project should be free from any dependencies or lib files.

## Resources 💡

- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [GitHub Actions Documentation](https://help.github.com/en/actions)
