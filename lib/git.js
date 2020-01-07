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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const util_1 = require("./util");
const constants_1 = require("./constants");
/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!constants_1.action.accessToken && !constants_1.action.gitHubToken) {
                return core.setFailed("You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy.");
            }
            if (constants_1.action.build.startsWith("/") || constants_1.action.build.startsWith("./")) {
                return core.setFailed(`The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.`);
            }
            yield util_1.execute(`git init`, constants_1.workspace);
            yield util_1.execute(`git config user.name ${constants_1.action.name}`, constants_1.workspace);
            yield util_1.execute(`git config user.email ${constants_1.action.email}`, constants_1.workspace);
        }
        catch (error) {
            core.setFailed(`There was an error initializing the repository: ${error}`);
        }
        finally {
            return Promise.resolve("Initialization step complete...");
        }
    });
}
exports.init = init;
/** Switches to the base branch.
 * @returns {Promise}
 */
function switchToBaseBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        yield util_1.execute(constants_1.action.baseBranch
            ? `git switch ${constants_1.action.baseBranch}`
            : `git checkout --progress --force ${constants_1.action.defaultBranch}`, constants_1.workspace);
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
            console.log(`Creating ${constants_1.action.branch} branch... 🔧`);
            yield switchToBaseBranch();
            yield util_1.execute(`git switch --orphan ${constants_1.action.branch}`, constants_1.workspace);
            yield util_1.execute(`git reset --hard`, constants_1.workspace);
            yield util_1.execute(`git commit --allow-empty -m "Initial ${constants_1.action.branch} commit."`, constants_1.workspace);
            yield util_1.execute(`git push ${constants_1.repositoryPath} ${constants_1.action.branch}`, constants_1.workspace);
            yield switchToBaseBranch();
        }
        catch (error) {
            core.setFailed(`There was an error creating the deployment branch: ${error} ❌`);
        }
        finally {
            return Promise.resolve("Deployment branch creation step complete... ✅");
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
        const branchExists = yield util_1.execute(`git ls-remote --heads ${constants_1.repositoryPath} ${constants_1.action.branch} | wc -l`, constants_1.workspace);
        if (!branchExists) {
            console.log("Deployment branch does not exist. Creating....");
            yield generateBranch();
        }
        // Checks out the base branch to begin the deployment process.
        yield switchToBaseBranch();
        yield util_1.execute(`git fetch ${constants_1.repositoryPath}`, constants_1.workspace);
        yield util_1.execute(`git pull`, constants_1.workspace);
        yield util_1.execute(`git worktree add --checkout ${temporaryDeploymentDirectory} origin/${constants_1.action.branch}`, constants_1.workspace);
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
        yield util_1.execute(`rsync -q -av --progress ${constants_1.action.build}/. ${constants_1.action.targetFolder
            ? `${temporaryDeploymentDirectory}/${constants_1.action.targetFolder}`
            : temporaryDeploymentDirectory} ${constants_1.action.clean
            ? `--delete ${excludes} --exclude CNAME --exclude .nojekyll`
            : ""}  --exclude .git --exclude .github ${constants_1.action.build === constants_1.root ? `--exclude ${temporaryDeploymentDirectory}` : ""}`, constants_1.workspace);
        const hasFilesToCommit = yield util_1.execute(`git status --porcelain`, temporaryDeploymentDirectory);
        if (!hasFilesToCommit && !constants_1.isTest) {
            console.log("There is nothing to commit. Exiting... ✅");
            return Promise.resolve();
        }
        // Commits to GitHub.
        yield util_1.execute(`git add --all .`, temporaryDeploymentDirectory);
        yield util_1.execute(`git switch -c ${temporaryDeploymentBranch}`, temporaryDeploymentDirectory);
        yield util_1.execute(`git commit -m "Deploying to ${constants_1.action.branch} from ${constants_1.action.baseBranch} ${process.env.GITHUB_SHA}" --quiet`, temporaryDeploymentDirectory);
        yield util_1.execute(`git push --force ${constants_1.repositoryPath} ${temporaryDeploymentBranch}:${constants_1.action.branch}`, temporaryDeploymentDirectory);
        // Cleans up temporary files/folders and restores the git state.
        console.log("Running post deployment cleanup jobs... 🔧");
        yield util_1.execute(`rm -rf ${temporaryDeploymentDirectory}`, constants_1.workspace);
        yield util_1.execute(`git checkout --progress --force ${constants_1.action.defaultBranch}`, constants_1.workspace);
        return Promise.resolve("Commit step complete...");
    });
}
exports.deploy = deploy;
