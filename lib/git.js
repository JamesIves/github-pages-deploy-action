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
exports.deploy = exports.generateBranch = exports.switchToBaseBranch = exports.init = void 0;
const core_1 = require("@actions/core");
const io_1 = require("@actions/io");
const constants_1 = require("./constants");
const execute_1 = require("./execute");
const util_1 = require("./util");
/* Initializes git in the workspace. */
function init(action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            util_1.hasRequiredParameters(action);
            core_1.info(`Deploying using ${action.tokenType}… 🔑`);
            core_1.info('Configuring git…');
            yield execute_1.execute(`git init`, action.workspace);
            yield execute_1.execute(`git config user.name "${action.name}"`, action.workspace);
            yield execute_1.execute(`git config user.email "${action.email}"`, action.workspace);
            yield execute_1.execute(`git remote rm origin`, action.workspace);
            yield execute_1.execute(`git remote add origin ${action.repositoryPath}`, action.workspace);
            yield execute_1.execute(`git fetch --no-recurse-submodules`, action.workspace);
            core_1.info('Git configured… 🔧');
        }
        catch (error) {
            throw new Error(`There was an error initializing the repository: ${util_1.suppressSensitiveInformation(error.message, action)} ❌`);
        }
    });
}
exports.init = init;
/* Switches to the base branch. */
function switchToBaseBranch(action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            util_1.hasRequiredParameters(action);
            yield execute_1.execute(`git checkout --progress --force ${action.baseBranch ? action.baseBranch : action.defaultBranch}`, action.workspace);
        }
        catch (error) {
            throw new Error(`There was an error switching to the base branch: ${util_1.suppressSensitiveInformation(error.message, action)} ❌`);
        }
    });
}
exports.switchToBaseBranch = switchToBaseBranch;
/* Generates the branch if it doesn't exist on the remote. */
function generateBranch(action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            util_1.hasRequiredParameters(action);
            core_1.info(`Creating the ${action.branch} branch…`);
            yield switchToBaseBranch(action);
            yield execute_1.execute(`git checkout --orphan ${action.branch}`, action.workspace);
            yield execute_1.execute(`git reset --hard`, action.workspace);
            yield execute_1.execute(`git commit --allow-empty -m "Initial ${action.branch} commit"`, action.workspace);
            yield execute_1.execute(`git push --force ${action.repositoryPath} ${action.branch}`, action.workspace);
            yield execute_1.execute(`git fetch`, action.workspace);
            core_1.info(`Created the ${action.branch} branch… 🔧`);
        }
        catch (error) {
            throw new Error(`There was an error creating the deployment branch: ${util_1.suppressSensitiveInformation(error.message, action)} ❌`);
        }
    });
}
exports.generateBranch = generateBranch;
/* Runs the necessary steps to make the deployment. */
function deploy(action) {
    return __awaiter(this, void 0, void 0, function* () {
        const temporaryDeploymentDirectory = 'gh-action-temp-deployment-folder';
        const temporaryDeploymentBranch = 'gh-action-temp-deployment-branch';
        core_1.info('Starting to commit changes…');
        try {
            util_1.hasRequiredParameters(action);
            const commitMessage = !util_1.isNullOrUndefined(action.commitMessage)
                ? action.commitMessage
                : `Deploying to ${action.branch} from ${action.baseBranch} ${process.env.GITHUB_SHA ? `@ ${process.env.GITHUB_SHA}` : ''} 🚀`;
            /*
                Checks to see if the remote exists prior to deploying.
                If the branch doesn't exist it gets created here as an orphan.
              */
            const branchExists = yield execute_1.execute(`git ls-remote --heads ${action.repositoryPath} ${action.branch} | wc -l`, action.workspace);
            if (!branchExists && !action.isTest) {
                yield generateBranch(action);
            }
            // Checks out the base branch to begin the deployment process.
            yield switchToBaseBranch(action);
            yield execute_1.execute(`git fetch ${action.repositoryPath}`, action.workspace);
            yield execute_1.execute(`git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`, action.workspace);
            // Ensures that items that need to be excluded from the clean job get parsed.
            let excludes = '';
            if (action.clean && action.cleanExclude) {
                try {
                    const excludedItems = typeof action.cleanExclude === 'string'
                        ? JSON.parse(action.cleanExclude)
                        : action.cleanExclude;
                    for (const item of excludedItems) {
                        excludes += `--exclude ${item} `;
                    }
                }
                catch (_a) {
                    core_1.info('There was an error parsing your CLEAN_EXCLUDE items. Please refer to the README for more details. ❌');
                }
            }
            if (action.targetFolder) {
                core_1.info(`Creating target folder if it doesn't already exist… 📌`);
                yield io_1.mkdirP(`${temporaryDeploymentDirectory}/${action.targetFolder}`);
            }
            /*
              Pushes all of the build files into the deployment directory.
              Allows the user to specify the root if '.' is provided.
              rsync is used to prevent file duplication. */
            yield execute_1.execute(`rsync -q -av --progress ${action.folder}/. ${action.targetFolder
                ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
                : temporaryDeploymentDirectory} ${action.clean
                ? `--delete ${excludes} --exclude CNAME --exclude .nojekyll`
                : ''}  --exclude .ssh --exclude .git --exclude .github ${action.folder === action.root
                ? `--exclude ${temporaryDeploymentDirectory}`
                : ''}`, action.workspace);
            const hasFilesToCommit = yield execute_1.execute(`git status --porcelain`, `${action.workspace}/${temporaryDeploymentDirectory}`);
            if (!hasFilesToCommit && !action.isTest) {
                return constants_1.Status.SKIPPED;
            }
            // Commits to GitHub.
            yield execute_1.execute(`git add --all .`, `${action.workspace}/${temporaryDeploymentDirectory}`);
            yield execute_1.execute(`git checkout -b ${temporaryDeploymentBranch}`, `${action.workspace}/${temporaryDeploymentDirectory}`);
            yield execute_1.execute(`git commit -m "${commitMessage}" --quiet`, `${action.workspace}/${temporaryDeploymentDirectory}`);
            yield execute_1.execute(`git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`);
            core_1.info(`Changes committed to the ${action.branch} branch… 📦`);
            // Cleans up temporary files/folders and restores the git state.
            core_1.info('Running post deployment cleanup jobs…');
            if (action.singleCommit) {
                yield execute_1.execute(`git fetch ${action.repositoryPath}`, action.workspace);
                yield execute_1.execute(`git checkout --orphan ${action.branch}-temp`, `${action.workspace}/${temporaryDeploymentDirectory}`);
                yield execute_1.execute(`git add --all .`, `${action.workspace}/${temporaryDeploymentDirectory}`);
                yield execute_1.execute(`git commit -m "${commitMessage}" --quiet`, `${action.workspace}/${temporaryDeploymentDirectory}`);
                yield execute_1.execute(`git branch -M ${action.branch}-temp ${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`);
                yield execute_1.execute(`git push origin ${action.branch} --force`, `${action.workspace}/${temporaryDeploymentDirectory}`);
                core_1.info('Cleared git history… 🚿');
            }
            yield execute_1.execute(`git checkout --progress --force ${action.defaultBranch}`, action.workspace);
            return constants_1.Status.SUCCESS;
        }
        catch (error) {
            throw new Error(`The deploy step encountered an error: ${util_1.suppressSensitiveInformation(error.message, action)} ❌`);
        }
        finally {
            // Ensures the deployment directory is safely removed after each deployment.
            yield io_1.rmRF(temporaryDeploymentDirectory);
        }
    });
}
exports.deploy = deploy;
