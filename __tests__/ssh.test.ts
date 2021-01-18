import {mkdirP} from '@actions/io'
import {appendFileSync} from 'fs'
import {action, TestFlag} from '../src/constants'
import {execute} from '../src/execute'
import {configureSSH} from '../src/ssh'

const originalAction = JSON.stringify(action)

jest.mock('fs', () => ({
  appendFileSync: jest.fn(),
  existsSync: jest.fn()
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
  info: jest.fn()
}))

jest.mock('../src/execute', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  execute: jest.fn()
}))

describe('configureSSH', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  it('should skip client configuration if sshKey is set to true', async () => {
    Object.assign(action, {
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
    Object.assign(action, {
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

    expect(execute).toBeCalledTimes(4)
    expect(mkdirP).toBeCalledTimes(1)
    expect(appendFileSync).toBeCalledTimes(2)
  })

  it('should throw if something errors', async () => {
    ;(execute as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mocked throw')
    })

    Object.assign(action, {
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
      expect(error.message).toBe(
        'The ssh client configuration encountered an error: Mocked throw ❌'
      )
    }
  })
})
