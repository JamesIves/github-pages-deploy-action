# Contributing	

When contributing to this repository, please first discuss the change you wish to make via issue,	
email, or any other method with the owners of this repository before making a change. 	

## Pull Request Best Practices	

1. Ensure that you've tested your feature/change yourself. As the primary focus of this project is deployment, providing a link to a deployed repository using your branch is preferred. You can reference the forked action using your GitHub username, for example `yourname/github-pages-deplpy-action@master`.	
2. Make sure you update the README if you've made a change that requires documentation.	
3. When making a pull request, highlight any areas that may cause a breaking change so the maintainer can update the version number accordingly on the GitHub marketplace.
4. Make sure you've formatted and linted your code. You can do this by running `yarn format` and `yarn lint`. 
5. Fix or add any tests where applicable. You can run `yarn test` to run the suite.

# Deploying

In order to deploy and test your own fork of this action, you must commit the required `node_modules` dependencies. Be sure to run `nvm use` before installing any dependencies. You can learn more about nvm [here](https://github.com/nvm-sh/nvm/blob/master/README.md).

To do this you can follow the instructions below:

Install the project:

```
yarn install
```

Comment out the following in distribution branches:

```
# node_modules/
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

The `node_modules` folder should _not_ be included when making a pull request. These are only required for GitHub Actions when it consumes the distribution branch branch, the `dev` branch of the project should be free from any dependencies or lib files. 
