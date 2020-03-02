import { actionInterface } from "./constants";
import { deploy, generateBranch, init } from "./git";
/** Initializes and runs the action. */
export default function run(configuration: actionInterface): Promise<void>;
export { init, deploy, generateBranch, actionInterface };
