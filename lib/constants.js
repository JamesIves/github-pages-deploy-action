"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github = __importStar(require("@actions/github"));
const util_1 = require("./util");
const { pusher, repository } = github.context.payload;
exports.workspace = process.env.GITHUB_WORKSPACE;
exports.folder = core_1.getInput("FOLDER", { required: true });
exports.root = ".";
// Required action data.
exports.action = {
    accessToken: core_1.getInput("ACCESS_TOKEN"),
    baseBranch: core_1.getInput("BASE_BRANCH"),
    build: exports.folder,
    branch: core_1.getInput("BRANCH"),
    commitMessage: core_1.getInput("COMMIT_MESSAGE"),
    clean: core_1.getInput("CLEAN"),
    cleanExclude: core_1.getInput("CLEAN_EXCLUDE"),
    defaultBranch: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : "master",
    isTest: process.env.UNIT_TEST,
    ssh: core_1.getInput("SSH"),
    email: !util_1.isNullOrUndefined(core_1.getInput("GIT_CONFIG_EMAIL"))
        ? core_1.getInput("GIT_CONFIG_EMAIL")
        : pusher && pusher.email
            ? pusher.email
            : `${process.env.GITHUB_ACTOR ||
                "github-pages-deploy-action"}@users.noreply.github.com`,
    gitHubRepository: !util_1.isNullOrUndefined(core_1.getInput("REMOTE_REPOSITORY"))
        ? core_1.getInput("REMOTE_REPOSITORY")
        : repository && repository.full_name
            ? repository.full_name
            : process.env.GITHUB_REPOSITORY,
    gitHubToken: core_1.getInput("GITHUB_TOKEN"),
    name: !util_1.isNullOrUndefined(core_1.getInput("GIT_CONFIG_NAME"))
        ? core_1.getInput("GIT_CONFIG_NAME")
        : pusher && pusher.name
            ? pusher.name
            : process.env.GITHUB_ACTOR
                ? process.env.GITHUB_ACTOR
                : "GitHub Pages Deploy Action",
    targetFolder: core_1.getInput("TARGET_FOLDER")
};
// Token Types
exports.tokenType = exports.action.ssh
    ? "SSH Deploy Key"
    : exports.action.accessToken
        ? "Access Token"
        : exports.action.gitHubToken
            ? "GitHub Token"
            : "...";
// Repository path used for commits/pushes.
exports.repositoryPath = exports.action.ssh
    ? `git@github.com:${exports.action.gitHubRepository}`
    : `https://${exports.action.accessToken ||
        `x-access-token:${exports.action.gitHubToken}`}@github.com/${exports.action.gitHubRepository}.git`;
