import { ActionInterface } from './constants';
/**
 * Utility function that checks to see if a value is undefined or not.
 * If allowEmptyString is passed the parameter is allowed to contain an empty string as a valid parameter.
 */
export declare const isNullOrUndefined: (value: unknown) => value is "" | null | undefined;
/**
 * Generates a token type used for the action.
 */
export declare const generateTokenType: (action: ActionInterface) => string;
/**
 * Generates a the repository path used to make the commits.
 */
export declare const generateRepositoryPath: (action: ActionInterface) => string;
/**
 * Generate absolute folder path by the provided folder name
 */
export declare const generateFolderPath: (action: ActionInterface) => string;
/**
 * Verifies the action has the required parameters to run, otherwise throw an error.
 */
export declare const checkParameters: (action: ActionInterface) => void;
/**
 * Suppresses sensitive information from being exposed in error messages.
 */
export declare const suppressSensitiveInformation: (str: string, action: ActionInterface) => string;
/**
 * Extracts message from an error object.
 */
export declare const extractErrorMessage: (error: unknown) => string;
/**
 * Strips the protocol from a provided URL.
 */
export declare const stripProtocolFromUrl: (url: string) => string;
