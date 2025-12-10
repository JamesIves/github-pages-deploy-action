// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'
process.env['INPUT_DEBUG'] = 'debug'
process.env['GITHUB_REF_NAME'] = 'test'
process.env['RUNNER_OS'] = 'Linux'
process.env['CI'] = 'true'

import '../src/main'
import {action, TestFlag} from '../src/constants'
import run from '../src/lib'
import {execute} from '../src/execute'
import {rmRF} from '@actions/io'
import {setFailed, exportVariable} from '@actions/core'

const originalAction = JSON.stringify(action)

jest.mock('../src/execute', () => ({
  execute: jest.fn(() => ({stdout: '', stderr: ''}))
}))

jest.mock('@actions/io', () => ({
  rmRF: jest.fn()
}))

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  getInput: jest.fn(),
  setOutput: jest.fn(),
  exportVariable: jest.fn(),
  isDebug: jest.fn(),
  info: jest.fn(),
  notice: jest.fn()
}))

describe('main', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  it('should run through the commands', async () => {
    Object.assign(action, {
      repositoryPath: 'JamesIves/github-pages-deploy-action',
      folder: '.github/docs',
      branch: 'branch',
      token: '123',
      hostname: 'github.com',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.NONE,
      debug: true
    })
    await run(action)
    expect(execute).toHaveBeenCalledTimes(19)
    expect(rmRF).toHaveBeenCalledTimes(1)
    expect(exportVariable).toHaveBeenCalledTimes(1)
  })

  it('should run through the commands and succeed', async () => {
    Object.assign(action, {
      hostname: 'github.com',
      repositoryPath: 'JamesIves/github-pages-deploy-action',
      folder: '.github/docs',
      branch: 'branch',
      token: '123',
      sshKey: true,
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.HAS_CHANGED_FILES
    })
    await run(action)
    expect(execute).toHaveBeenCalledTimes(22)
    expect(rmRF).toHaveBeenCalledTimes(1)
    expect(exportVariable).toHaveBeenCalledTimes(1)
  })

  it('should throw if an error is encountered', async () => {
    Object.assign(action, {
      hostname: 'github.com',
      folder: '.github/docs',
      branch: 'branch',
      token: null,
      sshKey: null,
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: TestFlag.HAS_CHANGED_FILES
    })
    await run(action)
    expect(execute).toHaveBeenCalledTimes(0)
    expect(setFailed).toHaveBeenCalledTimes(1)
    expect(exportVariable).toHaveBeenCalledTimes(1)
  })
})
