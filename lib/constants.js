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
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.action = void 0;
const core_1 = require("@actions/core");
const github = __importStar(require("@actions/github"));
const util_1 = require("./util");
const { pusher, repository } = github.context.payload;
/* Required action data that gets initialized when running within the GitHub Actions environment. */
exports.action = {
    accessToken: core_1.getInput('ACCESS_TOKEN'),
    baseBranch: core_1.getInput('BASE_BRANCH'),
    folder: core_1.getInput('FOLDER'),
    branch: core_1.getInput('BRANCH'),
    commitMessage: core_1.getInput('COMMIT_MESSAGE'),
    clean: !util_1.isNullOrUndefined(core_1.getInput('CLEAN'))
        ? core_1.getInput('CLEAN').toLowerCase() === 'true'
        : false,
    cleanExclude: core_1.getInput('CLEAN_EXCLUDE'),
    defaultBranch: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : 'master',
    isTest: process.env.UNIT_TEST
        ? process.env.UNIT_TEST.toLowerCase() === 'true'
        : false,
    email: !util_1.isNullOrUndefined(core_1.getInput('GIT_CONFIG_EMAIL'))
        ? core_1.getInput('GIT_CONFIG_EMAIL')
        : pusher && pusher.email
            ? pusher.email
            : `${process.env.GITHUB_ACTOR || 'github-pages-deploy-action'}@users.noreply.github.com`,
    gitHubToken: core_1.getInput('GITHUB_TOKEN'),
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
    root: '.',
    singleCommit: !util_1.isNullOrUndefined(core_1.getInput('SINGLE_COMMIT'))
        ? core_1.getInput('SINGLE_COMMIT').toLowerCase() === 'true'
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
