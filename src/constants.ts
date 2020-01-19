import * as core from "@actions/core";
import * as github from "@actions/github";

const { pusher, repository } = github.context.payload;

export const workspace: any = process.env.GITHUB_WORKSPACE;
export const folder = core.getInput("FOLDER", { required: true });
export const isTest = process.env.UNIT_TEST;
export const root = ".";

// Required action data.
export const action = {
  accessToken: core.getInput("ACCESS_TOKEN"),
  baseBranch: core.getInput("BASE_BRANCH"),
  build: folder,
  branch: core.getInput("BRANCH"),
  commitMessage: core.getInput("COMMIT_MESSAGE"),
  clean: core.getInput("CLEAN"),
  cleanExclude: core.getInput("CLEAN_EXCLUDE"),
  defaultBranch: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : "master",
  ssh: core.getInput("SSH"),
  email:
    pusher && pusher.email
      ? pusher.email
      : `${process.env.GITHUB_ACTOR ||
          "github-pages-deploy-action"}@users.noreply.github.com`,
  gitHubRepository:
    repository && repository.full_name
      ? repository.full_name
      : process.env.GITHUB_REPOSITORY,
  gitHubToken: core.getInput("GITHUB_TOKEN"),
  name:
    pusher && pusher.name
      ? pusher.name
      : process.env.GITHUB_ACTOR
      ? process.env.GITHUB_ACTOR
      : "GitHub Pages Deploy Action",
  targetFolder: core.getInput("TARGET_FOLDER")
};

// Repository path used for commits/pushes.
export const repositoryPath = action.ssh
  ? `git@github.com:${action.gitHubRepository}`
  : `https://${action.accessToken ||
      `x-access-token:${action.gitHubToken}`}@github.com/${
      action.gitHubRepository
    }.git`;
