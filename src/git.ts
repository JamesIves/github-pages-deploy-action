import { actionInterface } from "./constants";
import { execute } from "./execute";
import {
  hasRequiredParameters,
  isNullOrUndefined,
  suppressSensitiveInformation
} from "./util";

/* Generates the branch if it doesn't exist on the remote. */
export async function init(action: actionInterface): Promise<void | Error> {
  try {
    hasRequiredParameters(action);

    console.log(`Deploying using ${action.tokenType}... 🔑`);
    console.log("Configuring git...");

    await execute(`git init`, action.workspace);
    await execute(`git config user.name "${action.name}"`, action.workspace);
    await execute(`git config user.email "${action.email}"`, action.workspace);
    await execute(`git remote rm origin`, action.workspace);
    await execute(
      `git remote add origin ${action.repositoryPath}`,
      action.workspace
    );
    await execute(`git fetch`, action.workspace);

    console.log("Git configured... 🔧");
  } catch (error) {
    throw new Error(
      `There was an error initializing the repository: ${suppressSensitiveInformation(
        error.message,
        action
      )} ❌`
    );
  }
}

/* Switches to the base branch. */
export async function switchToBaseBranch(
  action: actionInterface
): Promise<void> {
  try {
    hasRequiredParameters(action);

    await execute(
      `git checkout --progress --force ${
        action.baseBranch ? action.baseBranch : action.defaultBranch
      }`,
      action.workspace
    );
  } catch (error) {
    throw new Error(
      `There was an error switching to the base branch: ${suppressSensitiveInformation(
        error.message,
        action
      )} ❌`
    );
  }
}

/* Generates the branch if it doesn't exist on the remote. */
export async function generateBranch(action: actionInterface): Promise<void> {
  try {
    hasRequiredParameters(action);

    console.log(`Creating the ${action.branch} branch...`);

    await switchToBaseBranch(action);
    await execute(`git checkout --orphan ${action.branch}`, action.workspace);
    await execute(`git reset --hard`, action.workspace);
    await execute(
      `git commit --allow-empty -m "Initial ${action.branch} commit."`,
      action.workspace
    );
    await execute(
      `git push ${action.repositoryPath} ${action.branch}`,
      action.workspace
    );
    await execute(`git fetch`, action.workspace);

    console.log(`Created the ${action.branch} branch... 🔧`);
  } catch (error) {
    throw new Error(
      `There was an error creating the deployment branch: ${suppressSensitiveInformation(
        error.message,
        action
      )} ❌`
    );
  }
}

/* Runs the necessary steps to make the deployment. */
export async function deploy(action: actionInterface): Promise<void> {
  const temporaryDeploymentDirectory = "gh-action-temp-deployment-folder";
  const temporaryDeploymentBranch = "gh-action-temp-deployment-branch";
  console.log("Starting to commit changes...");

  try {
    hasRequiredParameters(action);

    /*
        Checks to see if the remote exists prior to deploying.
        If the branch doesn't exist it gets created here as an orphan.
      */
    const branchExists = await execute(
      `git ls-remote --heads ${action.repositoryPath} ${action.branch} | wc -l`,
      action.workspace
    );

    if (!branchExists && !action.isTest) {
      await generateBranch(action);
    }

    // Checks out the base branch to begin the deployment process.
    await switchToBaseBranch(action);
    await execute(`git fetch ${action.repositoryPath}`, action.workspace);
    await execute(
      `git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`,
      action.workspace
    );

    // Ensures that items that need to be excluded from the clean job get parsed.
    let excludes = "";
    if (action.clean && action.cleanExclude) {
      try {
        const excludedItems =
          typeof action.cleanExclude === "string"
            ? JSON.parse(action.cleanExclude)
            : action.cleanExclude;
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
      rsync is used to prevent file duplication. */
    await execute(
      `rsync -q -av --progress ${action.folder}/. ${
        action.targetFolder
          ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
          : temporaryDeploymentDirectory
      } ${
        action.clean
          ? `--delete ${excludes} --exclude CNAME --exclude .nojekyll`
          : ""
      }  --exclude .ssh --exclude .git --exclude .github ${
        action.folder === action.root
          ? `--exclude ${temporaryDeploymentDirectory}`
          : ""
      }`,
      action.workspace
    );

    const hasFilesToCommit = await execute(
      `git status --porcelain`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    );

    if (!hasFilesToCommit && !action.isTest) {
      console.log("There is nothing to commit. Exiting early... 📭");
      return;
    }

    // Commits to GitHub.
    await execute(
      `git add --all .`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    );
    await execute(
      `git checkout -b ${temporaryDeploymentBranch}`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    );
    await execute(
      `git commit -m "${
        !isNullOrUndefined(action.commitMessage)
          ? action.commitMessage
          : `Deploying to ${action.branch} from ${action.baseBranch}`
      } ${
        process.env.GITHUB_SHA ? `- ${process.env.GITHUB_SHA}` : ""
      } 🚀" --quiet`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    );
    await execute(
      `git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
      `${action.workspace}/${temporaryDeploymentDirectory}`
    );

    console.log(`Changes committed to the ${action.branch} branch... 📦`);

    // Cleans up temporary files/folders and restores the git state.
    console.log("Running post deployment cleanup jobs...");
    await execute(
      `git checkout --progress --force ${action.defaultBranch}`,
      action.workspace
    );
  } catch (error) {
    throw new Error(
      `The deploy step encountered an error: ${suppressSensitiveInformation(
        error.message,
        action
      )} ❌`
    );
  } finally {
    // Ensures the deployment directory is safely removed.
    await execute(`rm -rf ${temporaryDeploymentDirectory}`, action.workspace);
  }
}
