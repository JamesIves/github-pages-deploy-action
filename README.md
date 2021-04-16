<p align="center">
  <a href="https://github.com/marketplace/actions/deploy-to-github-pages">
    <img alt="" width="300px" src="https://github.com/JamesIves/github-pages-deploy-action/raw/dev-v4/assets/icon.png">
  </a>
</p>

<h1 align="center">
  GitHub Pages Deploy Action :rocket:
</h1>

<p align="center">
  <a href="https://github.com/JamesIves/github-pages-deploy-action/actions">
    <img src="https://github.com/JamesIves/github-pages-deploy-action/workflows/unit-tests/badge.svg" alt="Unit test status badge">
  </a>
  
  <a href="https://github.com/JamesIves/github-pages-deploy-action/actions">
    <img src="https://github.com/JamesIves/github-pages-deploy-action/workflows/integration-tests/badge.svg" alt="Integration test status badge">
  </a>
  
  <a href="https://codecov.io/gh/JamesIves/github-pages-deploy-action/branch/dev">
    <img src="https://codecov.io/gh/JamesIves/github-pages-deploy-action/branch/dev/graph/badge.svg" alt="Code coverage status badge">
  </a>
  
  <a href="https://github.com/JamesIves/github-pages-deploy-action/releases">
    <img src="https://img.shields.io/github/v/release/JamesIves/github-pages-deploy-action.svg?logo=github" alt="Release version badge">
  </a>
  
  <a href="https://github.com/marketplace/actions/deploy-to-github-pages">
    <img src="https://img.shields.io/badge/action-marketplace-blue.svg?logo=github&color=orange" alt="Github marketplace badge">
  </a>
</p>

<p align="center">
  This <a href="https://github.com/features/actions">GitHub Action</a> will automatically deploy your project to <a href="https://pages.github.com/">GitHub Pages</a>. It can be configured to push your production-ready code into any branch you'd like, including <b>gh-pages</b> and <b>docs</b>. It can also handle cross repository deployments and works with <a href="https://github.com/enterprise">GitHub Enterprise</a> too.
</p>

<p align="center">
  <img src="https://github.com/JamesIves/github-pages-deploy-action/raw/dev-v4/assets/screenshot.png">
</p>

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
      - name: Checkout 🛎️
        uses: actions/checkout@v2.3.1

      - name: Install and Build 🔧 # This example project is built using npm and outputs the result to the 'build' folder. Replace with the commands required to build your project, or remove this step entirely if your site is pre-built.
        run: |
          npm install
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.1
        with:
          branch: gh-pages # The branch the action should deploy to.
          folder: build # The folder the action should deploy.
```

If you'd like to make it so the workflow only triggers on push events to specific branches then you can modify the `on` section.

```yml
on:
  push:
    branches:
      - main
```

It's recommended that you use [Dependabot](https://dependabot.com/github-actions/) to keep your workflow up-to-date. You can find the latest tagged version on the [GitHub Marketplace](https://github.com/marketplace/actions/deploy-to-github-pages) or on the [releases page](https://github.com/JamesIves/github-pages-deploy-action/releases).

#### Install as a Node Module 📦

If you'd like to use the functionality provided by this action in your own action you can install it using [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/get-npm) by running the following commands. It's available on both the [npm](https://www.npmjs.com/package/@jamesives/github-pages-deploy-action) and [GitHub registry](https://github.com/JamesIves/github-pages-deploy-action/packages/229985). 

```
yarn add @jamesives/github-pages-deploy-action
```

```
npm install @jamesives/github-pages-deploy-action
```

It can then be imported into your project like so.

```javascript
import run from "github-pages-deploy-action";
```

Calling the functions directly will require you to pass in an object containing the variables found in the configuration section, you'll also need to provide a `workspace` with a path to your project.

```javascript
import run from "github-pages-deploy-action";

run({
  token: process.env["ACCESS_TOKEN"],
  branch: "gh-pages",
  folder: "build",
  repositoryName: "JamesIves/github-pages-deploy-action",
  silent: true,
  workspace: "src/project/location",
});
```

For more information regarding the [action interface please click here](https://github.com/JamesIves/github-pages-deploy-action/blob/dev/src/constants.ts#L7). 

## Configuration 📁

The `with` portion of the workflow **must** be configured before the action will work. You can add these in the `with` section found in the examples above. Any `secrets` must be referenced using the bracket syntax and stored in the GitHub repository's `Settings/Secrets` menu. You can learn more about setting environment variables with GitHub actions [here](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets).

#### Required Setup

The following options must be configured in order to make a deployment.

| Key      | Value Information                                                                                                                                                                                                                                             | Type   | Required |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| `branch` | This is the branch you wish to deploy to, for example `gh-pages` or `docs`.                                                                                                                                                                                   | `with` | **Yes**  |
| `folder` | The folder in your repository that you want to deploy. If your build script compiles into a directory named `build` you'd put it here. If you wish to deploy the root directory you can place a `.` here. You can also utilize absolute file paths by appending `~` to your folder path. | `with` | **Yes**  |

By default the action does not need any token configuration and uses the provided repository scoped GitHub token to make the deployment. If you require more customization you can modify the deployment type using the following options.

| Key            | Value Information                                                                                                                                                                                                                                                                                                                                                                                                                                              | Type             | Required |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------- |
| `token` | This option defaults to the repository scoped GitHub Token. However if you need more permissions for things such as deploying to another repository, you can add a Personal Access Token (PAT) here. This should be stored in the `secrets / with` menu **as a secret**. We recommend using a service account with the least permissions necessary and recommend when generating a new PAT that you select the least permission scopes necessary. [Learn more about creating and using encrypted secrets here.](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)  | `with` | **No**  |
| `ssh-key`          | You can configure the action to deploy using SSH by setting this option to a private SSH key stored **as a secret**. It can also be set to `true` to use an existing SSH client configuration. For more detailed information on how to add your public/private ssh key pair please refer to the [Using a Deploy Key section of this README](https://github.com/JamesIves/github-pages-deploy-action/tree/dev#using-an-ssh-deploy-key-).                                                                                                                                                            | `with`           | **No**  |

#### Optional Choices

| Key                | Value Information                                                                                                                                                                                                                                                                                                                                     | Type   | Required |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| `git-config-name`  | Allows you to customize the name that is attached to the git config which is used when pushing the deployment commits. If this is not included it will use the name in the GitHub context, followed by the name of the action.                                                                                                                     | `with` | **No**   |
| `git-config-email` | Allows you to customize the email that is attached to the git config which is used when pushing the deployment commits. If this is not included it will use the email in the GitHub context, followed by a generic noreply GitHub email.                                                                                                           | `with` | **No**   |
| `repository-name`       | Allows you to specify a different repository path so long as you have permissions to push to it. This should be formatted like so: `JamesIves/github-pages-deploy-action`. You'll need to use a PAT in the `token` input for this configuration option to work properly.                                                                                                                                                                          | `with` | **No**   |
| `target-folder`    | If you'd like to push the contents of the deployment folder into a specific directory on the deployment branch you can specify it here.                                                                                                                                                                                                               | `with` | **No**   |
| `commit-message`   | If you need to customize the commit message for an integration you can do so.                                                                                                                                                                                                                                                                         | `with` | **No**   |
| `clean`            | If your project generates hashed files on build you can use this option to automatically delete them from the target folder on the deployment branch with each deploy. This option is turned on by default, and can be toggled off by setting it to `false`.                                                                                                                                              | `with` | **No**   |
| `clean-exclude`    | If you need to use `clean` but you'd like to preserve certain files or folders you can use this option. This should contain each pattern as a single line in a multiline string.                                                                                                                                       | `with` | **No**   |
| `dry-run`          | Do not actually push back, but use `--dry-run` on `git push` invocations instead.                                                                                                               | `with` | **No**   |
| `single-commit`        | This option can be toggled to `true` if you'd prefer to have a single commit on the deployment branch instead of maintaining the full history. **Using this option will also cause any existing history to be wiped from the deployment branch**.                                                                                                                                            | `with` | **No**   |
| `silent`        | Silences the action output preventing it from displaying git messages.                                                                                                                            | `with` | **No**   |
| `workspace`        | This should point to where your project lives on the virtual machine. The GitHub Actions environment will set this for you. It is only necessary to set this variable if you're using the node module.                                                                                                                                               | `with` | **No**   |

With the action correctly configured you should see the workflow trigger the deployment under the configured conditions.

#### Deployment Status

The action will export an environment variable called `deployment_status` that you can use in your workflow to determine if the deployment was successful or not. You can find an explanation of each status type below.

| Status        | Description           |
| ------------- |-------------|
| `success`      | The `success` status indicates that the action was able to successfully deploy to the branch. |
| `failed`      | The `failed` status indicates that the action encountered an error while trying to deploy.      |
| `skipped` | The `skipped` status indicates that the action exited early as there was nothing new to deploy.      |

This value is also set as a step output as `deployment-status`.

---

### Using an SSH Deploy Key 🔑

If you'd prefer to use an SSH deploy key as opposed to a token you must first generate a new SSH key by running the following terminal command, replacing the email with one connected to your GitHub account.

```bash
ssh-keygen -t rsa -m pem -b 4096 -C "youremailhere@example.com" -N ""
```

Once you've generated the key pair you must add the contents of the public key within your repository's [deploy keys menu](https://developer.github.com/v3/guides/managing-deploy-keys/). You can find this option by going to `Settings > Deploy Keys`, you can name the public key whatever you want, but you **do** need to give it write access. Afterwards add the contents of the private key to the `Settings > Secrets` menu as `DEPLOY_KEY`.

With this configured you can then set the `ssh-key` part of the action to your private key stored as a secret.

```yml
- name: Deploy 🚀
  uses: JamesIves/github-pages-deploy-action@4.1.1
  with:
    branch: gh-pages
    folder: site
    ssh-key: ${{ secrets.DEPLOY_KEY }}
```

<details><summary>You can view a full example of this here.</summary>
<p>

```yml
name: Build and Deploy
on:
  push:
    branches:
      - master
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2.3.1

      - name: Install and Build 🔧 # This example project is built using npm and outputs the result to the 'build' folder. Replace with the commands required to build your project, or remove this step entirely if your site is pre-built.
        run: |
          npm install
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.1
        with:
          branch: gh-pages
          folder: build
          clean: true
          clean-exclude: |
            special-file.txt
            some/*.txt
          ssh-key: ${{ secrets.DEPLOY_KEY }}
```

</p>
</details>

Alternatively if you've already configured the SSH client within a previous step you can set the `ssh-key` option to `true` to allow it to deploy using an existing SSH client. Instead of adjusting the client configuration it will simply switch to using GitHub's SSH endpoints.

---

### Operating System Support 💿

This action is primarily developed using [Ubuntu](https://ubuntu.com/). [In your workflow job configuration](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idruns-on) it's recommended to set the `runs-on` property to `ubuntu-latest`.

```yml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
```

If you're using an operating system such as [Windows](https://www.microsoft.com/en-us/windows/) you can workaround this using [artifacts](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/persisting-workflow-data-using-artifacts). In your workflow configuration you can utilize the `actions/upload-artifact` and `actions/download-artifact` actions to move your project built on a Windows job to a secondary job that will handle the deployment.

<details><summary>You can view an example of this pattern here.</summary>
<p>

```yml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: windows-latest # The first job utilizes windows-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2.3.1

      - name: Install and Build 🔧 # This example project is built using npm and outputs the result to the 'build' folder. Replace with the commands required to build your project, or remove this step entirely if your site is pre-built.
        run: |
          npm install
          npm run build

      - name: Upload Artifacts 🔺 # The project is then uploaded as an artifact named 'site'.
        uses: actions/upload-artifact@v1
        with:
          name: site
          path: build

  deploy:
    needs: [build] # The second job must depend on the first one to complete before running, and uses ubuntu-latest instead of windows.
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2.3.1

      - name: Download Artifacts 🔻 # The built project is downloaded into the 'site' folder.
        uses: actions/download-artifact@v1
        with:
          name: site

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.1
        with:
          token: ${{ secrets.ACCESS_TOKEN }}
          branch: gh-pages
          folder: "site" # The deployment folder should match the name of the artifact. Even though our project builds into the 'build' folder the artifact name of 'site' must be placed here.
```

</p>
</details>

---

### Using a Container 🚢

If you use a [container](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idcontainer) in your workflow you may need to run an additional step to install `rsync` as this action depends on it. You can view an example of this below.

```yml
- name: Install rsync 📚
  run: |
    apt-get update && apt-get install -y rsync

- name: Deploy 🚀
  uses: JamesIves/github-pages-deploy-action@4.1.1
```

---

### Additional Build Files 📁

If you're using a custom domain and require a `CNAME` file, or if you require the use of a `.nojekyll` file, you can safely commit these files directly into deployment branch without them being overridden after each deployment, additionally you can include these files in your deployment folder to update them. If you need to add additional files to the deployment that should be ignored by the build clean-up steps you can utilize the `clean-exclude` option.

<details><summary>Click here to view an example of this.</summary>
<p>

```yml
name: Build and Deploy
on:
  push:
    branches:
      - master
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2.3.1

      - name: Install and Build 🔧 # This example project is built using npm and outputs the result to the 'build' folder. Replace with the commands required to build your project, or remove this step entirely if your site is pre-built.
        run: |
          npm install
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@4.1.1
        with:
          branch: gh-pages
          folder: build
          clean: true
          clean-exclude: |
            special-file.txt
            some/*.txt
```
</p>
</details>

If you wish to remove these files you must go into the deployment branch directly to remove them. This is to prevent accidental changes in your deployment script from creating breaking changes.

---

## Support 💖

This project would not be possible without all of our fantastic [contributors](https://github.com/JamesIves/github-pages-deploy-action/graphs/contributors).

If you'd like to support the maintenance and upkeep of this project you can [donate via GitHub Sponsors](https://github.com/sponsors/JamesIves). This project is distributed under the [MIT](https://github.com/JamesIves/github-pages-deploy-action/blob/dev/LICENSE) license, and the project logo was created by [Paganini](https://twitter.com/paganiniart).
