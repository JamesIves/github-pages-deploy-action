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
exports.deploy = exports.init = void 0;
const core_1 = require("@actions/core");
const io_1 = require("@actions/io");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
const execute_1 = require("./execute");
const worktree_1 = require("./worktree");
const util_1 = require("./util");
/**
 * Initializes git in the workspace.
 */
function init(action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, core_1.info)(`Deploying using ${action.tokenType}… 🔑`);
            (0, core_1.info)('Configuring git…');
            try {
                yield (0, execute_1.execute)(`git config --global --add safe.directory "${action.workspace}"`, action.workspace, action.silent);
            }
            catch (_a) {
                (0, core_1.info)('Unable to set workspace as a safe directory…');
            }
            yield (0, execute_1.execute)(`git config user.name "${action.name}"`, action.workspace, action.silent);
            yield (0, execute_1.execute)(`git config user.email "${action.email}"`, action.workspace, action.silent);
            yield (0, execute_1.execute)(`git config core.ignorecase false`, action.workspace, action.silent);
            try {
                if ((process.env.CI && !action.sshKey) || action.isTest) {
                    /* Ensures that previously set Git configs do not interfere with the deployment.
                      Only runs in the GitHub Actions CI environment if a user is not using an SSH key.
                    */
                    yield (0, execute_1.execute)(`git config --local --unset-all http.https://${action.hostname}/.extraheader`, action.workspace, action.silent);
                }
                if (action.isTest === constants_1.TestFlag.UNABLE_TO_UNSET_GIT_CONFIG) {
                    throw new Error();
                }
            }
            catch (_b) {
                (0, core_1.info)('Unable to unset previous git config authentication as it may not exist, continuing…');
            }
            try {
                yield (0, execute_1.execute)(`git remote rm origin`, action.workspace, action.silent);
                if (action.isTest === constants_1.TestFlag.UNABLE_TO_REMOVE_ORIGIN) {
                    throw new Error();
                }
            }
            catch (_c) {
                (0, core_1.info)('Attempted to remove origin but failed, continuing…');
            }
            yield (0, execute_1.execute)(`git remote add origin ${action.repositoryPath}`, action.workspace, action.silent);
            (0, core_1.info)('Git configured… 🔧');
        }
        catch (error) {
            throw new Error(`There was an error initializing the repository: ${(0, util_1.suppressSensitiveInformation)((0, util_1.extractErrorMessage)(error), action)} ❌`);
        }
    });
}
exports.init = init;
/**
 * Runs the necessary steps to make the deployment.
 */
function deploy(action) {
    return __awaiter(this, void 0, void 0, function* () {
        const temporaryDeploymentDirectory = 'github-pages-deploy-action-temp-deployment-folder';
        const temporaryDeploymentBranch = `github-pages-deploy-action/${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        (0, core_1.info)('Starting to commit changes…');
        try {
            const commitMessage = !(0, util_1.isNullOrUndefined)(action.commitMessage)
                ? action.commitMessage
                : `Deploying to ${action.branch}${process.env.GITHUB_SHA
                    ? ` from @ ${process.env.GITHUB_REPOSITORY}@${process.env.GITHUB_SHA}`
                    : ''} 🚀`;
            // Checks to see if the remote exists prior to deploying.
            const branchExists = action.isTest & constants_1.TestFlag.HAS_REMOTE_BRANCH ||
                Boolean((yield (0, execute_1.execute)(`git ls-remote --heads ${action.repositoryPath} refs/heads/${action.branch}`, action.workspace, action.silent)).stdout);
            yield (0, worktree_1.generateWorktree)(action, temporaryDeploymentDirectory, branchExists);
            /* Relaxes permissions of folder due to be deployed so rsync can write to/from it. */
            try {
                yield (0, execute_1.execute)(`chmod -R +rw ${action.folderPath}`, action.workspace, action.silent);
            }
            catch (_a) {
                (0, core_1.info)(`Unable to modify permissions…`);
            }
            // Ensures that items that need to be excluded from the clean job get parsed.
            let excludes = '';
            if (action.clean && action.cleanExclude) {
                for (const item of action.cleanExclude) {
                    excludes += `--exclude ${item} `;
                }
            }
            if (action.targetFolder) {
                (0, core_1.info)(`Creating target folder if it doesn't already exist… 📌`);
                yield (0, io_1.mkdirP)(`${temporaryDeploymentDirectory}/${action.targetFolder}`);
            }
            /*
              Pushes all of the build files into the deployment directory.
              Allows the user to specify the root if '.' is provided.
              rsync is used to prevent file duplication. */
            yield (0, execute_1.execute)(`rsync -q -av --checksum --progress ${action.folderPath}/. ${action.targetFolder
                ? `${temporaryDeploymentDirectory}/${action.targetFolder}`
                : temporaryDeploymentDirectory} ${action.clean
                ? `--delete ${excludes} ${!fs_1.default.existsSync(`${action.folderPath}/${constants_1.DefaultExcludedFiles.CNAME}`)
                    ? `--exclude ${constants_1.DefaultExcludedFiles.CNAME}`
                    : ''} ${!fs_1.default.existsSync(`${action.folderPath}/${constants_1.DefaultExcludedFiles.NOJEKYLL}`)
                    ? `--exclude ${constants_1.DefaultExcludedFiles.NOJEKYLL}`
                    : ''}`
                : ''}  --exclude ${constants_1.DefaultExcludedFiles.SSH} --exclude ${constants_1.DefaultExcludedFiles.GIT} --exclude ${constants_1.DefaultExcludedFiles.GITHUB} ${action.folderPath === action.workspace
                ? `--exclude ${temporaryDeploymentDirectory}`
                : ''}`, action.workspace, action.silent);
            if (action.singleCommit) {
                yield (0, execute_1.execute)(`git add --all .`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            }
            // Use git status to check if we have something to commit.
            // Special case is singleCommit with existing history, when
            // we're really interested if the diff against the upstream branch
            // changed.
            const checkGitStatus = branchExists && action.singleCommit
                ? `git diff origin/${action.branch}`
                : `git status --porcelain`;
            (0, core_1.info)(`Checking if there are files to commit…`);
            const hasFilesToCommit = action.isTest & constants_1.TestFlag.HAS_CHANGED_FILES ||
                Boolean((yield (0, execute_1.execute)(checkGitStatus, `${action.workspace}/${temporaryDeploymentDirectory}`, true // This output is always silenced due to the large output it creates.
                )).stdout);
            if ((!action.singleCommit && !hasFilesToCommit) ||
                // Ignores the case where single commit is true with a target folder to prevent incorrect early exiting.
                (action.singleCommit && !action.targetFolder && !hasFilesToCommit)) {
                return constants_1.Status.SKIPPED;
            }
            // Commits to GitHub.
            yield (0, execute_1.execute)(`git add --all .`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            yield (0, execute_1.execute)(`git checkout -b ${temporaryDeploymentBranch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            yield (0, execute_1.execute)(`git commit -m "${commitMessage}" --quiet --no-verify`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            if (action.dryRun) {
                (0, core_1.info)(`Dry run complete`);
                return constants_1.Status.SUCCESS;
            }
            if (action.force) {
                // Force-push our changes, overwriting any changes that were added in
                // the meantime
                (0, core_1.info)(`Force-pushing changes...`);
                yield (0, execute_1.execute)(`git push --force ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            }
            else {
                const ATTEMPT_LIMIT = 3;
                // Attempt to push our changes, but fetch + rebase if there were
                // other changes added in the meantime
                let attempt = 0;
                // Keep track of whether the most recent attempt was rejected
                let rejected = false;
                do {
                    attempt++;
                    if (attempt > ATTEMPT_LIMIT)
                        throw new Error(`Attempt limit exceeded`);
                    // Handle rejection for the previous attempt first such that, on
                    // the final attempt, time is not wasted rebasing it when it will
                    // not be pushed
                    if (rejected) {
                        (0, core_1.info)(`Fetching upstream ${action.branch}…`);
                        yield (0, execute_1.execute)(`git fetch ${action.repositoryPath} ${action.branch}:${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                        (0, core_1.info)(`Rebasing this deployment onto ${action.branch}…`);
                        yield (0, execute_1.execute)(`git rebase ${action.branch} ${temporaryDeploymentBranch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                    }
                    (0, core_1.info)(`Pushing changes… (attempt ${attempt} of ${ATTEMPT_LIMIT})`);
                    const pushResult = yield (0, execute_1.execute)(`git push --porcelain ${action.repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent, true // Ignore non-zero exit status
                    );
                    rejected =
                        Boolean(action.isTest) ||
                            pushResult.stdout.includes(`[rejected]`) ||
                            pushResult.stdout.includes(`[remote rejected]`);
                    if (rejected)
                        (0, core_1.info)('Updates were rejected');
                    // If the push failed for any fatal reason other than being rejected,
                    // there is a problem
                    if (!rejected &&
                        pushResult.stderr.split(/\n/).some(s => s.trim().startsWith('fatal:'))) {
                        throw new Error(pushResult.stderr);
                    }
                } while (rejected);
            }
            (0, core_1.info)(`Changes committed to the ${action.branch} branch… 📦`);
            if (action.tag) {
                (0, core_1.info)(`Adding '${action.tag}' tag to the commit…`);
                yield (0, execute_1.execute)(`git tag ${action.tag}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                (0, core_1.info)(`Pushing '${action.tag}' tag to repository…`);
                yield (0, execute_1.execute)(`git push origin ${action.tag}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
                (0, core_1.info)(`Tag '${action.tag}' created and pushed to the ${action.branch} branch… 🏷️`);
            }
            return constants_1.Status.SUCCESS;
        }
        catch (error) {
            throw new Error(`The deploy step encountered an error: ${(0, util_1.suppressSensitiveInformation)((0, util_1.extractErrorMessage)(error), action)} ❌`);
        }
        finally {
            // Cleans up temporary files/folders and restores the git state.
            (0, core_1.info)('Running post deployment cleanup jobs… 🗑️');
            yield (0, execute_1.execute)(`git checkout -B ${temporaryDeploymentBranch}`, `${action.workspace}/${temporaryDeploymentDirectory}`, action.silent);
            yield (0, execute_1.execute)(`chmod -R +rw ${temporaryDeploymentDirectory}`, action.workspace, action.silent);
            yield (0, execute_1.execute)(`git worktree remove ${temporaryDeploymentDirectory} --force`, action.workspace, action.silent);
            yield (0, io_1.rmRF)(temporaryDeploymentDirectory);
        }
    });
}
exports.deploy = deploy;
