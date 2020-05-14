import { ActionInterface, Status } from './constants';
export declare function init(action: ActionInterface): Promise<void | Error>;
export declare function switchToBaseBranch(action: ActionInterface): Promise<void>;
export declare function generateBranch(action: ActionInterface): Promise<void>;
export declare function deploy(action: ActionInterface): Promise<Status>;
