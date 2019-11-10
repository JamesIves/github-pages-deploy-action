"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const { pusher, repository } = github.context.payload;
exports.workspace = process.env.GITHUB_WORKSPACE;
exports.folder = core.getInput("FOLDER", { required: true });
// Required action data.
exports.action = {
    build: exports.folder,
    gitHubRepository: repository ? repository.full_name : "",
    gitHubToken: core.getInput("GITHUB_TOKEN"),
    accessToken: core.getInput("ACCESS_TOKEN"),
    branch: core.getInput("BRANCH"),
    baseBranch: core.getInput("BASE_BRANCH") || "master",
    pusher
};
// Repository path used for commits/pushes.
exports.repositoryPath = `https://${exports.action.accessToken ||
    `x-access-token:${exports.action.gitHubToken}`}@github.com/${exports.action.gitHubRepository}.git`;
