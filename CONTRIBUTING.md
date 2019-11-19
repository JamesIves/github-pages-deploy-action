# Contributing	

When contributing to this repository, please first discuss the change you wish to make via issue,	
email, or any other method with the owners of this repository before making a change. 	

## Pull Request Best Practices	

1. Ensure that you've tested your feature/change yourself. As the primary focus of this project is deployment, providing a link to a deployed repository using your branch is preferred. You can reference the forked action using your GitHub username, for example `yourname/github-pages-deplpy-action@master`.	
2. Make sure you update the README if you've made a change that requires documentation.	
3. When making a pull request, highlight any areas that may cause a breaking change so the maintainer can update the version number accordingly on the GitHub marketplace.

# Deploying

In order to deploy and test your own fork of this action, you must commit the required `node_modules` dependencies. 

To do this you can follow the instructions below:

```
# comment out in distribution branches
# node_modules/
```

```
$ git checkout -b branchnamehere
$ git commit -a -m "prod dependencies"
```

The `node_modules` folder should _not_ be included when making a pull request.