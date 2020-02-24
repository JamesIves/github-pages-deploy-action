import { actionInterface } from "./constants";

/** Utility function that checks to see if a value is undefined or not.
 * @param {*} value = The value to check.
 * @returns {boolean}
 */
export function isNullOrUndefined(value: any): boolean {
  return typeof value === "undefined" || value === null || value === "";
}

/* Generates a token type used for the action. */
export const generateTokenType = (action: actionInterface): string =>
  action.ssh
    ? "SSH Deploy Key"
    : action.accessToken
    ? "Access Token"
    : action.gitHubToken
    ? "GitHub Token"
    : "...";

/* Generates a the repository path used to make the commits. */
export const generateRepositoryPath = (action: actionInterface): string =>
  action.ssh
    ? `git@github.com:${action.gitHubRepository}`
    : `https://${action.accessToken ||
        `x-access-token:${action.gitHubToken}`}@github.com/${
        action.gitHubRepository
      }.git`;
