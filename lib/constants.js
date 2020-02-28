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
/* Required action data that gets initialized when running within the GitHub Actions environment. */
exports.action = {
    accessToken: core_1.getInput("ACCESS_TOKEN"),
    baseBranch: core_1.getInput("BASE_BRANCH"),
    folder: core_1.getInput("FOLDER"),
    branch: core_1.getInput("BRANCH"),
    commitMessage: core_1.getInput("COMMIT_MESSAGE"),
    clean: core_1.getInput("CLEAN"),
    cleanExclude: core_1.getInput("CLEAN_EXCLUDE"),
    debug: core_1.getInput("DEBUG"),
    defaultBranch: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : "master",
    isTest: process.env.UNIT_TEST,
    ssh: core_1.getInput("SSH"),
    email: !util_1.isNullOrUndefined(core_1.getInput("GIT_CONFIG_EMAIL"))
        ? core_1.getInput("GIT_CONFIG_EMAIL")
        : pusher && pusher.email
            ? pusher.email
            : `${process.env.GITHUB_ACTOR ||
                "github-pages-deploy-action"}@users.noreply.github.com`,
    gitHubRepository: repository && repository.full_name
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
    targetFolder: core_1.getInput("TARGET_FOLDER"),
    workspace: process.env.GITHUB_WORKSPACE || "",
    root: "."
};
