import {getInput} from '@actions/core'
import * as github from '@actions/github'
import {isNullOrUndefined} from './util'

const {pusher, repository} = github.context.payload

/* For more information please refer to the README: https://github.com/JamesIves/github-pages-deploy-action */
export interface ActionInterface {
  /** The branch that the action should deploy to. */
  branch: string
  /** git push with --dry-run */
  dryRun?: boolean | null
  /** If your project generates hashed files on build you can use this option to automatically delete them from the deployment branch with each deploy. This option can be toggled on by setting it to true. */
  clean?: boolean | null
  /** If you need to use CLEAN but you'd like to preserve certain files or folders you can use this option. */
  cleanExclude?: string | string[]
  /** If you need to customize the commit message for an integration you can do so. */
  commitMessage?: string
  /** The git config email. */
  email?: string
  /** The folder to deploy. */
  folder: string
  /** The auto generated folder path. */
  folderPath?: string
  /** Determines if the action is running in test mode or not. */
  isTest?: boolean | null
  /** Determines if the action assumes an existig branch in tests or not. */
  hasBranchForTest?: boolean | null
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
  /** Set to true if you're using an ssh client in your build step. */
  ssh?: boolean | null
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
  /** Set to true if you're using an ssh client in your build step. */
  ssh?: boolean | null
  /** The folder where your deployment project lives. */
  workspace: string
}

/* Required action data that gets initialized when running within the GitHub Actions environment. */
export const action: ActionInterface = {
  folder: getInput('FOLDER'),
  branch: getInput('BRANCH'),
  commitMessage: getInput('COMMIT_MESSAGE'),
  dryRun: !isNullOrUndefined(getInput('DRY_RUN'))
    ? getInput('DRY_RUN').toLowerCase() === 'true'
    : false,
  clean: !isNullOrUndefined(getInput('CLEAN'))
    ? getInput('CLEAN').toLowerCase() === 'true'
    : false,
  cleanExclude: getInput('CLEAN_EXCLUDE'),
  isTest: process.env.UNIT_TEST
    ? process.env.UNIT_TEST.toLowerCase() === 'true'
    : false,
  hasBranchForTest: false,
  email: !isNullOrUndefined(getInput('GIT_CONFIG_EMAIL'))
    ? getInput('GIT_CONFIG_EMAIL')
    : pusher && pusher.email
    ? pusher.email
    : `${
        process.env.GITHUB_ACTOR || 'github-pages-deploy-action'
      }@users.noreply.github.com`,
  name: !isNullOrUndefined(getInput('GIT_CONFIG_NAME'))
    ? getInput('GIT_CONFIG_NAME')
    : pusher && pusher.name
    ? pusher.name
    : process.env.GITHUB_ACTOR
    ? process.env.GITHUB_ACTOR
    : 'GitHub Pages Deploy Action',
  repositoryName: !isNullOrUndefined(getInput('REPOSITORY_NAME'))
    ? getInput('REPOSITORY_NAME')
    : repository && repository.full_name
    ? repository.full_name
    : process.env.GITHUB_REPOSITORY,
  token: getInput('TOKEN'),
  singleCommit: !isNullOrUndefined(getInput('SINGLE_COMMIT'))
    ? getInput('SINGLE_COMMIT').toLowerCase() === 'true'
    : false,
  silent: !isNullOrUndefined(getInput('SILENT'))
    ? getInput('SILENT').toLowerCase() === 'true'
    : false,
  ssh: !isNullOrUndefined(getInput('SSH'))
    ? getInput('SSH').toLowerCase() === 'true'
    : false,
  targetFolder: getInput('TARGET_FOLDER'),
  workspace: process.env.GITHUB_WORKSPACE || ''
}

/** Types for the required action parameters. */
export type RequiredActionParameters = Pick<
  ActionInterface,
  'token' | 'ssh' | 'branch' | 'folder'
>

/** Status codes for the action. */
export enum Status {
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RUNNING = 'running'
}
