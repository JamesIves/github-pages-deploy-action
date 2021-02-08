import { ActionInterface } from './constants';
export declare const isNullOrUndefined: (value: any) => boolean;
export declare const generateTokenType: (action: ActionInterface) => string;
export declare const generateRepositoryPath: (action: ActionInterface) => string;
export declare const generateFolderPath: (action: ActionInterface) => string;
export declare const checkParameters: (action: ActionInterface) => void;
export declare const suppressSensitiveInformation: (str: string, action: ActionInterface) => string;
