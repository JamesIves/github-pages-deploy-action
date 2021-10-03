import {isDebug} from '@actions/core'
import {existsSync} from 'fs'
import path from 'path'
import {ActionInterface, RequiredActionParameters} from './constants'

/* Replaces all instances of a match in a string. */
const replaceAll = (input: string, find: string, replace: string): string =>
  input.split(find).join(replace)

/* Utility function that checks to see if a value is undefined or not. */
export const isNullOrUndefined = (value: unknown): boolean =>
  typeof value === 'undefined' || value === null || value === ''

/* Generates a token type used for the action. */
export const generateTokenType = (action: ActionInterface): string =>
  action.sshKey ? 'SSH Deploy Key' : action.token ? 'Deploy Token' : '…'

/* Generates a the repository path used to make the commits. */
export const generateRepositoryPath = (action: ActionInterface): string =>
  action.sshKey
    ? `git@${action.hostname}:${action.repositoryName}`
    : `https://${`x-access-token:${action.token}`}@${action.hostname}/${
        action.repositoryName
      }.git`

/* Genetate absolute folder path by the provided folder name */
export const generateFolderPath = (action: ActionInterface): string => {
  const folderName = action['folder']
  return path.isAbsolute(folderName)
    ? folderName
    : folderName.startsWith('~')
    ? folderName.replace('~', process.env.HOME as string)
    : path.join(action.workspace, folderName)
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

/* Verifies the action has the required parameters to run, otherwise throw an error. */
export const checkParameters = (action: ActionInterface): void => {
  if (!hasRequiredParameters(action, ['token', 'sshKey'])) {
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

  if (!existsSync(action.folderPath as string)) {
    throw new Error(
      `The directory you're trying to deploy named ${action.folderPath} doesn't exist. Please double check the path and any prerequisite build scripts and try again. ❗`
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

  const orderedByLength = (
    [action.token, action.repositoryPath].filter(Boolean) as string[]
  ).sort((a, b) => b.length - a.length)

  for (const find of orderedByLength) {
    value = replaceAll(value, find, '***')
  }

  return value
}

export const extractErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : typeof error == 'string'
    ? error
    : JSON.stringify(error)

/** Strips the protocol from a provided URL. */
export const stripProtocolFromUrl = (url: string): string =>
  url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]
