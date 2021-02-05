import {getInput} from '@actions/core'
import * as github from '@actions/github'
import {isNullOrUndefined} from './util'

const {pusher, repository} = github.context.payload

/* Flags to signal different scenarios to test cases */
export enum TestFlag {
  NONE = 0,
  HAS_CHANGED_FILES = 1 << 1, // Assume changes to commit.
  HAS_REMOTE_BRANCH = 1 << 2, // Assume remote repository has existing commits.
  UNABLE_TO_REMOVE_ORIGIN = 1 << 3, // Assume we can't remove origin.
  UNABLE_TO_UNSET_GIT_CONFIG = 1 << 4 // Assume we can't remove previously set git configs.
}

/* For more information please refer to the README: https://github.com/JamesIves/github-pages-deploy-action */
export interface ActionInterface {
  /** The branch that the action should deploy to. */
  branch: string
  /** git push with --dry-run */
  dryRun?: boolean | null
  /** If your project generates hashed files on build you can use this option to automatically delete them from the deployment branch with each deploy. This option can be toggled on by setting it to true. */
  clean?: boolean | null
  /** If you need to use CLEAN but you'd like to preserve certain files or folders you can use this option. */
  cleanExclude?: string[]
  /** If you need to customize the commit message for an integration you can do so. */
  commitMessage?: string
  /** The git config email. */
  email?: string
  /** The folder to deploy. */
  folder: string
  /** The auto generated folder path. */
  folderPath?: string
  /** Determines test scenarios the action is running in. */
  isTest: TestFlag
  /** The git config name. */
  name?: string
  /** The repository path, for example JamesIves/github-pages-deploy-action. */
  repositoryName?: string
  /** The fully qualified repositpory path, this gets auto generated if repositoryName is provided. */
  repositoryPath?: string
  /** Wipes the commit history from the deployment branch in favor of a single commit. */
  singleCommit?: boolean | null
  /** Determines if the action should run in silent mode or not. */
  silent: boolean
  /** Defines an SSH private key that can be used during deployment. This can also be set to true to use SSH deployment endpoints if you've already configured the SSH client outside of this package. */
  sshKey?: string | boolean | null
  /** If you'd like to push the contents of the deployment folder into a specific directory on the deployment branch you can specify it here. */
  targetFolder?: string
  /** Deployment token. */
  token?: string | null
  /** The token type, ie ssh/token, this gets automatically generated. */
  tokenType?: string
  /** The folder where your deployment project lives. */
  workspace: string
}

/** The minimum required values to run the action as a node module. */
export interface NodeActionInterface {
  /** The branch that the action should deploy to. */
  branch: string
  /** The folder to deploy. */
  folder: string
  /** The repository path, for example JamesIves/github-pages-deploy-action. */
  repositoryName: string
  /** GitHub deployment token. */
  token?: string | null
  /** Determines if the action should run in silent mode or not. */
  silent: boolean
  /** Defines an SSH private key that can be used during deployment. This can also be set to true to use SSH deployment endpoints if you've already configured the SSH client outside of this package. */
  sshKey?: string | boolean | null
  /** The folder where your deployment project lives. */
  workspace: string
  /** Determines test scenarios the action is running in. */
  isTest: TestFlag
}

/* Required action data that gets initialized when running within the GitHub Actions environment. */
export const action: ActionInterface = {
  folder: getInput('folder'),
  branch: getInput('branch'),
  commitMessage: getInput('commit-message'),
  dryRun: !isNullOrUndefined(getInput('dry-run'))
    ? getInput('dry-run').toLowerCase() === 'true'
    : false,
  clean: !isNullOrUndefined(getInput('clean'))
    ? getInput('clean').toLowerCase() === 'true'
    : false,
  cleanExclude: (getInput('clean-exclude') || '')
    .split('\n')
    .filter(l => l !== ''),
  isTest: TestFlag.NONE,
  email: !isNullOrUndefined(getInput('git-config-email'))
    ? getInput('git-config-email')
    : pusher && pusher.email
    ? pusher.email
    : `${
        process.env.GITHUB_ACTOR || 'github-pages-deploy-action'
      }@users.noreply.github.com`,
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
  workspace: process.env.GITHUB_WORKSPACE || ''
}

/** Types for the required action parameters. */
export type RequiredActionParameters = Pick<
  ActionInterface,
  'token' | 'sshKey' | 'branch' | 'folder' | 'isTest'
>

/** Status codes for the action. */
export enum Status {
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RUNNING = 'running'
}
