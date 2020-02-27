import { actionInterface } from "./constants";
/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
export declare function init(action: actionInterface): Promise<void>;
/** Switches to the base branch.
 * @returns {Promise}
 */
export declare function switchToBaseBranch(action: actionInterface): Promise<string>;
/** Generates the branch if it doesn't exist on the remote. */
export declare function generateBranch(action: actionInterface): Promise<void>;
/** Runs the necessary steps to make the deployment. */
export declare function deploy(action: actionInterface): Promise<void>;
