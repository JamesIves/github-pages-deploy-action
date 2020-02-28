import { actionInterface } from "./constants";
/** Utility function that checks to see if a value is undefined or not.
 * @param {*} value = The value to check.
 * @returns {boolean}
 */
export declare function isNullOrUndefined(value: any): boolean;
export declare const generateTokenType: (action: actionInterface) => string;
export declare const generateRepositoryPath: (action: actionInterface) => string;
/** Checks for the required tokens and formatting. Throws an error if any case is matched. */
export declare const hasRequiredParameters: (action: actionInterface) => void;
