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
exports.init = init;
exports.deploy = deploy;
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
            // Clear any GIT_CONFIG and git credential environment variables
            // These can be set by actions/checkout and persist in the environment
            (0, core_1.info)('Checking for git credential environment variables...');
            const gitConfigVars = Object.keys(process.env).filter(key => key.startsWith('GIT_CONFIG') || key === 'GIT_ASKPASS' || key === 'GIT_TERMINAL_PROMPT');
            if (gitConfigVars.length > 0) {
                (0, core_1.info)(`Found git environment variables: ${gitConfigVars.join(', ')}`);
                gitConfigVars.forEach(key => {
                    delete process.env[key];
                });
                (0, core_1.info)(`Cleared ${gitConfigVars.length} git environment variables`);
            }
            else {
                (0, core_1.info)('No problematic git environment variables found');
            }
            /**
             * Ensure that the workspace is a safe directory.
             */
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
            // Remove includeIf directives that point to credential files (actions/checkout@v6+)
            // This runs unconditionally because checkout@v6 credentials must be cleared
            try {
                /* actions/checkout@v6+ uses includeIf directives to inject credentials.
                   We need to remove these to ensure the provided token/SSH key is used instead.
                   Check local, global, and system scopes as containers may configure differently.
                */
                (0, core_1.info)('Checking for includeIf credential directives from actions/checkout@v6...');
                let foundAny = false;
                for (const scope of ['--local', '--global', '--system']) {
                    try {
                        const includeIfResult = yield (0, execute_1.execute)(`git config ${scope} --get-regexp 'includeIf\\..*\\.path'`, action.workspace, true // Always silent to avoid exposing credential paths
                        );
                        // Parse the output to find includeIf sections
                        if (includeIfResult.stdout) {
                            const lines = includeIfResult.stdout.trim().split('\n');
                            for (const line of lines) {
                                // Skip empty lines
                                if (!line.trim()) {
                                    continue;
                                }
                                // Each line is in format: includeIf.gitdir:/path/.git.path /path/to/config
                                // The regex captures the section name without the trailing .path suffix
                                const match = line.match(/^(includeIf\.[^\s]+)\.path\s+/);
                                if (match) {
                                    const section = match[1];
                                    foundAny = true;
                                    (0, core_1.info)(`Found includeIf directive in ${scope} scope: ${section}`);
                                    try {
                                        yield (0, execute_1.execute)(`git config ${scope} --remove-section "${section}"`, action.workspace, true // Always silent
                                        );
                                        (0, core_1.info)(`Removed includeIf section: ${section}`);
                                    }
                                    catch (error) {
                                        (0, core_1.info)(`Failed to remove includeIf section ${section}: ${(0, util_1.extractErrorMessage)(error)}`);
                                    }
                                }
                            }
                        }
                    }
                    catch (error) {
                        // Log but continue - this is expected if no config exists in this scope
                        (0, core_1.info)(`No includeIf directives found in ${scope} scope (or scope not accessible)`);
                    }
                }
                if (!foundAny) {
                    (0, core_1.info)('No includeIf credential directives found');
                }
            }
            catch (error) {
                (0, core_1.info)(`Error while checking for includeIf directives: ${(0, util_1.extractErrorMessage)(error)}`);
            }
            // Also check for and clear any credential helpers that might be set
            try {
                (0, core_1.info)('Checking for credential helpers...');
                const credentialHelperResult = yield (0, execute_1.execute)(`git config --get-all credential.helper`, action.workspace, true);
                if (credentialHelperResult.stdout) {
                    (0, core_1.info)(`Found credential helper: ${credentialHelperResult.stdout.trim()}`);
                    yield (0, execute_1.execute)(`git config --unset-all credential.helper`, action.workspace, true);
                    (0, core_1.info)('Removed credential helper');
                }
            }
            catch (_c) {
                (0, core_1.info)('No credential helper configured in local config');
            }
            // Check global credential helper
            try {
                const globalCredentialHelperResult = yield (0, execute_1.execute)(`git config --global --get-all credential.helper`, action.workspace, true);
                if (globalCredentialHelperResult.stdout) {
                    (0, core_1.info)(`Found global credential helper: ${globalCredentialHelperResult.stdout.trim()}`);
                    yield (0, execute_1.execute)(`git config --global --unset-all credential.helper`, action.workspace, true);
                    (0, core_1.info)('Removed global credential helper');
                }
            }
            catch (_d) {
                (0, core_1.info)('No global credential helper configured');
            }
            // Check system credential helper
            try {
                const systemCredentialHelperResult = yield (0, execute_1.execute)(`git config --system --get-all credential.helper`, action.workspace, true);
                if (systemCredentialHelperResult.stdout) {
                    (0, core_1.info)(`Found system credential helper: ${systemCredentialHelperResult.stdout.trim()}`);
                    // Note: Usually can't unset system config without root, so just log it
                    (0, core_1.info)('Warning: System-level credential helper detected but cannot be removed');
                }
            }
            catch (_e) {
                (0, core_1.info)('No system credential helper configured');
            }
            // Clear the extraheader from global scope as well (might be set there in containers)
            try {
                yield (0, execute_1.execute)(`git config --global --unset-all http.https://${action.hostname}/.extraheader`, action.workspace, true);
                (0, core_1.info)('Removed global extraheader configuration');
            }
            catch (_f) {
                // Ignore - may not exist
            }
            // Clear any http.extraheader configs (without the URL prefix)
            try {
                const extraHeaderCheck = yield (0, execute_1.execute)(`git config --get-regexp 'http.*extraheader'`, action.workspace, true);
                if (extraHeaderCheck.stdout) {
                    (0, core_1.info)(`Found extraheader configs: ${extraHeaderCheck.stdout}`);
                    // Remove each one
                    const lines = extraHeaderCheck.stdout.trim().split('\n');
                    for (const line of lines) {
                        const key = line.split(' ')[0];
                        if (key) {
                            try {
                                yield (0, execute_1.execute)(`git config --unset-all ${key}`, action.workspace, true);
                                (0, core_1.info)(`Removed ${key}`);
                            }
                            catch (_g) {
                                // Continue
                            }
                        }
                    }
                }
            }
            catch (_h) {
                // Ignore
            }
            try {
                yield (0, execute_1.execute)(`git remote rm origin`, action.workspace, action.silent);
                if (action.isTest === constants_1.TestFlag.UNABLE_TO_REMOVE_ORIGIN) {
                    throw new Error();
                }
            }
            catch (_j) {
                (0, core_1.info)('Attempted to remove origin but failed, continuing…');
            }
            yield (0, execute_1.execute)(`git remote add origin ${action.repositoryPath}`, action.workspace, action.silent);
            // Verify the remote was set correctly
            try {
                const remoteCheck = yield (0, execute_1.execute)(`git remote get-url origin`, action.workspace, true);
                (0, core_1.info)(`Origin remote URL configured (credentials hidden)`);
            }
            catch (_k) {
                (0, core_1.info)('Warning: Could not verify origin remote URL');
            }
            (0, core_1.info)('Git configured… 🔧');
        }
        catch (error) {
            throw new Error(`There was an error initializing the repository: ${(0, util_1.suppressSensitiveInformation)((0, util_1.extractErrorMessage)(error), action)} ❌`);
        }
    });
}
/**
 * Runs the necessary steps to make the deployment.
 */
function deploy(action) {
    return __awaiter(this, void 0, void 0, function* () {
        const temporaryDeploymentDirectory = 'github-pages-deploy-action-temp-deployment-folder';
        const temporaryDeploymentBranch = `github-pages-deploy-action/${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        const rsyncVersion = (0, util_1.getRsyncVersion)();
        const isMkpathSupported = rsyncVersion >= '3.2.3';
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
                yield (0, execute_1.execute)(`chmod -R +rw ${action.folderPath}`, action.workspace, true // Always silent to avoid flooding output on read-only folders
                );
            }
            catch (_a) {
                // Silently ignore chmod failures - they are non-critical and often occur with read-only folders
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
            yield (0, execute_1.execute)(`rsync -q -av --checksum --progress ${isMkpathSupported && action.targetFolder ? '--mkpath' : ''} ${action.folderPath}/. ${action.targetFolder
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
                const attemptLimit = action.attemptLimit || 3;
                // Attempt to push our changes, but fetch + rebase if there were
                // other changes added in the meantime
                let attempt = 0;
                // Keep track of whether the most recent attempt was rejected
                let rejected = false;
                do {
                    attempt++;
                    if (attempt > attemptLimit)
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
                    (0, core_1.info)(`Pushing changes… (attempt ${attempt} of ${attemptLimit})`);
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
            try {
                yield (0, execute_1.execute)(`chmod -R +rw ${temporaryDeploymentDirectory}`, action.workspace, true // Always silent to avoid flooding output on read-only folders
                );
            }
            catch (_b) {
                // Silently ignore chmod failures - they are non-critical and often occur with read-only folders
            }
            yield (0, execute_1.execute)(`git worktree remove ${temporaryDeploymentDirectory} --force`, action.workspace, action.silent);
            yield (0, io_1.rmRF)(temporaryDeploymentDirectory);
        }
    });
}
