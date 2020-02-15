import { setFailed } from "@actions/core";
import {
  action,
  repositoryPath,
  root,
  tokenType,
  workspace
} from "./constants";
import { execute } from "./execute";
import { isNullOrUndefined } from "./util";

/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
export async function init(): Promise<void> {
  try {
    if (
      isNullOrUndefined(action.accessToken) &&
      isNullOrUndefined(action.gitHubToken) &&
      isNullOrUndefined(action.ssh)
    ) {
      setFailed(
        "You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true."
      );

      throw Error(
        "No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true."
      );
    }

    if (action.build.startsWith("/") || action.build.startsWith("./")) {
      setFailed(
        `The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.`
      );

      throw Error(
        "Incorrectly formatted build folder. The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly."
      );
    }

    console.log(`Deploying using ${tokenType}... 🔑`);
    await execute(`git init`, workspace);
    await execute(`git config user.name ${action.name}`, workspace);
    await execute(`git config user.email ${action.email}`, workspace);
    await execute(`git remote rm origin`, workspace);
    await execute(`git remote add origin ${repositoryPath}`, workspace);
    await execute(`git fetch`, workspace);
  } catch (error) {
    console.log(`There was an error initializing the repository: ${error}`);
  } finally {
    console.log("Initialization step complete...");
  }
}

/** Switches to the base branch.
 * @returns {Promise}
 */
export async function switchToBaseBranch(): Promise<string> {
  await execute(
    `git checkout --progress --force ${
      action.baseBranch ? action.baseBranch : action.defaultBranch
    }`,
    workspace
  );

  return Promise.resolve("Switched to the base branch...");
}

/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
export async function generateBranch(): Promise<void> {
  try {
    if (isNullOrUndefined(action.branch)) {
      throw Error("Branch is required.");
    }

    console.log(`Creating ${action.branch} branch... 🔧`);
    await switchToBaseBranch();
    await execute(`git checkout --orphan ${action.branch}`, workspace);
    await execute(`git reset --hard`, workspace);
    await execute(
      `git commit --allow-empty -m "Initial ${action.branch} commit."`,
      workspace
    );
    await execute(`git push ${repositoryPath} ${action.branch}`, workspace);
    await execute(`git fetch`, workspace);
  } catch (error) {
    setFailed(`There was an error creating the deployment branch: ${error} ❌`);
  } finally {
    console.log("Deployment branch creation step complete... ✅");
  }
}

/** Runs the necessary steps to make the deployment.
 * @returns {Promise}
 */
export async function deploy(): Promise<string> {
  const temporaryDeploymentDirectory = "gh-action-temp-deployment-folder";
  const temporaryDeploymentBranch = "gh-action-temp-deployment-branch";
  /*
      Checks to see if the remote exists prior to deploying.
      If the branch doesn't exist it gets created here as an orphan.
    */
  const branchExists = await execute(
    `git ls-remote --heads ${repositoryPath} ${action.branch} | wc -l`,
    workspace
  );
  if (!branchExists && !action.isTest) {
    console.log("Deployment branch does not exist. Creating....");
    await generateBranch();
  }

  // Checks out the base branch to begin the deployment process.
  await switchToBaseBranch();
  await execute(`git fetch ${repositoryPath}`, workspace);
  await execute(
    `git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`,
    workspace
  );

  // Ensures that items that need to be excluded from the clean job get parsed.
  let excludes = "";
  if (action.clean && action.cleanExclude) {
    try {
      const excludedItems = JSON.parse(action.cleanExclude);
      excludedItems.forEach(
        (item: string) => (excludes += `--exclude ${item} `)
      );
    } catch {
      console.log(
        "There was an error parsing your CLEAN_EXCLUDE items. Please refer to the README for more details. ❌"
      );
    }
  }

  /*
    Pushes all of the build files into the deployment directory.
    Allows the user to specify the root if '.' is provided.
    rysync is used to prevent file duplication. */
  await execute(
    `rsync -q -av --progress ${action.build}/. ${
      action.targetFolder
        ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
        : temporaryDeploymentDirectory
    } ${
      action.clean
        ? `--delete ${excludes} --exclude CNAME --exclude .nojekyll`
        : ""
    }  --exclude .ssh --exclude .git --exclude .github ${
      action.build === root ? `--exclude ${temporaryDeploymentDirectory}` : ""
    }`,
    workspace
  );

  const hasFilesToCommit = await execute(
    `git status --porcelain`,
    temporaryDeploymentDirectory
  );

  if (!hasFilesToCommit && !action.isTest) {
    console.log("There is nothing to commit. Exiting... ✅");
    return Promise.resolve("Exiting early...");
  }

  // Commits to GitHub.
  await execute(`git add --all .`, temporaryDeploymentDirectory);
  await execute(
    `git checkout -b ${temporaryDeploymentBranch}`,
    temporaryDeploymentDirectory
  );
  await execute(
    `git commit -m "${
      !isNullOrUndefined(action.commitMessage)
        ? action.commitMessage
        : `Deploying to ${action.branch} from ${action.baseBranch}`
    } - ${process.env.GITHUB_SHA} 🚀" --quiet`,
    temporaryDeploymentDirectory
  );
  await execute(
    `git push --force ${repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
    temporaryDeploymentDirectory
  );

  // Cleans up temporary files/folders and restores the git state.
  console.log("Running post deployment cleanup jobs... 🔧");
  await execute(`rm -rf ${temporaryDeploymentDirectory}`, workspace);
  await execute(
    `git checkout --progress --force ${action.defaultBranch}`,
    workspace
  );

  return Promise.resolve("Commit step complete...");
}
