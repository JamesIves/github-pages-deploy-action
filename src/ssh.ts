import {exportVariable, info} from '@actions/core'
import {mkdirP} from '@actions/io'
import {execFileSync, execSync} from 'child_process'
import {appendFileSync} from 'fs'
import {ActionInterface} from './constants.js'
import {extractErrorMessage, suppressSensitiveInformation} from './util.js'

/**
 * Configures SSH for the workflow.
 */
export async function configureSSH(action: ActionInterface): Promise<void> {
  try {
    if (typeof action.sshKey === 'string') {
      const sshDirectory = `${process.env['HOME']}/.ssh`
      const sshKnownHostsDirectory = `${sshDirectory}/known_hosts`

      // GitHub.com SSH host keys:
      // https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints
      const sshGitHubKnownHostRsa = `\n${action.hostname} ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=\n`
      const sshGitHubKnownHostEcdsa = `\n${action.hostname} ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=\n`
      const sshGitHubKnownHostEd25519 = `\n${action.hostname} ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n`
      info(`Configuring SSH client… 🔑`)

      await mkdirP(sshDirectory)

      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostRsa)
      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostEcdsa)
      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostEd25519)

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
      )} ❌`,
      {cause: error}
    )
  }
}
