import {info} from '@actions/core'
import {mkdirP, rmRF} from '@actions/io'
import fs from 'fs'
import {
  ActionInterface,
  DefaultExcludedFiles,
  Status,
  TestFlag
} from './constants'
import {execute} from './execute'
import {generateWorktree} from './worktree'
import {
  extractErrorMessage,
  isNullOrUndefined,
  suppressSensitiveInformation
} from './util'

/* Initializes git in the workspace. */
export async function init(action: ActionInterface): Promise<void | Error> {
  try {
    info(`Deploying using ${action.tokenType}… 🔑`)
    info('Configuring git…')

    await execute(`git init`, action.workspace, action.silent)

    await execute(
      `git commit -m "Initial commit" --allow-empty`,
      action.workspace,
      action.silent
    )

    await execute(
      `git config --global --add safe.directory "${action.workspace}"`,
      action.workspace,
      action.silent
    )

    await execute(
      `git config user.name "${action.name}"`,
      action.workspace,
      action.silent
    )

    await execute(
      `git config user.email "${action.email}"`,
      action.workspace,
      action.silent
    )

    await execute(
      `git config core.ignorecase false`,
      action.workspace,
      action.silent
    )

    try {
      if ((process.env.CI && !action.sshKey) || action.isTest) {
        /* Ensures that previously set Git configs do not interfere with the deployment.
          Only runs in the GitHub Actions CI environment if a user is not using an SSH key.
        */
        await execute(
          `git config --local --unset-all http.https://${action.hostname}/.extraheader`,
          action.workspace,
          action.silent
        )
      }

      if (action.isTest === TestFlag.UNABLE_TO_UNSET_GIT_CONFIG) {
        throw new Error()
      }
    } catch {
      info(
        'Unable to unset previous git config authentication as it may not exist, continuing…'
      )
    }

    try {
      await execute(`git remote rm origin`, action.workspace, action.silent)

      if (action.isTest === TestFlag.UNABLE_TO_REMOVE_ORIGIN) {
        throw new Error()
      }
    } catch {
      info('Attempted to remove origin but failed, continuing…')
    }

    await execute(
      `git remote add origin ${action.repositoryPath}`,
      action.workspace,
      action.silent
    )
    info('Git configured… 🔧')
  } catch (error) {
    throw new Error(
      `There was an error initializing the repository: ${suppressSensitiveInformation(
        extractErrorMessage(error),
        action
      )} ❌`
    )
  }
}

/* Runs the necessary steps to make the deployment. */
export async function deploy(action: ActionInterface): Promise<Status> {
  const temporaryDeploymentDirectory =
    'github-pages-deploy-action-temp-deployment-folder'
  const temporaryDeploymentBranch = `github-pages-deploy-action/${Math.random()
    .toString(36)
    .substr(2, 9)}`

  info('Starting to commit changes…')

  try {
    const commitMessage = !isNullOrUndefined(action.commitMessage)
      ? (action.commitMessage as string)
      : `Deploying to ${action.branch}${
          process.env.GITHUB_SHA
            ? ` from @ ${process.env.GITHUB_REPOSITORY}@${process.env.GITHUB_SHA}`
            : ''
        } 🚀`

    // Checks to see if the remote exists prior to deploying.
    const branchExists =
      action.isTest & TestFlag.HAS_REMOTE_BRANCH ||
      Boolean(
        (
          await execute(
            `git ls-remote --heads ${action.repositoryPath} refs/heads/${action.branch}`,
            action.workspace,
            action.silent
          )
        ).stdout
      )

    await generateWorktree(action, temporaryDeploymentDirectory, branchExists)

    /* Relaxes permissions of folder due to be deployed so rsync can write to/from it. */
    try {
      await execute(
        `chmod -R +rw ${action.folderPath}`,
        action.workspace,
        action.silent
      )
    } catch {
      info(`Unable to modify permissions…`)
    }

    // Ensures that items that need to be excluded from the clean job get parsed.
    let excludes = ''
    if (action.clean && action.cleanExclude) {
      for (const item of action.cleanExclude) {
        excludes += `--exclude ${item} `
      }
    }

    if (action.targetFolder) {
      info(`Creating target folder if it doesn't already exist… 📌`)
      await mkdirP(`${temporaryDeploymentDirectory}/${action.targetFolder}`)
    }

    /*
      Pushes all of the build files into the deployment directory.
      Allows the user to specify the root if '.' is provided.
      rsync is used to prevent file duplication. */
    await execute(
      `rsync -q -av --checksum --progress ${action.folderPath}/. ${
        action.targetFolder
          ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
          : temporaryDeploymentDirectory
      } ${
        action.clean
          ? `--delete ${excludes} ${
              !fs.existsSync(
                `${action.folderPath}/${DefaultExcludedFiles.CNAME}`
              )
                ? `--exclude ${DefaultExcludedFiles.CNAME}`
                : ''
            } ${
              !fs.existsSync(
                `${action.folderPath}/${DefaultExcludedFiles.NOJEKYLL}`
              )
                ? `--exclude ${DefaultExcludedFiles.NOJEKYLL}`
                : ''
            }`
          : ''
      }  --exclude ${DefaultExcludedFiles.SSH} --exclude ${
        DefaultExcludedFiles.GIT
      } --exclude ${DefaultExcludedFiles.GITHUB} ${
        action.folderPath === action.workspace
          ? `--exclude ${temporaryDeploymentDirectory}`
          : ''
      }`,
      action.workspace,
      action.silent
    )

    if (action.singleCommit) {
      await execute(
        `git add --all .`,
        `${action.workspace}/${temporaryDeploymentDirectory}`,
        action.silent
      )
    }

    // Use git status to check if we have something to commit.
    // Special case is singleCommit with existing history, when
    // we're really interested if the diff against the upstream branch
    // changed.
    const checkGitStatus =
      branchExists && action.singleCommit
        ? `git diff origin/${action.branch}`
        : `git status --porcelain`

    info(`Checking if there are files to commit…`)

    const hasFilesToCommit =
      action.isTest & TestFlag.HAS_CHANGED_FILES ||
      Boolean(
        (
          await execute(
            checkGitStatus,
            `${action.workspace}/${temporaryDeploymentDirectory}`,
            true // This output is always silenced due to the large output it creates.
          )
        ).stdout
      )

    if (
      (!action.singleCommit && !hasFilesToCommit) ||
      // Ignores the case where single commit is true with a target folder to prevent incorrect early exiting.
      (action.singleCommit && !action.targetFolder && !hasFilesToCommit)
    ) {
      return Status.SKIPPED
    }

    // Commits to GitHub.
    await execute(
      `git add --all .`,
      `${action.workspace}/${temporaryDeploymentDirectory}`,
      action.silent
    )
    await execute(
      `git checkout -b ${temporaryDeploymentBranch}`,
      `${action.workspace}/${temporaryDeploymentDirectory}`,
      action.silent
    )
    await execute(
      `git commit -m "${commitMessage}" --quiet --no-verify`,
      `${action.workspace}/${temporaryDeploymentDirectory}`,
      action.silent
    )

    if (action.dryRun) {
      info(`Dry run complete`)
      return Status.SUCCESS
    }

    if (action.force) {
      // Force-push our changes, overwriting any changes that were added in
      // the meantime
      info(`Force-pushing changes...`)
      await execute(
        `git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
        `${action.workspace}/${temporaryDeploymentDirectory}`,
        action.silent
      )
    } else {
      const ATTEMPT_LIMIT = 3
      // Attempt to push our changes, but fetch + rebase if there were
      // other changes added in the meantime
      let attempt = 0

      // Keep track of whether the most recent attempt was rejected
      let rejected = false

      do {
        attempt++

        if (attempt > ATTEMPT_LIMIT) throw new Error(`Attempt limit exceeded`)

        // Handle rejection for the previous attempt first such that, on
        // the final attempt, time is not wasted rebasing it when it will
        // not be pushed
        if (rejected) {
          info(`Fetching upstream ${action.branch}…`)
          await execute(
            `git fetch ${action.repositoryPath} ${action.branch}:${action.branch}`,
            `${action.workspace}/${temporaryDeploymentDirectory}`,
            action.silent
          )
          info(`Rebasing this deployment onto ${action.branch}…`)
          await execute(
            `git rebase ${action.branch} ${temporaryDeploymentBranch}`,
            `${action.workspace}/${temporaryDeploymentDirectory}`,
            action.silent
          )
        }

        info(`Pushing changes… (attempt ${attempt} of ${ATTEMPT_LIMIT})`)

        const pushResult = await execute(
          `git push --porcelain ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
          `${action.workspace}/${temporaryDeploymentDirectory}`,
          action.silent,
          true // Ignore non-zero exit status
        )

        rejected =
          Boolean(action.isTest) ||
          pushResult.stdout.includes(`[rejected]`) ||
          pushResult.stdout.includes(`[remote rejected]`)

        if (rejected) info('Updates were rejected')

        // If the push failed for any reason other than being rejected,
        // there is a problem
        if (!rejected && pushResult.stderr) throw new Error(pushResult.stderr)
      } while (rejected)
    }

    info(`Changes committed to the ${action.branch} branch… 📦`)

    return Status.SUCCESS
  } catch (error) {
    throw new Error(
      `The deploy step encountered an error: ${suppressSensitiveInformation(
        extractErrorMessage(error),
        action
      )} ❌`
    )
  } finally {
    // Cleans up temporary files/folders and restores the git state.
    info('Running post deployment cleanup jobs… 🗑️')

    await execute(
      `git checkout -B ${temporaryDeploymentBranch}`,
      `${action.workspace}/${temporaryDeploymentDirectory}`,
      action.silent
    )

    await execute(
      `chmod -R +rw ${temporaryDeploymentDirectory}`,
      action.workspace,
      action.silent
    )

    await execute(
      `git worktree remove ${temporaryDeploymentDirectory} --force`,
      action.workspace,
      action.silent
    )

    await rmRF(temporaryDeploymentDirectory)
  }
}
