import { ActionInterface, Status } from './constants.js';
/**
 * Initializes git in the workspace.
 */
export declare function init(action: ActionInterface): Promise<void | Error>;
/**
 * Runs the necessary steps to make the deployment.
 */
export declare function deploy(action: ActionInterface): Promise<Status>;
