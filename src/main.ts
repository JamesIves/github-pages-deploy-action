import { setFailed } from "@actions/core";
import { init, deploy } from "./git";

/** Initializes and runs the action. */
export default async function main() {
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

// Init
main();
