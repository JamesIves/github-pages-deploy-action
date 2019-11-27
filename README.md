# GitHub Pages Deploy Action :rocket: 

[![Build Status](https://github.com/JamesIves/github-pages-deploy-action/workflows/unit-tests/badge.svg)](https://github.com/JamesIves/github-pages-deploy-action/actions)  [![Actions Status](https://github.com/JamesIves/github-pages-deploy-action/workflows/integration-tests/badge.svg)](https://github.com/JamesIves/github-pages-deploy-action/actions) [![View Action](https://img.shields.io/badge/view-action-blue.svg?logo=github&color=orange)](https://github.com/marketplace/actions/deploy-to-github-pages) [![Version](https://img.shields.io/github/v/release/JamesIves/github-pages-deploy-action.svg?logo=github)](https://github.com/JamesIves/github-pages-deploy-action/releases) 

This [GitHub action](https://github.com/features/actions) will handle the  deploy process of your project to [GitHub Pages](https://pages.github.com/). It can be configured to upload your production-ready code into any branch you'd like, including `gh-pages` and `docs`.

## Getting Started :airplane:
You can include the action in your workflow to trigger on any event that [GitHub actions supports](https://help.github.com/en/articles/events-that-trigger-workflows). If the remote branch that you wish to deploy to doesn't already exist the action will create it for you. Your workflow will also need to include the `actions/checkout` step before this workflow runs in order for the deployment to work.

You can view an example of this below.

```yml
name: Build and Deploy
on: [push]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v1

    - name: Build and Deploy
      uses: JamesIves/github-pages-deploy-action@releases/v3
      with:
        ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
        BASE_BRANCH: master # The branch the action should deploy from.
        BRANCH: gh-pages # The branch the action should deploy to.
        FOLDER: build # The folder the action should deploy.
```

If you'd like to make it so the workflow only triggers on push events to specific branches then you can modify the `on` section. You'll still need to specify a `BASE_BRANCH` if you're deploying from a branch other than `master`.

```yml
on:
  push:	
    branches:	
      - master
```

#### Operating System Support 💿

This action is primarily developed using [Ubuntu](https://ubuntu.com/). [In your workflow job configuration](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idruns-on) it's reccomended to set the `runs-on` property to `ubuntu-latest`.

```yml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
```

Operating systems such as [Windows](https://www.microsoft.com/en-us/windows/) are not currently supported, however you can workaround this using [artifacts](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/persisting-workflow-data-using-artifacts). In your workflow configuration you can utilize the `actions/upload-artifact` and `actions/download-artifact` actions to move your project built on a Windows job to a secondary job that will handle the deployment. 

<details><summary>You can view an example of this pattern here.</summary>
<p>

```yml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: windows-latest # The first job utilizes windows-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
        
      - name: Install # The project is built using npm and placed in the 'build' folder.
        run: |
          npm install
          npm run-script build
          
      - name: Upload Artifacts # The project is then uploaded as an artifact named 'site'.
        uses: actions/upload-artifact@v1
        with:
          name: site
          path: build
          
  deploy:
    needs: [build] # The second job must depend on the first one to complete before running, and uses ubuntu-latest instead of windows.
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
 
      - name: Download Artifacts # The built project is downloaded into the 'site' folder.
        uses: actions/download-artifact@v1
        with:
          name: site

      - name: Build and Deploy
        uses: JamesIves/github-pages-deploy-action@releases/v3
        with:
          ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          BRANCH: gh-pages
          FOLDER: 'site' # The deployment folder should match the name of the artifact. Even though our project builds into the 'build' folder the artifact name of 'site' must be placed here.
```
</p>
</details>

## Configuration 📁

The `with` portion of the workflow **must** be configured before the action will work. You can add these in the `with` section found in the examples above. Any `secrets` must be referenced using the bracket syntax and stored in the GitHub repositories `Settings/Secrets` menu. You can learn more about setting environment variables with GitHub actions [here](https://help.github.com/en/articles/workflow-syntax-for-github-actions#jobsjob_idstepsenv).

Below you'll find a description of what each option does.

| Key  | Value Information | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `ACCESS_TOKEN`  | Depending on the repository permissions you may need to provide the action with a GitHub personal access token instead of the provided GitHub token in order to deploy. You can [learn more about how to generate one here](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). **This should be stored as a secret**. | `secrets / with` | **Yes** |
| `GITHUB_TOKEN`  | In order for GitHub to trigger the rebuild of your page you must provide the action with the repositories provided GitHub token. This can be referenced in the workflow `yml` file by using `${{ secrets.GITHUB_TOKEN }}`. Only required if an access token is **not** provided. **Please note there is currently an issue affecting the use of this token, [you can learn more here](https://github.com/JamesIves/github-pages-deploy-action/issues/5)**. | `secrets / with` | **Yes** |
| `BRANCH`  | This is the branch you wish to deploy to, for example `gh-pages` or `docs`.  | `with` | **Yes** |
| `FOLDER`  | The folder in your repository that you want to deploy. If your build script compiles into a directory named `build` you'd put it here. **Folder paths cannot have a leading `/` or `./`**. If you wish to deploy the root directory you can place a `.` here. | `with` | **Yes** |
| `BASE_BRANCH`  | The base branch of your repository which you'd like to checkout prior to deploying. This defaults to `master`.  | `with` | **No** |
| `CLEAN`  | If your project generates hashed files on build you can use this option to automatically delete them from the deployment branch with each deploy. This option can be toggled on by setting it to `true`.  | `with` | **No** |

With the action correctly configured you should see the workflow trigger the deployment under the configured conditions.

### Additional Build Files

This action maintains the full Git history of the deployment branch. Therefore if you're using a custom domain and require a `CNAME` file, or if you require the use of a `.nojekyll` file, you can safely commit these files directly into deployment branch without them being overridden after each deployment.

![Example](screenshot.png)
