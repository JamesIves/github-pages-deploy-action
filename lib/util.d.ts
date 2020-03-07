import { ActionInterface } from './constants';
export declare const isNullOrUndefined: (value: any) => boolean;
export declare const generateTokenType: (action: ActionInterface) => string;
export declare const generateRepositoryPath: (action: ActionInterface) => string;
export declare const hasRequiredParameters: (action: ActionInterface) => void;
export declare const suppressSensitiveInformation: (str: string, action: ActionInterface) => string;
