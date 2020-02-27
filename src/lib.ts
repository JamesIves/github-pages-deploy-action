import { setFailed, setSecret } from "@actions/core";
import { init, deploy, generateBranch } from "./git";
import { action, actionInterface } from "./constants";
import { generateRepositoryPath, generateTokenType } from "./util";

/** Initializes and runs the action. */
export default async function run(
  configuration: actionInterface
): Promise<void> {
  /** Sensitive data is overwritten here to ensure they are being securely stored to prevent token leaking. */
  const settings = {
    ...action,
    ...configuration,
    accessToken: action.accessToken,
    gitHubToken: action.gitHubToken
  };

  // Defines the repository paths and token types.
  settings.repositoryPath = generateRepositoryPath(settings);
  settings.tokenType = generateTokenType(settings);

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

export { init, deploy, generateBranch, actionInterface };
