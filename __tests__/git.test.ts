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
  execute: jest.fn()
}))

describe('git', () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction))
  })

  describe('init', () => {
    it('should execute commands if a GitHub token is provided', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await init(action)
      expect(execute).toBeCalledTimes(6)
    })

    it('should execute commands if an Access Token is provided', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        folder: 'assets',
        branch: 'branch',
        accessToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await init(action)
      expect(execute).toBeCalledTimes(6)
    })

    it('should execute commands if SSH is true', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        folder: 'assets',
        branch: 'branch',
        ssh: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await init(action)

      expect(execute).toBeCalledTimes(6)
    })

    it('should fail if there is no provided GitHub Token, Access Token or SSH bool', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: null,
        folder: 'assets',
        branch: 'branch',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await init(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          'There was an error initializing the repository: No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true. ❌'
        )
      }
    })

    it('should fail if access token is defined but it is an empty string', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: null,
        folder: 'assets',
        branch: 'branch',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        accessToken: ''
      })

      try {
        await init(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          'There was an error initializing the repository: No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true. ❌'
        )
      }
    })

    it('should fail if there is no folder', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        gitHubToken: '123',
        branch: 'branch',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        folder: null,
        ssh: true
      })

      try {
        await init(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          'There was an error initializing the repository: You must provide the action with a folder to deploy. ❌'
        )
      }
    })

    it('should fail if there is no provided repository path', async () => {
      Object.assign(action, {
        silent: true,
        repositoryPath: null,
        folder: 'assets',
        branch: 'branch',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        gitHubToken: '123',
        accessToken: null,
        ssh: null
      })

      try {
        await init(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          'There was an error initializing the repository: No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true. '
        )
      }
    })

    it('should fail if the build folder begins with a /', async () => {
      Object.assign(action, {
        silent: false,
        accessToken: '123',
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        branch: 'branch',
        folder: '/',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await init(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          "There was an error initializing the repository: Incorrectly formatted build folder. The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly. ❌"
        )
      }
    })

    it('should fail if the build folder begins with a ./', async () => {
      Object.assign(action, {
        silent: false,
        accessToken: '123',
        branch: 'branch',
        folder: './',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await init(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          "There was an error initializing the repository: Incorrectly formatted build folder. The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly. ❌"
        )
      }
    })

    it('should not fail if root is used', async () => {
      Object.assign(action, {
        silent: false,
        repositoryPath: 'JamesIves/github-pages-deploy-action',
        accessToken: '123',
        branch: 'branch',
        folder: '.',
        root: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await init(action)

      expect(execute).toBeCalledTimes(6)
    })

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

    it('should fail if there is no branch', async () => {
      Object.assign(action, {
        silent: false,
        accessToken: '123',
        branch: null,
        folder: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await generateBranch(action)
      } catch (e) {
        expect(e.message).toMatch(
          'There was an error creating the deployment branch: Branch is required. ❌'
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

    it('should fail if one of the required parameters is not available', async () => {
      Object.assign(action, {
        silent: false,
        baseBranch: '123',
        accessToken: null,
        gitHubToken: null,
        ssh: null,
        branch: 'branch',
        folder: null,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      try {
        await switchToBaseBranch(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(0)
        expect(e.message).toMatch(
          'There was an error switching to the base branch: No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true. ❌'
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

    it('should not ignore CNAME or nojekyll if they exist in the deployment folder', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true
      })

      const response = await deploy(action)

      fs.createWriteStream('assets/.nojekyll')
      fs.createWriteStream('assets/CNAME')

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(12)
      expect(rmRF).toBeCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should execute commands with single commit toggled', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        singleCommit: true,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }
      })

      await deploy(action)

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(18)
      expect(rmRF).toBeCalledTimes(1)
    })

    it('should execute commands with clean options, ommits sha commit message', async () => {
      process.env.GITHUB_SHA = ''
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        clean: true,
        cleanExclude: '["cat", "montezuma"]'
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

    it('should throw an error if one of the required parameters is not available', async () => {
      Object.assign(action, {
        silent: false,
        folder: 'assets',
        branch: 'branch',
        ssh: null,
        accessToken: null,
        gitHubToken: null,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: false // Setting this env variable to false means there will never be anything to commit and the action will exit early.
      })

      try {
        await deploy(action)
      } catch (e) {
        expect(execute).toBeCalledTimes(1)
        expect(rmRF).toBeCalledTimes(1)
        expect(e.message).toMatch(
          'The deploy step encountered an error: No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true. ❌'
        )
      }
    })
  })
})
