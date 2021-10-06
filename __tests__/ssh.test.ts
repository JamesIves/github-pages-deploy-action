import {exportVariable} from '@actions/core'
import {mkdirP} from '@actions/io'
import child_process, {execFileSync, execSync} from 'child_process'
import {appendFileSync} from 'fs'
import {action, TestFlag} from '../src/constants'
import {execute} from '../src/execute'
import {configureSSH} from '../src/ssh'

const originalAction = JSON.stringify(action)

jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
  existsSync: jest.fn()
}))

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
  execSync: jest.fn()
}))

jest.mock('@actions/io', () => ({
  rmRF: jest.fn(),
  mkdirP: jest.fn()
}))

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  getInput: jest.fn(),
  setOutput: jest.fn(),
  isDebug: jest.fn(),
  info: jest.fn(),
  exportVariable: jest.fn()
}))

jest.mock('../src/execute', () => ({
  execute: jest.fn()
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

    expect(execute).toBeCalledTimes(0)
    expect(mkdirP).toBeCalledTimes(0)
    expect(appendFileSync).toBeCalledTimes(0)
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

    expect(execFileSync).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(2)
    expect(execSync).toBeCalledTimes(3)
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

    expect(execFileSync).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(0)
    expect(execSync).toBeCalledTimes(3)
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
