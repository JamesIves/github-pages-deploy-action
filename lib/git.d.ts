import { actionInterface } from "./constants";
export declare function init(action: actionInterface): Promise<void | Error>;
export declare function switchToBaseBranch(action: actionInterface): Promise<void>;
export declare function generateBranch(action: actionInterface): Promise<void>;
export declare function deploy(action: actionInterface): Promise<void>;
