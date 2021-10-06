import {exportVariable, info} from '@actions/core'
import {mkdirP} from '@actions/io'
import {execFileSync, execSync} from 'child_process'
import {appendFileSync} from 'fs'
import {ActionInterface} from './constants'
import {extractErrorMessage, suppressSensitiveInformation} from './util'

export async function configureSSH(action: ActionInterface): Promise<void> {
  try {
    if (typeof action.sshKey === 'string') {
      const sshDirectory = `${process.env['HOME']}/.ssh`
      const sshKnownHostsDirectory = `${sshDirectory}/known_hosts`

      // SSH fingerprints provided by GitHub: https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/githubs-ssh-key-fingerprints
      const sshGitHubKnownHostRsa = `\n${action.hostname} ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==\n`
      const sshGitHubKnownHostDss = `\n${action.hostname} ssh-dss AAAAB3NzaC1kc3MAAACBANGFW2P9xlGU3zWrymJgI/lKo//ZW2WfVtmbsUZJ5uyKArtlQOT2+WRhcg4979aFxgKdcsqAYW3/LS1T2km3jYW/vr4Uzn+dXWODVk5VlUiZ1HFOHf6s6ITcZvjvdbp6ZbpM+DuJT7Bw+h5Fx8Qt8I16oCZYmAPJRtu46o9C2zk1AAAAFQC4gdFGcSbp5Gr0Wd5Ay/jtcldMewAAAIATTgn4sY4Nem/FQE+XJlyUQptPWMem5fwOcWtSXiTKaaN0lkk2p2snz+EJvAGXGq9dTSWHyLJSM2W6ZdQDqWJ1k+cL8CARAqL+UMwF84CR0m3hj+wtVGD/J4G5kW2DBAf4/bqzP4469lT+dF2FRQ2L9JKXrCWcnhMtJUvua8dvnwAAAIB6C4nQfAA7x8oLta6tT+oCk2WQcydNsyugE8vLrHlogoWEicla6cWPk7oXSspbzUcfkjN3Qa6e74PhRkc7JdSdAlFzU3m7LMkXo1MHgkqNX8glxWNVqBSc0YRdbFdTkL0C6gtpklilhvuHQCdbgB3LBAikcRkDp+FCVkUgPC/7Rw==\n`

      info(`Configuring SSH client… 🔑`)

      await mkdirP(sshDirectory)

      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostRsa)
      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostDss)

      // Initializes SSH agent.
      const agentOutput = execFileSync('ssh-agent').toString().split('\n')

      agentOutput.map(line => {
        const exportableVariables =
          /^(SSH_AUTH_SOCK|SSH_AGENT_PID)=(.*); export \1/.exec(line)

        if (exportableVariables && exportableVariables.length) {
          exportVariable(exportableVariables[1], exportableVariables[2])
        }
      })

      // Adds the SSH key to the agent.
      action.sshKey.split(/(?=-----BEGIN)/).map(async line => {
        execSync('ssh-add -', {input: `${line.trim()}\n`})
      })

      execSync('ssh-add -l')
    } else {
      info(`Skipping SSH client configuration… ⌚`)
    }
  } catch (error) {
    throw new Error(
      `The ssh client configuration encountered an error: ${suppressSensitiveInformation(
        extractErrorMessage(error),
        action
      )} ❌`
    )
  }
}
