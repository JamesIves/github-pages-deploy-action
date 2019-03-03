# Github Pages Deploy Action :rocket: 

This Github action will handle the building and deploying process of your project to Github pages. It can be configured to upload your production ready code into any branch you'd like, including `gh-pages` and `docs`.

## Getting Started :airplane:
Before you get started you must first create a fresh branch where the action will deploy the files to. You can replace `gh-pages` with whatever branch you'd like to use below. This will create a new orphaned branch which is what Github Pages require.

```git
git checkout --orphan gh-pages
git rm -rf .
touch README.md
git add README.md
git commit -m 'Initial gh-pages commit'
git push origin gh-pages
```

Once setup you can then include the action in your workflow to trigger on any built in event that Github supports.

```
action "Deploy to Github Pages" {
  uses = "JamesIves/github-pages-deploy-action@master"
  env = {
    BUILD_SCRIPT = "npm install && npm run-script build"
    BRANCH = "gh-pages"
    FOLDER = "build"
    COMMIT_EMAIL = "example@jives.dev"
    COMMIT_NAME = "James Ives"
  }
  secrets = ["GITHUB_TOKEN"]
}
```

## Configuration 📁

The `env` portion of the workflow must be configured before the action will work. Below you'll find a description of each one does.

| Key  | Value Information | Required |
| ------------- | ------------- | ------------- |
| `BUILD_SCRIPT`  | If you require a build script to compile your code prior to pushing it you can add the script here. The Docker container which powers the action runs Node.  | **No** |
| `BRANCH`  | This is the branch you wish to deploy to, for example `gh-pages` or `docs`.  | **Yes** |
| `FOLDER`  | The folder in your repository that you want to deploy. If your build script compiles into a directory named `build` you'd put it in here.  | **Yes** |
| `COMMIT_NAME`  | Used to sign the commit, this should be your name.   | **No** |
| `COMMIT_EMAIL`  | Used to sign the commit, this should be your email. | **No** |
