import { ActionInterface } from './constants';
import { deploy, generateBranch, init } from './git';
/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default function run(configuration: ActionInterface): Promise<void>;
export { init, deploy, generateBranch, ActionInterface };
