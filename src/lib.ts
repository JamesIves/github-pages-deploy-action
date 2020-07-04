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
    info(`
    GitHub Pages Deploy Action 🚀

    🚀 Getting Started Guide: https://github.com/marketplace/actions/deploy-to-github-pages
    ❓ FAQ/Wiki: https://github.com/JamesIves/github-pages-deploy-action/wiki
    🔧 Support: https://github.com/JamesIves/github-pages-deploy-action/issues
    ⭐ Contribute: https://github.com/JamesIves/github-pages-deploy-action/blob/dev/CONTRIBUTING.md

    📣 Maintained by James Ives (https://jamesiv.es)`)

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
          ? 'Deployment failed! ❌'
          : status === Status.SUCCESS
          ? 'Completed deployment successfully! ✅'
          : 'There is nothing to commit. Exiting early… 📭'
      }`
    )

    exportVariable('DEPLOYMENT_STATUS', status)
  }
}

export {init, deploy, generateBranch, ActionInterface}
