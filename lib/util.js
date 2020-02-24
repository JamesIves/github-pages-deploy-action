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
