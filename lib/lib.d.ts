import { ActionInterface, NodeActionInterface } from './constants';
/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default function run(configuration: ActionInterface | NodeActionInterface): Promise<void>;
