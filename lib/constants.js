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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
    TestFlag[TestFlag["HAS_REMOTE_BRANCH"] = 4] = "HAS_REMOTE_BRANCH"; // Assume remote repository has existing commits
})(TestFlag = exports.TestFlag || (exports.TestFlag = {}));
/* Required action data that gets initialized when running within the GitHub Actions environment. */
exports.action = {
    folder: core_1.getInput('FOLDER'),
    branch: core_1.getInput('BRANCH'),
    commitMessage: core_1.getInput('COMMIT_MESSAGE'),
    dryRun: !util_1.isNullOrUndefined(core_1.getInput('DRY_RUN'))
        ? core_1.getInput('DRY_RUN').toLowerCase() === 'true'
        : false,
    clean: !util_1.isNullOrUndefined(core_1.getInput('CLEAN'))
        ? core_1.getInput('CLEAN').toLowerCase() === 'true'
        : false,
    cleanExclude: core_1.getInput('CLEAN_EXCLUDE'),
    isTest: TestFlag.NONE,
    email: !util_1.isNullOrUndefined(core_1.getInput('GIT_CONFIG_EMAIL'))
        ? core_1.getInput('GIT_CONFIG_EMAIL')
        : pusher && pusher.email
            ? pusher.email
            : `${process.env.GITHUB_ACTOR || 'github-pages-deploy-action'}@users.noreply.github.com`,
    name: !util_1.isNullOrUndefined(core_1.getInput('GIT_CONFIG_NAME'))
        ? core_1.getInput('GIT_CONFIG_NAME')
        : pusher && pusher.name
            ? pusher.name
            : process.env.GITHUB_ACTOR
                ? process.env.GITHUB_ACTOR
                : 'GitHub Pages Deploy Action',
    repositoryName: !util_1.isNullOrUndefined(core_1.getInput('REPOSITORY_NAME'))
        ? core_1.getInput('REPOSITORY_NAME')
        : repository && repository.full_name
            ? repository.full_name
            : process.env.GITHUB_REPOSITORY,
    token: core_1.getInput('TOKEN'),
    singleCommit: !util_1.isNullOrUndefined(core_1.getInput('SINGLE_COMMIT'))
        ? core_1.getInput('SINGLE_COMMIT').toLowerCase() === 'true'
        : false,
    silent: !util_1.isNullOrUndefined(core_1.getInput('SILENT'))
        ? core_1.getInput('SILENT').toLowerCase() === 'true'
        : false,
    ssh: !util_1.isNullOrUndefined(core_1.getInput('SSH'))
        ? core_1.getInput('SSH').toLowerCase() === 'true'
        : false,
    targetFolder: core_1.getInput('TARGET_FOLDER'),
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
