import {info} from '@actions/core'
import {mkdirP, rmRF} from '@actions/io'
import fs from 'fs'
import {ActionInterface, Status, TestFlag} from './constants'
import {execute} from './execute'
import {generateWorktree} from './worktree'
import {isNullOrUndefined, suppressSensitiveInformation} from './util'

/* Initializes git in the workspace. */
export async function init(action: ActionInterface): Promise<void | Error> {
  try {
    info(`Deploying using ${action.tokenType}… 🔑`)
    info('Configuring git…')

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

    await execute(`git remote rm origin`, action.workspace, action.silent)

    try {
      if (action.isTest) {
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
        error.message,
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
            ? ` from @ ${action.repositoryName ? action.repositoryName : ''}${
                process.env.GITHUB_SHA
              }`
            : ''
        } 🚀`

    // Checks to see if the remote exists prior to deploying.
    const branchExists =
      action.isTest & TestFlag.HAS_REMOTE_BRANCH ||
      (await execute(
        `git ls-remote --heads ${action.repositoryPath} ${action.branch}`,
        action.workspace,
        action.silent
      ))

    await generateWorktree(action, temporaryDeploymentDirectory, branchExists)

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
              !fs.existsSync(`${action.folderPath}/CNAME`)
                ? '--exclude CNAME'
                : ''
            } ${
              !fs.existsSync(`${action.folderPath}/.nojekyll`)
                ? '--exclude .nojekyll'
                : ''
            }`
          : ''
      }  --exclude .ssh --exclude .git --exclude .github ${
        action.folderPath === action.workspace
          ? `--exclude ${temporaryDeploymentDirectory}`
          : ''
      }`,
      action.workspace,
      action.silent
    )

    // Use git status to check if we have something to commit.
    // Special case is singleCommit with existing history, when
    // we're really interested if the diff against the upstream branch
    // changed.
    const checkGitStatus =
      branchExists && action.singleCommit
        ? `git diff origin/${action.branch}`
        : `git status --porcelain`
    const hasFilesToCommit =
      action.isTest & TestFlag.HAS_CHANGED_FILES ||
      (await execute(
        checkGitStatus,
        `${action.workspace}/${temporaryDeploymentDirectory}`,
        action.silent
      ))

    if (!hasFilesToCommit) {
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
    if (!action.dryRun) {
      await execute(
        `git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
        `${action.workspace}/${temporaryDeploymentDirectory}`,
        action.silent
      )
    }

    info(`Changes committed to the ${action.branch} branch… 📦`)

    return Status.SUCCESS
  } catch (error) {
    throw new Error(
      `The deploy step encountered an error: ${suppressSensitiveInformation(
        error.message,
        action
      )} ❌`
    )
  } finally {
    // Cleans up temporary files/folders and restores the git state.
    info('Running post deployment cleanup jobs… 🗑️')
    await execute(
      `git worktree remove ${temporaryDeploymentDirectory} --force`,
      action.workspace,
      action.silent
    )
    await rmRF(temporaryDeploymentDirectory)
  }
}
