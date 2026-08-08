import { getInput } from '@actions/core';
import * as github from '@actions/github';
import { isNullOrUndefined, stripProtocolFromUrl } from './util.js';
const { pusher, repository } = github.context.payload;
/*
 * Flags to signal different scenarios to test cases
 */
export var TestFlag;
(function (TestFlag) {
    TestFlag[TestFlag["NONE"] = 0] = "NONE";
    TestFlag[TestFlag["HAS_CHANGED_FILES"] = 2] = "HAS_CHANGED_FILES";
    TestFlag[TestFlag["HAS_REMOTE_BRANCH"] = 4] = "HAS_REMOTE_BRANCH";
    TestFlag[TestFlag["UNABLE_TO_REMOVE_ORIGIN"] = 8] = "UNABLE_TO_REMOVE_ORIGIN";
    TestFlag[TestFlag["UNABLE_TO_UNSET_GIT_CONFIG"] = 16] = "UNABLE_TO_UNSET_GIT_CONFIG";
    TestFlag[TestFlag["HAS_REJECTED_COMMIT"] = 32] = "HAS_REJECTED_COMMIT"; // Assume commit rejection.
})(TestFlag || (TestFlag = {}));
/* Required action data that gets initialized when running within the GitHub Actions environment. */
export const action = {
    folder: getInput('folder'),
    branch: getInput('branch'),
    commitMessage: getInput('commit-message'),
    dryRun: !isNullOrUndefined(getInput('dry-run'))
        ? getInput('dry-run').toLowerCase() === 'true'
        : false,
    force: !isNullOrUndefined(getInput('force'))
        ? getInput('force').toLowerCase() === 'true'
        : true,
    attemptLimit: !isNullOrUndefined(getInput('attempt-limit'))
        ? parseInt(getInput('attempt-limit'), 10)
        : 3,
    clean: !isNullOrUndefined(getInput('clean'))
        ? getInput('clean').toLowerCase() === 'true'
        : false,
    cleanExclude: (getInput('clean-exclude') || '')
        .split('\n')
        .filter(l => l !== ''),
    includeGithubFolder: !isNullOrUndefined(getInput('include-github-folder'))
        ? getInput('include-github-folder').toLowerCase() === 'true'
        : false,
    hostname: process.env.GITHUB_SERVER_URL
        ? stripProtocolFromUrl(process.env.GITHUB_SERVER_URL)
        : 'github.com',
    isTest: TestFlag.NONE,
    email: !isNullOrUndefined(getInput('git-config-email'))
        ? getInput('git-config-email')
        : pusher && pusher.email
            ? pusher.email
            : `${process.env.GITHUB_ACTOR || 'github-pages-deploy-action'}@users.noreply.${process.env.GITHUB_SERVER_URL
                ? stripProtocolFromUrl(process.env.GITHUB_SERVER_URL)
                : 'github.com'}`,
    name: !isNullOrUndefined(getInput('git-config-name'))
        ? getInput('git-config-name')
        : pusher && pusher.name
            ? pusher.name
            : process.env.GITHUB_ACTOR
                ? process.env.GITHUB_ACTOR
                : 'GitHub Pages Deploy Action',
    repositoryName: !isNullOrUndefined(getInput('repository-name'))
        ? getInput('repository-name')
        : repository && repository.full_name
            ? repository.full_name
            : process.env.GITHUB_REPOSITORY,
    token: getInput('token'),
    singleCommit: !isNullOrUndefined(getInput('single-commit'))
        ? getInput('single-commit').toLowerCase() === 'true'
        : false,
    silent: !isNullOrUndefined(getInput('silent'))
        ? getInput('silent').toLowerCase() === 'true'
        : false,
    sshKey: isNullOrUndefined(getInput('ssh-key'))
        ? false
        : !isNullOrUndefined(getInput('ssh-key')) &&
            getInput('ssh-key').toLowerCase() === 'true'
            ? true
            : getInput('ssh-key'),
    targetFolder: getInput('target-folder'),
    workspace: process.env.GITHUB_WORKSPACE || '',
    tag: getInput('tag')
};
/** Status codes for the action. */
export var Status;
(function (Status) {
    Status["SUCCESS"] = "success";
    Status["FAILED"] = "failed";
    Status["SKIPPED"] = "skipped";
    Status["RUNNING"] = "running";
})(Status || (Status = {}));
/* Platform codes. */
export var OperatingSystems;
(function (OperatingSystems) {
    OperatingSystems["LINUX"] = "Linux";
    OperatingSystems["WINDOWS"] = "Windows";
    OperatingSystems["MACOS"] = "macOS";
})(OperatingSystems || (OperatingSystems = {}));
export const SupportedOperatingSystems = [OperatingSystems.LINUX];
/* Excluded files. */
export var DefaultExcludedFiles;
(function (DefaultExcludedFiles) {
    DefaultExcludedFiles["CNAME"] = "CNAME";
    DefaultExcludedFiles["NOJEKYLL"] = ".nojekyll";
    DefaultExcludedFiles["SSH"] = ".ssh";
    DefaultExcludedFiles["GIT"] = ".git";
    DefaultExcludedFiles["GITHUB"] = ".github";
})(DefaultExcludedFiles || (DefaultExcludedFiles = {}));
