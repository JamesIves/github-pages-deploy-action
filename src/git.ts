import {info} from '@actions/core'
import {rmRF, mkdirP} from '@actions/io'
import {ActionInterface, Status} from './constants'
import {execute} from './execute'
import {
  hasRequiredParameters,
  isNullOrUndefined,
  suppressSensitiveInformation
} from './util'

/* Initializes git in the workspace. */
export async function init(action: ActionInterface): Promise<void | Error> {
  try {
    hasRequiredParameters(action)

    info(`Deploying using ${action.tokenType}… 🔑`)
    info('Configuring git…')

    await execute(`git init`, action.workspace)
    await execute(`git config user.name "${action.name}"`, action.workspace)
    await execute(`git config user.email "${action.email}"`, action.workspace)
    await execute(`git remote rm origin`, action.workspace)
    await execute(
      `git remote add origin ${action.repositoryPath}`,
      action.workspace
    )
    await execute(`git fetch --no-recurse-submodules`, action.workspace)

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

/* Switches to the base branch. */
export async function switchToBaseBranch(
  action: ActionInterface
): Promise<void> {
  try {
    hasRequiredParameters(action)

    await execute(
      `git checkout --progress --force ${
        action.baseBranch ? action.baseBranch : action.defaultBranch
      }`,
      action.workspace
    )
  } catch (error) {
    throw new Error(
      `There was an error switching to the base branch: ${suppressSensitiveInformation(
        error.message,
        action
      )} ❌`
    )
  }
}

/* Generates the branch if it doesn't exist on the remote. */
export async function generateBranch(action: ActionInterface): Promise<void> {
  try {
    hasRequiredParameters(action)

    info(`Creating the ${action.branch} branch…`)

    await switchToBaseBranch(action)
    await execute(`git checkout --orphan ${action.branch}`, action.workspace)
    await execute(`git reset --hard`, action.workspace)
    await execute(
      `git commit --allow-empty -m "Initial ${action.branch} commit"`,
      action.workspace
    )
    await execute(
      `git push --force ${action.repositoryPath} ${action.branch}`,
      action.workspace
    )
    await execute(`git fetch`, action.workspace)

    info(`Created the ${action.branch} branch… 🔧`)
  } catch (error) {
    throw new Error(
      `There was an error creating the deployment branch: ${suppressSensitiveInformation(
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
    hasRequiredParameters(action)

    const commitMessage = !isNullOrUndefined(action.commitMessage)
      ? (action.commitMessage as string)
      : `Deploying to ${action.branch} from ${action.baseBranch} ${
          process.env.GITHUB_SHA ? `@ ${process.env.GITHUB_SHA}` : ''
        } 🚀`

    /*
        Checks to see if the remote exists prior to deploying.
        If the branch doesn't exist it gets created here as an orphan.
      */
    const branchExists = await execute(
      `git ls-remote --heads ${action.repositoryPath} ${action.branch} | wc -l`,
      action.workspace
    )

    if (!branchExists && !action.isTest) {
      await generateBranch(action)
    }

    // Checks out the base branch to begin the deployment process.
    await switchToBaseBranch(action)
    await execute(`git fetch ${action.repositoryPath}`, action.workspace)
    await execute(
      `git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`,
      action.workspace
    )

    // Ensures that items that need to be excluded from the clean job get parsed.
    let excludes = ''
    if (action.clean && action.cleanExclude) {
      try {
        const excludedItems =
          typeof action.cleanExclude === 'string'
            ? JSON.parse(action.cleanExclude)
            : action.cleanExclude

        for (const item of excludedItems) {
          excludes += `--exclude ${item} `
        }
      } catch {
        info(
          'There was an error parsing your CLEAN_EXCLUDE items. Please refer to the README for more details. ❌'
        )
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
      `rsync -q -av --checksum --progress ${action.folder}/. ${
        action.targetFolder
          ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
          : temporaryDeploymentDirectory
      } ${
        action.clean
          ? `--delete ${excludes} --exclude CNAME --exclude .nojekyll`
          : ''
      }  --exclude .ssh --exclude .git --exclude .github ${
        action.folder === action.root
          ? `--exclude ${temporaryDeploymentDirectory}`
          : ''
      }`,
      action.workspace
    )

    const hasFilesToCommit = await execute(
      `git status --porcelain`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    )

    if (!hasFilesToCommit && !action.isTest) {
      return Status.SKIPPED
    }

    // Commits to GitHub.
    await execute(
      `git add --all .`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    )
    await execute(
      `git checkout -b ${temporaryDeploymentBranch}`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    )
    await execute(
      `git commit -m "${commitMessage}" --quiet`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    )
    await execute(
      `git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    )

    info(`Changes committed to the ${action.branch} branch… 📦`)

    if (action.singleCommit) {
      await execute(`git fetch ${action.repositoryPath}`, action.workspace)
      await execute(
        `git checkout --orphan ${action.branch}-temp`,
        `${action.workspace}/${temporaryDeploymentDirectory}`
      )
      await execute(
        `git add --all .`,
        `${action.workspace}/${temporaryDeploymentDirectory}`
      )
      await execute(
        `git commit -m "${commitMessage}" --quiet`,
        `${action.workspace}/${temporaryDeploymentDirectory}`
      )
      await execute(
        `git branch -M ${action.branch}-temp ${action.branch}`,
        `${action.workspace}/${temporaryDeploymentDirectory}`
      )
      await execute(
        `git push origin ${action.branch} --force`,
        `${action.workspace}/${temporaryDeploymentDirectory}`
      )

      info('Cleared git history… 🚿')
    }

    await execute(
      `git checkout --progress --force ${action.defaultBranch}`,
      action.workspace
    )

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
      action.workspace
    )
    await rmRF(temporaryDeploymentDirectory)
  }
}
