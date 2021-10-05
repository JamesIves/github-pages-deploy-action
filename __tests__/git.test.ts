// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'

import {mkdirP, rmRF} from '@actions/io'
import {action, Status, TestFlag} from '../src/constants'
import {execute} from '../src/execute'
import {deploy, init} from '../src/git'
import fs from 'fs'

const originalAction = JSON.stringify(action)

jest.mock('fs', () => ({
  existsSync: jest.fn()
}))

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  getInput: jest.fn(),
  setOutput: jest.fn(),
  isDebug: jest.fn(),
  info: jest.fn()
}))

jest.mock('@actions/io', () => ({
  rmRF: jest.fn(),
  mkdirP: jest.fn()
}))

jest.mock('../src/execute', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  execute: jest.fn()
}))

describe('git', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  describe('init', () => {
    it('should execute commands', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        token: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      await init(action)
      expect(execute).toBeCalledTimes(5)
    })

    it('should catch when a function throws an error', async () => {
      ;(execute as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked throw')
      })

      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        token: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      try {
        await init(action)
      } catch (error) {
        expect(error instanceof Error && error.message).toBe(
          'There was an error initializing the repository: Mocked throw ❌'
        )
      }
    })

    it('should correctly continue when it cannot unset a git config value', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        token: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.UNABLE_TO_UNSET_GIT_CONFIG
      })

      await init(action)
      expect(execute).toBeCalledTimes(5)
    })

    it('should not unset git config if a user is using ssh', async () => {
      // Sets and unsets the CI condition.
      process.env.CI = 'true'

      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        sshKey: true,
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: false
      })

      await init(action)
      expect(execute).toBeCalledTimes(4)

      process.env.CI = undefined
    })

    it('should correctly continue when it cannot remove origin', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        token: '123',
        branch: 'branch',
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.UNABLE_TO_REMOVE_ORIGIN
      })

      await init(action)
      expect(execute).toBeCalledTimes(5)
    })
  })

  describe('deploy', () => {
    it('should execute commands', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        repositoryName: 'JamesIves/montezuma',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      const response = await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should not push when asked to dryRun', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        dryRun: true,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      const response = await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(11)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should execute commands with single commit toggled', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'other',
        folderPath: 'other',
        branch: 'branch',
        token: '123',
        singleCommit: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should execute commands with single commit toggled and existing branch', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'other',
        folderPath: 'other',
        branch: 'branch',
        token: '123',
        singleCommit: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        isTest: TestFlag.HAS_CHANGED_FILES | TestFlag.HAS_REMOTE_BRANCH
      })

      await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(11)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should execute commands with single commit and dryRun toggled', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'other',
        folderPath: 'other',
        branch: 'branch',
        gitHubToken: '123',
        singleCommit: true,
        dryRun: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(11)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should not ignore CNAME or nojekyll if they exist in the deployment folder', async () => {
      ;(fs.existsSync as jest.Mock)
        .mockImplementationOnce(() => {
          return true
        })
        .mockImplementationOnce(() => {
          return true
        })

      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        folderPath: 'assets',
        branch: 'branch',
        token: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      const response = await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
      expect(fs.existsSync).toBeCalledTimes(2)
      expect(response).toBe(Status.SUCCESS)
    })

    describe('with empty GITHUB_SHA', () => {
      const oldSha = process.env.GITHUB_SHA
      afterAll(() => {
        process.env.GITHUB_SHA = oldSha
      })
      it('should execute commands with clean options', async () => {
        process.env.GITHUB_SHA = ''
        Object.assign(action, {
          hostname: 'github.com',
          silent: false,
          folder: 'other',
          folderPath: 'other',
          branch: 'branch',
          token: '123',
          pusher: {
            name: 'asd',
            email: 'as@cat'
          },
          clean: true,
          workspace: 'other',
          isTest: TestFlag.NONE
        })

        await deploy(action)

        // Includes the call to generateWorktree
        expect(execute).toBeCalledTimes(9)
        expect(rmRF).toBeCalledTimes(1)
      })
    })

    it('should execute commands with clean options stored as an array', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        folderPath: 'assets',
        branch: 'branch',
        token: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        cleanExclude: ['cat', 'montezuma'],
        isTest: TestFlag.NONE
      })

      await deploy(action)

      // Includes the call to generateWorktree
      expect(execute).toBeCalledTimes(9)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should gracefully handle target folder', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: '.',
        branch: 'branch',
        token: '123',
        pusher: {},
        clean: true,
        targetFolder: 'new_folder',
        commitMessage: 'Hello!',
        isTest: TestFlag.NONE
      })

      await deploy(action)

      expect(execute).toBeCalledTimes(9)
      expect(rmRF).toBeCalledTimes(1)
      expect(mkdirP).toBeCalledTimes(1)
    })

    it('should stop early if there is nothing to commit', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.NONE // Setting this flag to None means there will never be anything to commit and the action will exit early.
      })

      const response = await deploy(action)
      expect(execute).toBeCalledTimes(9)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SKIPPED)
    })

    it('should catch when a function throws an error', async () => {
      ;(execute as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mocked throw')
      })

      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      try {
        await deploy(action)
      } catch (error) {
        expect(error instanceof Error && error.message).toBe(
          'The deploy step encountered an error: Mocked throw ❌'
        )
      }
    })
  })
})
