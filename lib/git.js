"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const constants_1 = require("./constants");
const execute_1 = require("./execute");
const util_1 = require("./util");
/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (util_1.isNullOrUndefined(constants_1.action.accessToken) &&
                util_1.isNullOrUndefined(constants_1.action.gitHubToken) &&
                util_1.isNullOrUndefined(constants_1.action.ssh)) {
                core_1.setFailed("You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.");
                throw Error("No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.");
            }
            if (constants_1.action.build.startsWith("/") || constants_1.action.build.startsWith("./")) {
                core_1.setFailed(`The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.`);
                throw Error("Incorrectly formatted build folder. The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.");
            }
            console.log(`Deploying using ${constants_1.tokenType}... 🔑`);
            yield execute_1.execute(`git init`, constants_1.workspace);
            yield execute_1.execute(`git config user.name ${constants_1.action.name}`, constants_1.workspace);
            yield execute_1.execute(`git config user.email ${constants_1.action.email}`, constants_1.workspace);
            yield execute_1.execute(`git remote rm origin`, constants_1.workspace);
            yield execute_1.execute(`git remote add origin ${constants_1.repositoryPath}`, constants_1.workspace);
            yield execute_1.execute(`git fetch`, constants_1.workspace);
        }
        catch (error) {
            console.log(`There was an error initializing the repository: ${error}`);
        }
        finally {
            console.log("Initialization step complete...");
        }
    });
}
exports.init = init;
/** Switches to the base branch.
 * @returns {Promise}
 */
function switchToBaseBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        yield execute_1.execute(`git checkout --progress --force ${constants_1.action.baseBranch ? constants_1.action.baseBranch : constants_1.action.defaultBranch}`, constants_1.workspace);
        return Promise.resolve("Switched to the base branch...");
    });
}
exports.switchToBaseBranch = switchToBaseBranch;
/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
function generateBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (util_1.isNullOrUndefined(constants_1.action.branch)) {
                throw Error("Branch is required.");
            }
            console.log(`Creating ${constants_1.action.branch} branch... 🔧`);
            yield switchToBaseBranch();
            yield execute_1.execute(`git checkout --orphan ${constants_1.action.branch}`, constants_1.workspace);
            yield execute_1.execute(`git reset --hard`, constants_1.workspace);
            yield execute_1.execute(`git commit --allow-empty -m "Initial ${constants_1.action.branch} commit."`, constants_1.workspace);
            yield execute_1.execute(`git push ${constants_1.repositoryPath} ${constants_1.action.branch}`, constants_1.workspace);
            yield execute_1.execute(`git fetch`, constants_1.workspace);
        }
        catch (error) {
            core_1.setFailed(`There was an error creating the deployment branch: ${error} ❌`);
        }
        finally {
            console.log("Deployment branch creation step complete... ✅");
        }
    });
}
exports.generateBranch = generateBranch;
/** Runs the necessary steps to make the deployment.
 * @returns {Promise}
 */
function deploy() {
    return __awaiter(this, void 0, void 0, function* () {
        const temporaryDeploymentDirectory = "gh-action-temp-deployment-folder";
        const temporaryDeploymentBranch = "gh-action-temp-deployment-branch";
        /*
            Checks to see if the remote exists prior to deploying.
            If the branch doesn't exist it gets created here as an orphan.
          */
        const branchExists = yield execute_1.execute(`git ls-remote --heads ${constants_1.repositoryPath} ${constants_1.action.branch} | wc -l`, constants_1.workspace);
        if (!branchExists && !constants_1.action.isTest) {
            console.log("Deployment branch does not exist. Creating....");
            yield generateBranch();
        }
        // Checks out the base branch to begin the deployment process.
        yield switchToBaseBranch();
        yield execute_1.execute(`git fetch ${constants_1.repositoryPath}`, constants_1.workspace);
        yield execute_1.execute(`git worktree add --checkout ${temporaryDeploymentDirectory} origin/${constants_1.action.branch}`, constants_1.workspace);
        // Ensures that items that need to be excluded from the clean job get parsed.
        let excludes = "";
        if (constants_1.action.clean && constants_1.action.cleanExclude) {
            try {
                const excludedItems = JSON.parse(constants_1.action.cleanExclude);
                excludedItems.forEach((item) => (excludes += `--exclude ${item} `));
            }
            catch (_a) {
                console.log("There was an error parsing your CLEAN_EXCLUDE items. Please refer to the README for more details. ❌");
            }
        }
        /*
          Pushes all of the build files into the deployment directory.
          Allows the user to specify the root if '.' is provided.
          rysync is used to prevent file duplication. */
        yield execute_1.execute(`rsync -q -av --progress ${constants_1.action.build}/. ${constants_1.action.targetFolder
            ? `${temporaryDeploymentDirectory}/${constants_1.action.targetFolder}`
            : temporaryDeploymentDirectory} ${constants_1.action.clean
            ? `--delete ${excludes} --exclude CNAME --exclude .nojekyll`
            : ""}  --exclude .ssh --exclude .git --exclude .github ${constants_1.action.build === constants_1.root ? `--exclude ${temporaryDeploymentDirectory}` : ""}`, constants_1.workspace);
        const hasFilesToCommit = yield execute_1.execute(`git status --porcelain`, temporaryDeploymentDirectory);
        if (!hasFilesToCommit && !constants_1.action.isTest) {
            console.log("There is nothing to commit. Exiting... ✅");
            return Promise.resolve("Exiting early...");
        }
        // Commits to GitHub.
        yield execute_1.execute(`git add --all .`, temporaryDeploymentDirectory);
        yield execute_1.execute(`git checkout -b ${temporaryDeploymentBranch}`, temporaryDeploymentDirectory);
        yield execute_1.execute(`git commit -m "${!util_1.isNullOrUndefined(constants_1.action.commitMessage)
            ? constants_1.action.commitMessage
            : `Deploying to ${constants_1.action.branch} from ${constants_1.action.baseBranch}`} - ${process.env.GITHUB_SHA} 🚀" --quiet`, temporaryDeploymentDirectory);
        yield execute_1.execute(`git push --force ${constants_1.repositoryPath} ${temporaryDeploymentBranch}:${constants_1.action.branch}`, temporaryDeploymentDirectory);
        // Cleans up temporary files/folders and restores the git state.
        console.log("Running post deployment cleanup jobs... 🔧");
        yield execute_1.execute(`rm -rf ${temporaryDeploymentDirectory}`, constants_1.workspace);
        yield execute_1.execute(`git checkout --progress --force ${constants_1.action.defaultBranch}`, constants_1.workspace);
        return Promise.resolve("Commit step complete...");
    });
}
exports.deploy = deploy;
