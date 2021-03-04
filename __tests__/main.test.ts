/* eslint-disable import/first */
// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'
process.env['INPUT_DEBUG'] = 'debug'

import '../src/main'
import {action, TestFlag} from '../src/constants'
import run from '../src/lib'
import {execute} from '../src/execute'
import {rmRF} from '@actions/io'
import {setFailed, exportVariable} from '@actions/core'

const originalAction = JSON.stringify(action)

jest.mock('../src/execute', () => ({
  execute: jest.fn()
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
  info: jest.fn()
}))

describe('main', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  it('should run through the commands', async () => {
    Object.assign(action, {
      repositoryPath: 'JamesIves/github-pages-deploy-action',
      folder: 'assets',
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
    expect(execute).toBeCalledTimes(12)
    expect(rmRF).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(1)
  })

  it('should run through the commands and succeed', async () => {
    Object.assign(action, {
      hostname: 'github.com',
      repositoryPath: 'JamesIves/github-pages-deploy-action',
      folder: 'assets',
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
    expect(execute).toBeCalledTimes(16)
    expect(rmRF).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(1)
  })

  it('should throw if an error is encountered', async () => {
    Object.assign(action, {
      hostname: 'github.com',
      folder: 'assets',
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
    expect(execute).toBeCalledTimes(0)
    expect(setFailed).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(1)
  })
})
