/** Utility function that checks to see if a value is undefined or not.
 * @param {*} value = The value to check.
 * @returns {boolean}
 */
export function isNullOrUndefined(value: any): boolean {
  return typeof value === "undefined" || value === null || value === "";
}
