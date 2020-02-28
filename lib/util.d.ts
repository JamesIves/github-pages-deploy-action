import { actionInterface } from "./constants";
export declare function isNullOrUndefined(value: any): boolean;
export declare const generateTokenType: (action: actionInterface) => string;
export declare const generateRepositoryPath: (action: actionInterface) => string;
export declare const hasRequiredParameters: (action: actionInterface) => void;
export declare const suppressSensitiveInformation: (str: string, action: actionInterface) => string;
