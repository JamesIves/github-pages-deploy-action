import { setFailed } from "@actions/core";
import { init, deploy, generateBranch } from "./git";
import { action, actionInterface } from "./constants";

/** Initializes and runs the action. */
export default async function run(
  configuration: actionInterface
): Promise<void> {
  /** Sensitive data is overwritten here to ensure they are being securely stored to prevent token leaking. */
  const settings = {
    ...configuration,
    accessToken: action.accessToken,
    gitHubToken: action.gitHubToken
  };

  try {
    await init(settings);
    await deploy(settings);
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
