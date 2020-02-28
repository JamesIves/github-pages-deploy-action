"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Utility function that checks to see if a value is undefined or not.
 * @param {*} value = The value to check.
 * @returns {boolean}
 */
function isNullOrUndefined(value) {
    return typeof value === "undefined" || value === null || value === "";
}
exports.isNullOrUndefined = isNullOrUndefined;
/* Generates a token type used for the action. */
exports.generateTokenType = (action) => action.ssh
    ? "SSH Deploy Key"
    : action.accessToken
        ? "Access Token"
        : action.gitHubToken
            ? "GitHub Token"
            : "...";
/* Generates a the repository path used to make the commits. */
exports.generateRepositoryPath = (action) => action.ssh
    ? `git@github.com:${action.gitHubRepository}`
    : `https://${action.accessToken ||
        `x-access-token:${action.gitHubToken}`}@github.com/${action.gitHubRepository}.git`;
/** Checks for the required tokens and formatting. Throws an error if any case is matched. */
exports.hasRequiredParameters = (action) => {
    if ((isNullOrUndefined(action.accessToken) &&
        isNullOrUndefined(action.gitHubToken) &&
        isNullOrUndefined(action.ssh)) ||
        isNullOrUndefined(action.repositoryPath)) {
        throw "No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.";
    }
    if (isNullOrUndefined(action.branch)) {
        throw "Branch is required.";
    }
    if (!action.folder || isNullOrUndefined(action.folder)) {
        throw "You must provide the action with a folder to deploy.";
    }
    if (action.folder.startsWith("/") || action.folder.startsWith("./")) {
        throw "Incorrectly formatted build folder. The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.";
    }
};
