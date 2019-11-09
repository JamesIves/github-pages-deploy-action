import * as core from "@actions/core";
import { cp } from "@actions/io";
import { execute } from "./util";
import { workspace, action, repositoryPath } from "./constants";

/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
export async function init(): Promise<any> {
  try {
    if (!action.accessToken && !action.gitHubToken) {
      return core.setFailed(
        "You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy."
      );
    }

    if (action.build.startsWith("/") || action.build.startsWith("./")) {
      return core.setFailed(
        `The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.`
      );
    }

    await execute(`git init`, workspace);
    await execute(`git config user.name ${action.pusher.name}`, workspace);
    await execute(`git config user.email ${action.pusher.email}`, workspace);
  } catch (error) {
    core.setFailed(`There was an error initializing the repository: ${error}`);
  } finally {
    return Promise.resolve("Initialization step complete...");
  }
}

/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
export async function generateBranch(): Promise<any> {
  try {
    console.log(`Creating ${action.branch} branch...`);
    await execute(`git switch ${action.baseBranch || "master"}`, workspace);
    await execute(`git switch --orphan ${action.branch}`, workspace);
    await execute(`git reset --hard`, workspace);
    await execute(
      `git commit --allow-empty -m "Initial ${action.branch} commit."`,
      workspace
    );
    await execute(`git push ${repositoryPath} ${action.branch}`, workspace);
  } catch (error) {
    core.setFailed(
      `There was an error creating the deployment branch: ${error}`
    );
  } finally {
    return Promise.resolve("Deployment branch creation step complete...");
  }
}

/** Runs the necessary steps to make the deployment.
 * @returns {Promise}
 */
export async function deploy(): Promise<any> {
  const temporaryDeploymentDirectory = "temp-deployment-folder";
  const temporaryDeploymentBranch = "temp-deployment-branch";

  /*
      Checks to see if the remote exists prior to deploying.
      If the branch doesn't exist it gets created here as an orphan.
    */
  const branchExists = await execute(
    `git ls-remote --heads ${repositoryPath} ${action.branch} | wc -l`,
    workspace
  );
  if (!branchExists) {
    console.log("Deployment branch does not exist. Creating....");
    await generateBranch();
  }

  // Checks out the base branch to begin the deployment process.
  await execute(`git switch ${action.baseBranch || "master"}`, workspace);
  await execute(`git fetch origin`, workspace);
  await execute(
    `git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`,
    workspace
  );

  /*
    Pushes all of the build files into the deployment directory.
    Allows the user to specify the root if '.' is provided. */
  await cp(`${action.build}/.`, temporaryDeploymentDirectory, {
    recursive: true,
    force: true
  });

  // Commits to GitHub.
  await execute(`git add --all .`, temporaryDeploymentDirectory);
  await execute(
    `git switch -c ${temporaryDeploymentBranch}`,
    temporaryDeploymentDirectory
  );
  await execute(
    `git commit -m "Deploying to ${action.branch} from ${action.baseBranch} ${process.env.GITHUB_SHA}" --quiet`,
    temporaryDeploymentDirectory
  );
  await execute(
    `git push --force ${repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
    temporaryDeploymentDirectory
  );

  return Promise.resolve("Commit step complete...");
}
