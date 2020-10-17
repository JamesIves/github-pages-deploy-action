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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = exports.generateBranch = exports.switchToBaseBranch = exports.init = void 0;
const core_1 = require("@actions/core");
const io_1 = require("@actions/io");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
const execute_1 = require("./execute");
const util_1 = require("./util");
/* Initializes git in the workspace. */
function init(action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core_1.info(`Deploying using ${action.tokenType}… 🔑`);
            core_1.info('Configuring git…');
            yield execute_1.execute(`git init`, action.workspace, action.silent);
            yield execute_1.execute(`git config user.name "${action.name}"`, action.workspace, action.silent);
            yield execute_1.execute(`git config user.email "${action.email}"`, action.workspace, action.silent);
            try {
                yield execute_1.execute(`git remote rm origin`, action.workspace, action.silent);
                if (action.isTest) {
                    throw new Error();
                }
            }
            catch (_a) {
                core_1.info('Attempted to remove origin but failed, continuing…');
            }
            yield execute_1.execute(`git remote add origin ${action.repositoryPath}`, action.workspace, action.silent);
            if (action.preserve) {
                core_1.info(`Stashing workspace changes… ⬆️`);
                yield execute_1.execute(`git stash`, action.workspace, action.silent);
            }
            yield execute_1.execute(`git fetch --no-recurse-submodules`, action.workspace, action.silent);
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
            yield execute_1.execute(`git checkout --progress --force ${action.baseBranch ? action.baseBranch : action.defaultBranch}`, action.workspace, action.silent);
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
            core_1.info(`Creating the ${action.branch} branch…`);
            yield switchToBaseBranch(action);
            yield execute_1.execute(`git checkout --orphan ${action.branch}`, action.workspace, action.silent);
            yield execute_1.execute(`git reset --hard`, action.workspace, action.silent);
            yield execute_1.execute(`git commit --no-verify --allow-empty -m "Initial ${action.branch} commit"`, action.workspace, action.silent);
            yield execute_1.execute(`git push --force ${action.repositoryPath} ${action.branch}`, action.workspace, action.silent);
            yield execute_1.execute(`git fetch`, action.workspace, action.silent);
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
        const temporaryDeploymentDirectory = 'github-pages-deploy-action-temp-deployment-folder';
        const temporaryDeploymentBranch = `github-pages-deploy-action/${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        core_1.info('Starting to commit changes…');
        try {
            const commitMessage = !util_1.isNullOrUndefined(action.commitMessage)
                ? action.commitMessage
                : `Deploying to ${action.branch} from ${action.baseBranch} ${process.env.GITHUB_SHA ? `@ ${process.env.GITHUB_SHA}` : ''} 🚀`;
            /*
                Checks to see if the remote exists prior to deploying.
                If the branch doesn't exist it gets created here as an orphan.
              */
            const branchExists = yield execute_1.execute(`git ls-remote --heads ${action.repositoryPath} ${action.branch} | wc -l`, action.workspace, action.silent);
            if (!branchExists && !action.isTest) {
                yield generateBranch(action);
            }
            // Checks out the base branch to begin the deployment process.
            yield switchToBaseBranch(action);
            yield execute_1.execute(`git fetch ${action.repositoryPath}`, action.workspace, action.silent);
            if (action.lfs) {
                // Migrates data from LFS so it can be comitted the "normal" way.
                core_1.info(`Migrating from Git LFS… ⚓`);
                yield execute_1.execute(`git lfs migrate export --include="*" --yes`, action.workspace, action.silent);
            }
            if (action.preserve) {
                core_1.info(`Applying stashed workspace changes… ⬆️`);
                try {
                    yield execute_1.execute(`git stash apply`, action.workspace, action.silent);
                }
                catch (_a) {
                    core_1.info('Unable to apply from stash, continuing…');
                }
            }
            yield execute_1.execute(`git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`, action.workspace, action.silent);
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
                catch (_b) {
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
            yield execute_1.execute(`rsync -q -av --checksum --progress ${action.folderPath}/. ${action.targetFolder
                ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
                : temporaryDeploymentDirectory} ${action.clean
                ? `--delete ${excludes} ${!fs_1.default.existsSync(`${action.folderPath}/CNAME`)
                    ? '--exclude CNAME'
                    : ''} ${!fs_1.default.existsSync(`${action.folderPath}/.nojekyll`)
                    ? '--exclude .nojekyll'
                    : ''}`
                : ''}  --exclude .ssh --exclude .git --exclude .github ${action.folderPath === action.workspace
                ? `--exclude ${temporaryDeploymentDirectory}`
                : ''}`, action.workspace, action.silent);
            const hasFilesToCommit = yield execute_1.execute(`git status --porcelain`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            if (!hasFilesToCommit && !action.isTest) {
                return constants_1.Status.SKIPPED;
            }
            // Commits to GitHub.
            yield execute_1.execute(`git add --all .`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            yield execute_1.execute(`git checkout -b ${temporaryDeploymentBranch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            yield execute_1.execute(`git commit -m "${commitMessage}" --quiet --no-verify`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            yield execute_1.execute(`git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            core_1.info(`Changes committed to the ${action.branch} branch… 📦`);
            if (action.singleCommit) {
                yield execute_1.execute(`git fetch ${action.repositoryPath}`, action.workspace, action.silent);
                yield execute_1.execute(`git checkout --orphan ${action.branch}-temp`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                yield execute_1.execute(`git add --all .`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                yield execute_1.execute(`git commit -m "${commitMessage}" --quiet --no-verify`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                yield execute_1.execute(`git branch -M ${action.branch}-temp ${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                yield execute_1.execute(`git push origin ${action.branch} --force`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                core_1.info('Cleared git history… 🚿');
            }
            yield execute_1.execute(`git checkout --progress --force ${action.defaultBranch}`, action.workspace, action.silent);
            return constants_1.Status.SUCCESS;
        }
        catch (error) {
            throw new Error(`The deploy step encountered an error: ${util_1.suppressSensitiveInformation(error.message, action)} ❌`);
        }
        finally {
            // Cleans up temporary files/folders and restores the git state.
            core_1.info('Running post deployment cleanup jobs… 🗑️');
            yield execute_1.execute(`git worktree remove ${temporaryDeploymentDirectory} --force`, action.workspace, action.silent);
            yield io_1.rmRF(temporaryDeploymentDirectory);
        }
    });
}
exports.deploy = deploy;
