import {exportVariable} from '@actions/core'
import {mkdirP} from '@actions/io'
import child_process, {execFileSync, execSync} from 'child_process'
import {appendFileSync} from 'fs'
import {action, TestFlag} from '../src/constants.js'
import {execute} from '../src/execute.js'
import {configureSSH} from '../src/ssh.js'

const originalAction = JSON.stringify(action)
const expectedGitHubKnownHostRsa = `\ngithub.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=\n`
const expectedGitHubKnownHostEcdsa = `\ngithub.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=\n`
const expectedGitHubKnownHostEd25519 = `\ngithub.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n`

jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
  existsSync: jest.fn()
}))

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
  execSync: jest.fn()
}))

jest.mock('@actions/io')

jest.mock('@actions/core')

jest.mock('../src/execute', () => ({
  execute: jest.fn(() => ({stdout: '', stderr: ''}))
}))

describe('configureSSH', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  it('should skip client configuration if sshKey is set to true', async () => {
    Object.assign(action, {
      hostname: 'github.com',
      silent: false,
      folder: 'assets',
      branch: 'branch',
      sshKey: true,
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.HAS_CHANGED_FILES
    })

    await configureSSH(action)

    expect(execute).toHaveBeenCalledTimes(0)
    expect(mkdirP).toHaveBeenCalledTimes(0)
    expect(appendFileSync).toHaveBeenCalledTimes(0)
  })

  it('should configure the ssh client if a key is defined', async () => {
    ;(child_process.execFileSync as jest.Mock).mockImplementationOnce(() => {
      return 'SSH_AUTH_SOCK=/some/random/folder/agent.123; export SSH_AUTH_SOCK;\nSSH_AGENT_PID=123; export SSH_AGENT_PID;'
    })

    Object.assign(action, {
      hostname: 'github.com',
      silent: false,
      folder: 'assets',
      branch: 'branch',
      sshKey: '?=-----BEGIN 123 456\n 789',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.HAS_CHANGED_FILES
    })

    await configureSSH(action)

    expect(execFileSync).toHaveBeenCalledTimes(1)
    expect(exportVariable).toHaveBeenCalledTimes(2)
    expect(execSync).toHaveBeenCalledTimes(3)
    expect(appendFileSync).toHaveBeenCalledTimes(3)
expect(appendFileSync).toHaveBeenCalledWith(
  `${process.env['HOME']}/.ssh/known_hosts`,
  expectedGitHubKnownHostRsa
)
expect(appendFileSync).toHaveBeenCalledWith(
  `${process.env['HOME']}/.ssh/known_hosts`,
  expectedGitHubKnownHostEcdsa
)
expect(appendFileSync).toHaveBeenCalledWith(
  `${process.env['HOME']}/.ssh/known_hosts`,
  expectedGitHubKnownHostEd25519
)
expect(appendFileSync).not.toHaveBeenCalledWith(
  expect.any(String),
  expect.stringContaining('ssh-dss')
)
  })

  it('should not export variables if the return from ssh-agent is skewed', async () => {
    ;(child_process.execFileSync as jest.Mock).mockImplementationOnce(() => {
      return 'useless nonsense here;'
    })

    Object.assign(action, {
      hostname: 'github.com',
      silent: false,
      folder: 'assets',
      branch: 'branch',
      sshKey: '?=-----BEGIN 123 456\n 789',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.HAS_CHANGED_FILES
    })

    await configureSSH(action)

    expect(execFileSync).toHaveBeenCalledTimes(1)
    expect(exportVariable).toHaveBeenCalledTimes(0)
    expect(execSync).toHaveBeenCalledTimes(3)
  })

  it('should throw if something errors', async () => {
    ;(child_process.execFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mocked throw')
    })

    Object.assign(action, {
      hostname: 'github.com',
      silent: false,
      folder: 'assets',
      branch: 'branch',
      sshKey: 'real_key',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.HAS_CHANGED_FILES
    })

    try {
      await configureSSH(action)
    } catch (error) {
      expect(error instanceof Error && error.message).toBe(
        'The ssh client configuration encountered an error: Mocked throw ❌'
      )
    }
  })
})
