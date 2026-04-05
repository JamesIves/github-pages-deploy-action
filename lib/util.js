import { isDebug, warning } from '@actions/core';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { SupportedOperatingSystems } from './constants.js';
/**
 * Replaces all instances of a match in a string.
 */
const replaceAll = (input, find, replace) => input.split(find).join(replace);
/**
 * Utility function that checks to see if a value is undefined or not.
 * If allowEmptyString is passed the parameter is allowed to contain an empty string as a valid parameter.
 */
export const isNullOrUndefined = (value) => typeof value === 'undefined' || value === null || value === '';
/**
 * Generates a token type used for the action.
 */
export const generateTokenType = (action) => action.sshKey ? 'SSH Deploy Key' : action.token ? 'Deploy Token' : '…';
/**
 * Generates a the repository path used to make the commits.
 */
export const generateRepositoryPath = (action) => action.sshKey
    ? `git@${action.hostname}:${action.repositoryName}`
    : `https://${`x-access-token:${action.token}`}@${action.hostname}/${action.repositoryName}.git`;
/**
 * Generate absolute folder path by the provided folder name
 */
export const generateFolderPath = (action) => {
    const folderName = action['folder'];
    return path.isAbsolute(folderName)
        ? folderName
        : folderName.startsWith('~')
            ? folderName.replace('~', process.env.HOME)
            : path.join(action.workspace, folderName);
};
/**
 * Checks for the required tokens and formatting. Throws an error if any case is matched.
 */
const hasRequiredParameters = (action, params) => {
    const nonNullParams = params.filter(param => !isNullOrUndefined(action[param]));
    return Boolean(nonNullParams.length);
};
/**
 * Verifies the action has the required parameters to run, otherwise throw an error.
 */
export const checkParameters = (action) => {
    if (!hasRequiredParameters(action, ['token', 'sshKey'])) {
        throw new Error('No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. For more details on how to use an ssh deploy key please refer to the documentation.');
    }
    if (!hasRequiredParameters(action, ['branch'])) {
        throw new Error('Branch is required.');
    }
    if (!hasRequiredParameters(action, ['folder'])) {
        throw new Error('You must provide the action with a folder to deploy.');
    }
    if (!existsSync(action.folderPath)) {
        throw new Error(`The directory you're trying to deploy named ${action.folderPath} doesn't exist. Please double check the path and any prerequisite build scripts and try again. ❗`);
    }
    if (!SupportedOperatingSystems.includes(process.env.RUNNER_OS)) {
        warning(`The operating system you're using is not supported and results may be varied. Please refer to the documentation for more details. ❗`);
    }
};
/**
 * Suppresses sensitive information from being exposed in error messages.
 */
export const suppressSensitiveInformation = (str, action) => {
    let value = str;
    if (isDebug()) {
        // Data is unmasked in debug mode.
        return value;
    }
    const orderedByLength = [action.token, action.repositoryPath].filter(Boolean).sort((a, b) => b.length - a.length);
    for (const find of orderedByLength) {
        value = replaceAll(value, find, '***');
    }
    return value;
};
/**
 * Extracts message from an error object.
 */
export const extractErrorMessage = (error) => error instanceof Error
    ? error.message
    : typeof error == 'string'
        ? error
        : JSON.stringify(error);
/**
 * Strips the protocol from a provided URL.
 */
export const stripProtocolFromUrl = (url) => url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
/**
 * Gets the rsync version.
 */
export function getRsyncVersion() {
    try {
        const versionOutput = execSync('rsync --version').toString();
        const versionMatch = versionOutput.match(/rsync\s+version\s+(\d+\.\d+\.\d+)/);
        return versionMatch ? versionMatch[1] : '';
    }
    catch (error) {
        console.error(error);
        return '';
    }
}
