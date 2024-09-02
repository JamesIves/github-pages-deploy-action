import { ActionInterface, NodeActionInterface } from './constants';
/**
 * Initializes and runs the action.
 */
export default function run(configuration?: ActionInterface | NodeActionInterface): Promise<void>;
