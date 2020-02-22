import { setFailed } from "@actions/core";
import { init, deploy, generateBranch } from "./git";

/** Initializes and runs the action. */
export default async function run(): Promise<void> {
  try {
    await init();
    await deploy();
  } catch (error) {
    /* istanbul ignore next */
    console.log("The deployment encountered an error. ❌");

    /* istanbul ignore next */
    setFailed(error);
  } finally {
    console.log("Completed Deployment ✅");
  }
}

export { init, deploy, generateBranch };
