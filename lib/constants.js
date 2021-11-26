"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.action = exports.TestFlag = void 0;
const core_1 = require("@actions/core");
const github = __importStar(require("@actions/github"));
const util_1 = require("./util");
const { pusher, repository } = github.context.payload;
/* Flags to signal different scenarios to test cases */
var TestFlag;
(function (TestFlag) {
    TestFlag[TestFlag["NONE"] = 0] = "NONE";
    TestFlag[TestFlag["HAS_CHANGED_FILES"] = 2] = "HAS_CHANGED_FILES";
    TestFlag[TestFlag["HAS_REMOTE_BRANCH"] = 4] = "HAS_REMOTE_BRANCH";
    TestFlag[TestFlag["UNABLE_TO_REMOVE_ORIGIN"] = 8] = "UNABLE_TO_REMOVE_ORIGIN";
    TestFlag[TestFlag["UNABLE_TO_UNSET_GIT_CONFIG"] = 16] = "UNABLE_TO_UNSET_GIT_CONFIG"; // Assume we can't remove previously set git configs.
})(TestFlag = exports.TestFlag || (exports.TestFlag = {}));
/* Required action data that gets initialized when running within the GitHub Actions environment. */
exports.action = {
    folder: (0, core_1.getInput)('folder'),
    branch: (0, core_1.getInput)('branch'),
    commitMessage: (0, core_1.getInput)('commit-message'),
    dryRun: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('dry-run'))
        ? (0, core_1.getInput)('dry-run').toLowerCase() === 'true'
        : false,
    clean: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('clean'))
        ? (0, core_1.getInput)('clean').toLowerCase() === 'true'
        : false,
    cleanExclude: ((0, core_1.getInput)('clean-exclude') || '')
        .split('\n')
        .filter(l => l !== ''),
    hostname: process.env.GITHUB_SERVER_URL
        ? (0, util_1.stripProtocolFromUrl)(process.env.GITHUB_SERVER_URL)
        : 'github.com',
    isTest: TestFlag.NONE,
    email: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('git-config-email'))
        ? (0, core_1.getInput)('git-config-email')
        : pusher && pusher.email
            ? pusher.email
            : `${process.env.GITHUB_ACTOR || 'github-pages-deploy-action'}@users.noreply.${process.env.GITHUB_SERVER_URL
                ? (0, util_1.stripProtocolFromUrl)(process.env.GITHUB_SERVER_URL)
                : 'github.com'}`,
    name: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('git-config-name'))
        ? (0, core_1.getInput)('git-config-name')
        : pusher && pusher.name
            ? pusher.name
            : process.env.GITHUB_ACTOR
                ? process.env.GITHUB_ACTOR
                : 'GitHub Pages Deploy Action',
    repositoryName: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('repository-name'))
        ? (0, core_1.getInput)('repository-name')
        : repository && repository.full_name
            ? repository.full_name
            : process.env.GITHUB_REPOSITORY,
    token: (0, core_1.getInput)('token'),
    singleCommit: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('single-commit'))
        ? (0, core_1.getInput)('single-commit').toLowerCase() === 'true'
        : false,
    silent: !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('silent'))
        ? (0, core_1.getInput)('silent').toLowerCase() === 'true'
        : false,
    sshKey: (0, util_1.isNullOrUndefined)((0, core_1.getInput)('ssh-key'))
        ? false
        : !(0, util_1.isNullOrUndefined)((0, core_1.getInput)('ssh-key')) &&
            (0, core_1.getInput)('ssh-key').toLowerCase() === 'true'
            ? true
            : (0, core_1.getInput)('ssh-key'),
    targetFolder: (0, core_1.getInput)('target-folder'),
    workspace: process.env.GITHUB_WORKSPACE || ''
};
/** Status codes for the action. */
var Status;
(function (Status) {
    Status["SUCCESS"] = "success";
    Status["FAILED"] = "failed";
    Status["SKIPPED"] = "skipped";
    Status["RUNNING"] = "running";
})(Status = exports.Status || (exports.Status = {}));
