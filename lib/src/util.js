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
