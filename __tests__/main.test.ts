// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'
process.env['INPUT_DEBUG'] = 'debug'

import '../src/main'
import {action} from '../src/constants'
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
      folder: 'build',
      branch: 'branch',
      gitHubToken: '123',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: false,
      debug: true
    })
    await run(action)
    expect(execute).toBeCalledTimes(19)
    expect(rmRF).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(1)
  })

  it('should run through the commands and succeed', async () => {
    Object.assign(action, {
      repositoryPath: 'JamesIves/github-pages-deploy-action',
      folder: 'build',
      branch: 'branch',
      gitHubToken: '123',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      }
    })
    await run(action)
    expect(execute).toBeCalledTimes(18)
    expect(rmRF).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(1)
  })

  it('should throw if an error is encountered', async () => {
    Object.assign(action, {
      folder: 'build',
      branch: 'branch',
      baseBranch: 'master',
      gitHubToken: null,
      ssh: null,
      accessToken: null,
      pusher: {
        name: 'asd',
        email: 'as@cat'
      },
      isTest: true
    })
    await run(action)
    expect(execute).toBeCalledTimes(0)
    expect(setFailed).toBeCalledTimes(1)
    expect(exportVariable).toBeCalledTimes(1)
  })
})
