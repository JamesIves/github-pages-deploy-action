import {exportVariable, info, setFailed} from '@actions/core'
import {action, ActionInterface, Status} from './constants'
import {deploy, generateBranch, init} from './git'
import {generateRepositoryPath, generateTokenType} from './util'

/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default async function run(
  configuration: ActionInterface
): Promise<void> {
  let status: Status = Status.RUNNING

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
    status = await deploy(settings)
  } catch (error) {
    status = Status.FAILED
    setFailed(error.message)
  } finally {
    info(
      `${
        status === Status.FAILED
          ? 'Deployment Failed ❌'
          : status === Status.SUCCESS
          ? 'Completed Deployment Successfully! ✅'
          : 'There is nothing to commit. Exiting early… 📭'
      }`
    )

    exportVariable('DEPLOYMENT_STATUS', status)
  }
}

export {init, deploy, generateBranch, ActionInterface}
