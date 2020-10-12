import {existsSync} from 'fs'
import path from 'path'
import {isDebug} from '@actions/core'
import {
  ActionInterface,
  ActionFolders,
  RequiredActionParameters
} from './constants'

const replaceAll = (input: string, find: string, replace: string): string =>
  input.split(find).join(replace)

/* Utility function that checks to see if a value is undefined or not. */
export const isNullOrUndefined = (value: any): boolean =>
  typeof value === 'undefined' || value === null || value === ''

/* Generates a token type used for the action. */
export const generateTokenType = (action: ActionInterface): string =>
  action.ssh
    ? 'SSH Deploy Key'
    : action.accessToken
    ? 'Access Token'
    : action.gitHubToken
    ? 'GitHub Token'
    : '…'

/* Generates a the repository path used to make the commits. */
export const generateRepositoryPath = (action: ActionInterface): string =>
  action.ssh
    ? `git@github.com:${action.repositoryName}`
    : `https://${
        action.accessToken || `x-access-token:${action.gitHubToken}`
      }@github.com/${action.repositoryName}.git`

/* Genetate absolute folder path by the provided folder name */
export const generateFolderPath = <K extends keyof ActionFolders>(
  action: ActionInterface,
  key: K
): string => {
  const folderName = action[key]
  const folderPath = path.isAbsolute(folderName)
    ? folderName
    : folderName.startsWith('~')
    ? folderName.replace('~', process.env.HOME as string)
    : path.join(action.workspace, folderName)
  return folderPath
}

/* Checks for the required tokens and formatting. Throws an error if any case is matched. */
const hasRequiredParameters = <K extends keyof RequiredActionParameters>(
  action: ActionInterface,
  params: K[]
): boolean => {
  const nonNullParams = params.filter(
    param => !isNullOrUndefined(action[param])
  )
  return Boolean(nonNullParams.length)
}

export const checkParameters = (action: ActionInterface): void => {
  if (!hasRequiredParameters(action, ['accessToken', 'gitHubToken', 'ssh'])) {
    throw new Error(
      'No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.'
    )
  }

  if (!hasRequiredParameters(action, ['branch'])) {
    throw new Error('Branch is required.')
  }

  if (!hasRequiredParameters(action, ['folder'])) {
    throw new Error('You must provide the action with a folder to deploy.')
  }

  if (
    !existsSync(action.folderPath as string) &&
    action.folderPath !== action.rootPath
  ) {
    throw new Error(
      `The ${action.folderPath} directory you're trying to deploy doesn't exist. ❗`
    )
  }
}

/* Suppresses sensitive information from being exposed in error messages. */
export const suppressSensitiveInformation = (
  str: string,
  action: ActionInterface
): string => {
  let value = str

  if (isDebug()) {
    // Data is unmasked in debug mode.
    return value
  }

  const orderedByLength = ([
    action.accessToken,
    action.gitHubToken,
    action.repositoryPath
  ].filter(Boolean) as string[]).sort((a, b) => b.length - a.length)

  for (const find of orderedByLength) {
    value = replaceAll(value, find, '***')
  }

  return value
}
