import { getInput } from "@actions/core";
import * as github from "@actions/github";
import { isNullOrUndefined } from "./util";

const { pusher, repository } = github.context.payload;

export const workspace: any = process.env.GITHUB_WORKSPACE;
export const folder = getInput("FOLDER", { required: true });
export const root = ".";

// Required action data.
export const action = {
  accessToken: getInput("ACCESS_TOKEN"),
  baseBranch: getInput("BASE_BRANCH"),
  build: folder,
  branch: getInput("BRANCH"),
  commitMessage: getInput("COMMIT_MESSAGE"),
  clean: getInput("CLEAN"),
  cleanExclude: getInput("CLEAN_EXCLUDE"),
  defaultBranch: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : "master",
  isTest: process.env.UNIT_TEST,
  ssh: getInput("SSH"),
  email: !isNullOrUndefined(getInput("GIT_CONFIG_EMAIL"))
    ? getInput("GIT_CONFIG_EMAIL")
    : pusher && pusher.email
    ? pusher.email
    : `${process.env.GITHUB_ACTOR ||
        "github-pages-deploy-action"}@users.noreply.github.com`,
  gitHubRepository: !isNullOrUndefined(getInput("REMOTE_REPOSITORY"))
    ? getInput("REMOTE_REPOSITORY")
    : repository && repository.full_name
    ? repository.full_name
    : process.env.GITHUB_REPOSITORY,
  gitHubToken: getInput("GITHUB_TOKEN"),
  name: !isNullOrUndefined(getInput("GIT_CONFIG_NAME"))
    ? getInput("GIT_CONFIG_NAME")
    : pusher && pusher.name
    ? pusher.name
    : process.env.GITHUB_ACTOR
    ? process.env.GITHUB_ACTOR
    : "GitHub Pages Deploy Action",
  targetFolder: getInput("TARGET_FOLDER")
};

// Token Types
export const tokenType = action.ssh
  ? "SSH Deploy Key"
  : action.accessToken
  ? "Access Token"
  : action.gitHubToken
  ? "GitHub Token"
  : "...";

// Repository path used for commits/pushes.
export const repositoryPath = action.ssh
  ? `git@github.com:${action.gitHubRepository}`
  : `https://${action.accessToken ||
      `x-access-token:${action.gitHubToken}`}@github.com/${
      action.gitHubRepository
    }.git`;
