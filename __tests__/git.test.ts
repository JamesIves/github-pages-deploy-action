// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'

import {mkdirP, rmRF} from '@actions/io'
import {action, Status} from '../src/constants'
import {execute} from '../src/execute'
import {deploy, generateBranch, init, switchToBaseBranch} from '../src/git'
import fs from 'fs'

const originalAction = JSON.stringify(action)

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  getInput: jest.fn(),
  isDebug: jest.fn(),
  info: jest.fn()
}))

jest.mock('@actions/io', () => ({
  rmRF: jest.fn(),
  mkdirP: jest.fn()
}))

jest.mock('../src/execute', () => ({
  __esModule: true,
  execute: jest.fn()
}))

describe('git', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  describe('init', () => {
    it('should stash changes if preserve is true', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        preserve: true,
        isTest: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await init(action)
      expect(execute).toBeCalledTimes(7)
    })

    it('should catch when a function throws an error', async () => {
      ;(execute as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked throw')
      })

      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        preserve: true,
        isTest: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await init(action)
      } catch (error) {
        expect(error.message).toBe(
          'There was an error initializing the repository: Mocked throw ❌'
        )
      }
    })
  })

  describe('generateBranch', () => {
    it('should execute six commands', async () => {
      Object.assign(action, {
        silent: false,
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await generateBranch(action)
      expect(execute).toBeCalledTimes(6)
    })

    it('should catch when a function throws an error', async () => {
      ;(execute as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked throw')
      })

      Object.assign(action, {
        silent: false,
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await generateBranch(action)
      } catch (error) {
        expect(error.message).toBe(
          'There was an error creating the deployment branch: There was an error switching to the base branch: Mocked throw ❌ ❌'
        )
      }
    })
  })

  describe('switchToBaseBranch', () => {
    it('should execute one command', async () => {
      Object.assign(action, {
        silent: false,
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await switchToBaseBranch(action)
      expect(execute).toBeCalledTimes(1)
    })

    it('should execute one command if using custom baseBranch', async () => {
      Object.assign(action, {
        silent: false,
        baseBranch: '123',
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await switchToBaseBranch(action)
      expect(execute).toBeCalledTimes(1)
    })

    it('should catch when a function throws an error', async () => {
      ;(execute as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked throw')
      })

      Object.assign(action, {
        silent: false,
        baseBranch: '123',
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await switchToBaseBranch(action)
      } catch (error) {
        expect(error.message).toBe(
          'There was an error switching to the base branch: Mocked throw ❌'
        )
      }
    })
  })

  describe('deploy', () => {
    it('should execute commands', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        lfs: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      const response = await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(13)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should execute stash apply commands if preserve is true', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        folderPath: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        lfs: true,
        preserve: true,
        isTest: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      const response = await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(14)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should appropriately move along if git stash errors', async () => {
      ;(execute as jest.Mock).mockImplementation(cmd => {
        if (cmd === 'git stash apply') {
          // Mocks the case where git stash apply errors.
          throw new Error()
        }
      })

      Object.assign(action, {
        silent: false,
        folder: 'assets',
        folderPath: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        lfs: true,
        preserve: true,
        isTest: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      const response = await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(14)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should execute commands with single commit toggled', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'other',
        folderPath: 'other',
        branch: 'branch',
        gitHubToken: '123',
        singleCommit: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true
      })

      await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(18)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should not ignore CNAME or nojekyll if they exist in the deployment folder', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        folderPath: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true
      })

      fs.createWriteStream('assets/.nojekyll')
      fs.createWriteStream('assets/CNAME')

      const response = await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should execute commands with clean options, ommits sha commit message', async () => {
      process.env.GITHUB_SHA = ''
      Object.assign(action, {
        silent: false,
        folder: 'other',
        folderPath: 'other',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        cleanExclude: '["cat", "montezuma"]',
        workspace: 'other'
      })

      await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should execute commands with clean options stored as an array instead', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        folderPath: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        cleanExclude: ['cat', 'montezuma']
      })

      await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should gracefully handle incorrectly formatted clean exclude items', async () => {
      Object.assign(action, {
        silent: false,
        folder: '.',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {},
        clean: true,
        targetFolder: 'new_folder',
        commitMessage: 'Hello!',
        isTest: true,
        cleanExclude: '["cat, "montezuma"]' // There is a syntax errror in the string.
      })

      await deploy(action)

      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
      expect(mkdirP).toBeCalledTimes(1)
    })

    it('should stop early if there is nothing to commit', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: false // Setting this env variable to false means there will never be anything to commit and the action will exit early.
      })

      const response = await deploy(action)
      expect(execute).toBeCalledTimes(13)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SKIPPED)
    })

    it('should catch when a function throws an error', async () => {
      ;(execute as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked throw')
      })

      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        lfs: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await deploy(action)
      } catch (error) {
        expect(error.message).toBe(
          'The deploy step encountered an error: Mocked throw ❌'
        )
      }
    })
  })
})
