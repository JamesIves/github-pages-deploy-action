import {exportVariable, info, notice, setFailed, setOutput} from '@actions/core'
import {ActionInterface, NodeActionInterface, Status} from './constants'
import {deploy, init} from './git'
import {configureSSH} from './ssh'
import {
  checkParameters,
  extractErrorMessage,
  generateFolderPath,
  generateRepositoryPath,
  generateTokenType,
  isNullOrUndefined
} from './util'

/** Initializes and runs the action.
 *
 * @param {object} configuration - The action configuration.
 */
export default async function run(
  configuration: ActionInterface | NodeActionInterface
): Promise<void> {
  let status: Status = Status.RUNNING

  try {
    info(`
    ╭━━━╮╭╮╭╮╱╭╮╱╱╭╮╱╱╭━━━╮
    ┃╭━╮┣╯╰┫┃╱┃┃╱╱┃┃╱╱┃╭━╮┃
    ┃┃╱╰╋╮╭┫╰━╯┣╮╭┫╰━╮┃╰━╯┣━━┳━━┳━━┳━━╮
    ┃┃╭━╋┫┃┃╭━╮┃┃┃┃╭╮┃┃╭━━┫╭╮┃╭╮┃┃━┫━━┫
    ┃╰┻━┃┃╰┫┃╱┃┃╰╯┃╰╯┃┃┃╱╱┃╭╮┃╰╯┃┃━╋━━┃
    ╰━━━┻┻━┻╯╱╰┻━━┻━━╯╰╯╱╱╰╯╰┻━╮┣━━┻━━╯
    ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╭━╯┃
    ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╰━━╯
    ╭━━━╮╱╱╱╱╱╭╮╱╱╱╱╱╱╱╱╭━━━╮╱╱╭╮
    ╰╮╭╮┃╱╱╱╱╱┃┃╱╱╱╱╱╱╱╱┃╭━╮┃╱╭╯╰╮
    ╱┃┃┃┣━━┳━━┫┃╭━━┳╮╱╭╮┃┃╱┃┣━┻╮╭╋┳━━┳━╮
    ╱┃┃┃┃┃━┫╭╮┃┃┃╭╮┃┃╱┃┃┃╰━╯┃╭━┫┃┣┫╭╮┃╭╮╮
    ╭╯╰╯┃┃━┫╰╯┃╰┫╰╯┃╰━╯┃┃╭━╮┃╰━┫╰┫┃╰╯┃┃┃┃
    ╰━━━┻━━┫╭━┻━┻━━┻━╮╭╯╰╯╱╰┻━━┻━┻┻━━┻╯╰╯
    ╱╱╱╱╱╱╱┃┃╱╱╱╱╱╱╭━╯┃
    ╱╱╱╱╱╱╱╰╯╱╱╱╱╱╱╰━━╯
    `)

    info(`
    💖 Support: https://github.com/sponsors/JamesIves
    📣 Maintained by James Ives: https://jamesiv.es

    🚀 Getting Started Guide: https://github.com/JamesIves/github-pages-deploy-action
    ❓ Discussions / Q&A: https://github.com/JamesIves/github-pages-deploy-action/discussions
    🔧 Report a Bug: https://github.com/JamesIves/github-pages-deploy-action/issues`)

    info('Checking configuration and starting deployment… 🚦')

    const settings: ActionInterface = {
      ...configuration,
      // Set the default branch for Node configurations
      branch: !isNullOrUndefined(configuration.branch)
        ? configuration.branch
        : 'gh-pages'
    }

    // Defines the repository/folder paths and token types.
    // Also verifies that the action has all of the required parameters.
    settings.folderPath = generateFolderPath(settings)

    checkParameters(settings)

    settings.repositoryPath = generateRepositoryPath(settings)
    settings.tokenType = generateTokenType(settings)

    if (settings.sshKey) {
      await configureSSH(settings)
    }

    await init(settings)
    status = await deploy(settings)
  } catch (error) {
    status = Status.FAILED

    setFailed(extractErrorMessage(error))
  } finally {
    if (status === Status.FAILED) {
      notice('Deployment failed! ❌')
    } else if (status === Status.SUCCESS) {
      info('Completed deployment successfully! ✅')
    } else {
      info('There is nothing to commit. Exiting early… 📭')
    }

    exportVariable('deployment_status', status)
    setOutput('deployment-status', status)
  }
}
