"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripProtocolFromUrl = exports.extractErrorMessage = exports.suppressSensitiveInformation = exports.checkParameters = exports.generateFolderPath = exports.generateRepositoryPath = exports.generateTokenType = exports.isNullOrUndefined = void 0;
const core_1 = require("@actions/core");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/* Replaces all instances of a match in a string. */
const replaceAll = (input, find, replace) => input.split(find).join(replace);
/* Utility function that checks to see if a value is undefined or not.
  If allowEmptyString is passed the parameter is allowed to contain an empty string as a valid parameter. */
const isNullOrUndefined = (value) => typeof value === 'undefined' || value === null || value === '';
exports.isNullOrUndefined = isNullOrUndefined;
/* Generates a token type used for the action. */
const generateTokenType = (action) => action.sshKey ? 'SSH Deploy Key' : action.token ? 'Deploy Token' : '…';
exports.generateTokenType = generateTokenType;
/* Generates a the repository path used to make the commits. */
const generateRepositoryPath = (action) => action.sshKey
    ? `git@${action.hostname}:${action.repositoryName}`
    : `https://${`x-access-token:${action.token}`}@${action.hostname}/${action.repositoryName}.git`;
exports.generateRepositoryPath = generateRepositoryPath;
/* Genetate absolute folder path by the provided folder name */
const generateFolderPath = (action) => {
    const folderName = action['folder'];
    return path_1.default.isAbsolute(folderName)
        ? folderName
        : folderName.startsWith('~')
            ? folderName.replace('~', process.env.HOME)
            : path_1.default.join(action.workspace, folderName);
};
exports.generateFolderPath = generateFolderPath;
/* Checks for the required tokens and formatting. Throws an error if any case is matched. */
const hasRequiredParameters = (action, params) => {
    const nonNullParams = params.filter(param => !(0, exports.isNullOrUndefined)(action[param]));
    return Boolean(nonNullParams.length);
};
/* Verifies the action has the required parameters to run, otherwise throw an error. */
const checkParameters = (action) => {
    if (!hasRequiredParameters(action, ['token', 'sshKey'])) {
        throw new Error('No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.');
    }
    if (!hasRequiredParameters(action, ['branch'])) {
        throw new Error('Branch is required.');
    }
    if (!hasRequiredParameters(action, ['folder'])) {
        throw new Error('You must provide the action with a folder to deploy.');
    }
    if (!(0, fs_1.existsSync)(action.folderPath)) {
        throw new Error(`The directory you're trying to deploy named ${action.folderPath} doesn't exist. Please double check the path and any prerequisite build scripts and try again. ❗`);
    }
};
exports.checkParameters = checkParameters;
/* Suppresses sensitive information from being exposed in error messages. */
const suppressSensitiveInformation = (str, action) => {
    let value = str;
    if ((0, core_1.isDebug)()) {
        // Data is unmasked in debug mode.
        return value;
    }
    const orderedByLength = [action.token, action.repositoryPath].filter(Boolean).sort((a, b) => b.length - a.length);
    for (const find of orderedByLength) {
        value = replaceAll(value, find, '***');
    }
    return value;
};
exports.suppressSensitiveInformation = suppressSensitiveInformation;
const extractErrorMessage = (error) => error instanceof Error
    ? error.message
    : typeof error == 'string'
        ? error
        : JSON.stringify(error);
exports.extractErrorMessage = extractErrorMessage;
/** Strips the protocol from a provided URL. */
const stripProtocolFromUrl = (url) => url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
exports.stripProtocolFromUrl = stripProtocolFromUrl;
