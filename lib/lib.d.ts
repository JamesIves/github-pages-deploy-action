import { init, deploy, generateBranch } from "./git";
import { actionInterface } from "./constants";
/** Initializes and runs the action. */
export default function run(configuration: actionInterface): Promise<void>;
export { init, deploy, generateBranch, actionInterface };
