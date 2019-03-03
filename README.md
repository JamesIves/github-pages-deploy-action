# GitHub Pages Deploy Action :rocket: 

[![View Action](https://img.shields.io/badge/view-action-blue.svg)](https://github.com/marketplace/actions/deploy-to-github-pages) [![Issues](https://img.shields.io/github/issues/JamesIves/github-pages-deploy-action.svg)](https://github.com/JamesIves/github-pages-deploy-action/issues)

This [GitHub action](https://github.com/features/actions) will handle the building and deploying process of your project to [GitHub Pages](https://pages.github.com/). It can be configured to upload your production ready code into any branch you'd like, including `gh-pages` and `docs`.

## Getting Started :airplane:
Before you get started you must first create a fresh branch where the action will deploy the files to. You can replace `gh-pages` with whatever branch you'd like to use in the example below.

```git
git checkout --orphan gh-pages
git rm -rf .
touch README.md
git add README.md
git commit -m 'Initial gh-pages commit'
git push origin gh-pages
```

Once setup you can then include the action in your workflow to trigger on any event that [GitHub actions](https://github.com/features/actions) supports.

```
action "Deploy to GitHub Pages" {
  uses = "JamesIves/github-pages-deploy-action@master"
  env = {
    BUILD_SCRIPT = "npm install && npm run-script build"
    BRANCH = "gh-pages"
    FOLDER = "build"
    COMMIT_EMAIL = "github-pages-deployer@jives.dev"
    COMMIT_NAME = "GitHub Pages Deployer"
  }
  secrets = ["GITHUB_TOKEN"]
}
```

## Configuration 📁

The `env` portion of the workflow **must** be configured before the action will work. Below you'll find a description of what each one does.

| Key  | Value Information | Required |
| ------------- | ------------- | ------------- |
| `BUILD_SCRIPT`  | If you require a build script to compile your code prior to pushing it you can add the script here. The Docker container which powers the action runs Node which means `npm` commands are valid. If you're using a static site generator such as Jekyll I'd suggest building the code prior to pushing it to your base branch.  | **No** |
| `BRANCH`  | This is the branch you wish to deploy to, for example `gh-pages` or `docs`.  | **Yes** |
| `BASE_BRANCH`  | The base branch of your repository which you'd like to checkout prior to deploying. This defaults to `master`.  | **No** |
| `FOLDER`  | The folder in your repository that you want to deploy. If your build script compiles into a directory named `build` you'd put it here.  | **Yes** |
| `COMMIT_NAME`  | Used to sign the commit, this should be your name. Defaults to `gh-pages-deploy@jives.dev`  | **No** |
| `COMMIT_EMAIL`  | Used to sign the commit, this should be your email. Defaults to `GitHub Pages Deployer` | **No** |

![Example](screenshot.png)
