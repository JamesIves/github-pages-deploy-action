import {info, setFailed} from '@actions/core'
import {action, ActionInterface} from './constants'
import {deploy, generateBranch, init} from './git'
import {generateRepositoryPath, generateTokenType} from './util'

/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default async function run(
  configuration: ActionInterface
): Promise<void> {
  let errorState = false

  try {
    info('Checking configuration and starting deployment… 🚦')

    const settings = {
      ...action,
      ...configuration
    }

    // Defines the repository paths and token types.
    settings.repositoryPath = generateRepositoryPath(settings)
    settings.tokenType = generateTokenType(settings)

    await init(settings)
    await deploy(settings)
  } catch (error) {
    errorState = true
    setFailed(error.message)
  } finally {
    info(
      `${
        errorState
          ? 'Deployment Failed ❌'
          : 'Completed Deployment Successfully! ✅'
      }`
    )
  }
}

export {init, deploy, generateBranch, ActionInterface}
