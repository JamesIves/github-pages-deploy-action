"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppressSensitiveInformation = exports.hasRequiredParameters = exports.generateRepositoryPath = exports.generateTokenType = exports.isNullOrUndefined = void 0;
const core_1 = require("@actions/core");
/* Utility function that checks to see if a value is undefined or not. */
exports.isNullOrUndefined = (value) => typeof value === 'undefined' || value === null || value === '';
/* Generates a token type used for the action. */
exports.generateTokenType = (action) => action.ssh
    ? 'SSH Deploy Key'
    : action.accessToken
        ? 'Access Token'
        : action.gitHubToken
            ? 'GitHub Token'
            : '…';
/* Generates a the repository path used to make the commits. */
exports.generateRepositoryPath = (action) => action.ssh
    ? `git@github.com:${action.repositoryName}`
    : `https://${action.accessToken || `x-access-token:${action.gitHubToken}`}@github.com/${action.repositoryName}.git`;
/* Checks for the required tokens and formatting. Throws an error if any case is matched. */
exports.hasRequiredParameters = (action) => {
    if ((exports.isNullOrUndefined(action.accessToken) &&
        exports.isNullOrUndefined(action.gitHubToken) &&
        exports.isNullOrUndefined(action.ssh)) ||
        exports.isNullOrUndefined(action.repositoryPath) ||
        (action.accessToken && action.accessToken === '')) {
        throw new Error('No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.');
    }
    if (exports.isNullOrUndefined(action.branch)) {
        throw new Error('Branch is required.');
    }
    if (!action.folder || exports.isNullOrUndefined(action.folder)) {
        throw new Error('You must provide the action with a folder to deploy.');
    }
    if (action.folder.startsWith('/') || action.folder.startsWith('./')) {
        throw new Error("Incorrectly formatted build folder. The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.");
    }
};
/* Suppresses sensitive information from being exposed in error messages. */
exports.suppressSensitiveInformation = (str, action) => {
    let value = str;
    if (core_1.isDebug()) {
        // Data is unmasked in debug mode.
        return value;
    }
    if (action.accessToken) {
        value = value.replace(action.accessToken, '***');
    }
    if (action.gitHubToken) {
        value = value.replace(action.gitHubToken, '***');
    }
    if (action.repositoryPath) {
        value = value.replace(action.repositoryPath, '***');
    }
    return value;
};
