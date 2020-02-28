import { setFailed } from "@actions/core";
import { init, deploy, generateBranch } from "./git";
import { action, actionInterface } from "./constants";
import { generateRepositoryPath, generateTokenType } from "./util";

/** Initializes and runs the action. */
export default async function run(
  configuration: actionInterface
): Promise<void> {
  let errorState: boolean = false;

  try {
    console.log('Checking configuration and starting deployment...🚦')

    const settings = {
      ...action,
      ...configuration
    };
  
    // Defines the repository paths and token types.
    settings.repositoryPath = generateRepositoryPath(settings);
    settings.tokenType = generateTokenType(settings);

    await init(settings);
    await deploy(settings);
  } catch (error) {
    errorState = true;
    setFailed(error);
  } finally {
    console.log(
      `${
        errorState
          ? "Deployment Failed ❌"
          : "Completed Deployment Successfully! ✅"
      }`
    );
  }
}

export { init, deploy, generateBranch, actionInterface };
