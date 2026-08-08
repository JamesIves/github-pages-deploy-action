// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'

import {mkdirP, rmRF} from '@actions/io'
import {action, Status, TestFlag} from '../src/constants.js'
import {execute} from '../src/execute.js'
import {deploy, init} from '../src/git.js'
import fs from 'fs'

const originalAction = JSON.stringify(action)

jest.mock('fs', () => ({
  existsSync: jest.fn()
}))

jest.mock('@actions/core')

jest.mock('@actions/io')

jest.mock('../src/execute', () => ({
  __esModule: true,
  execute: jest.fn(() => ({stdout: '', stderr: ''}))
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
      expect(execute).toHaveBeenCalledTimes(7)
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

    it('should throw the outer error when a later, unprotected execute call fails', async () => {
      ;(execute as jest.Mock)
        .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // safe.directory (inner try/catch — succeeds)
        .mockImplementationOnce(() => {
          throw new Error('Mocked throw')
        }) // git config user.name (unprotected)

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

      await expect(init(action)).rejects.toThrow(
        'There was an error initializing the repository: Mocked throw ❌'
      )
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
      expect(execute).toHaveBeenCalledTimes(7)
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
      expect(execute).toHaveBeenCalledTimes(6)

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
      expect(execute).toHaveBeenCalledTimes(7)
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
      expect(execute).toHaveBeenCalledTimes(15)
      expect(rmRF).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(14)
      expect(rmRF).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(15)
      expect(rmRF).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(14)
      expect(rmRF).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(14)
      expect(rmRF).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(15)
      expect(rmRF).toHaveBeenCalledTimes(1)
      expect(fs.existsSync).toHaveBeenCalledTimes(2)
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
        expect(execute).toHaveBeenCalledTimes(12)
        expect(rmRF).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(12)
      expect(rmRF).toHaveBeenCalledTimes(1)
    })

    it('should protect clean-exclude items from deletion without blocking them from being synced', async () => {
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

      const rsyncCall = (execute as jest.Mock).mock.calls.find(args =>
        (args[0] as string).startsWith('rsync')
      )

      // A protect filter keeps the item from being deleted during the --delete
      // pass, but unlike --exclude it does not stop the item from being synced
      // if a newer version exists in the source folder.
      expect(rsyncCall[0]).toContain('--filter "P cat"')
      expect(rsyncCall[0]).toContain('--filter "P montezuma"')
      expect(rsyncCall[0]).not.toContain('--exclude cat')
      expect(rsyncCall[0]).not.toContain('--exclude montezuma')
    })

    it('should exclude the .github folder by default', async () => {
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
        isTest: TestFlag.NONE
      })

      await deploy(action)

      const rsyncCall = (execute as jest.Mock).mock.calls.find(args =>
        (args[0] as string).startsWith('rsync')
      )

      expect(rsyncCall[0]).toContain('--exclude .github')
    })

    it('should sync the .github folder when include-github-folder is true', async () => {
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
        includeGithubFolder: true,
        isTest: TestFlag.NONE
      })

      await deploy(action)

      const rsyncCall = (execute as jest.Mock).mock.calls.find(args =>
        (args[0] as string).startsWith('rsync')
      )

      expect(rsyncCall[0]).not.toContain('--exclude .github')
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

      expect(execute).toHaveBeenCalledTimes(12)
      expect(rmRF).toHaveBeenCalledTimes(1)
      expect(mkdirP).toHaveBeenCalledTimes(1)
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
      expect(execute).toHaveBeenCalledTimes(12)
      expect(rmRF).toHaveBeenCalledTimes(1)
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

    it('should execute commands if force is false and retry until limit is exceeded', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        force: false,
        token: '123',
        repositoryName: 'JamesIves/montezuma',
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
          'The deploy step encountered an error: Attempt limit exceeded ❌'
        )
      }
    })

    it('should add a tag to the commit', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        repositoryName: 'JamesIves/montezuma',
        tag: 'v0.1',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      const response = await deploy(action)
      expect(execute).toHaveBeenCalledTimes(17)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should execute commands with lfs enabled', async () => {
      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        repositoryName: 'JamesIves/montezuma',
        lfs: true,
        tag: null,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      const response = await deploy(action)

      // Includes the calls to generateWorktree (git lfs install --local) and
      // cleanup (git lfs uninstall --local)
      expect(execute).toHaveBeenCalledTimes(17)
      expect(rmRF).toHaveBeenCalledTimes(1)
      expect(response).toBe(Status.SUCCESS)
    })

    it('should fail the deploy if git lfs install fails', async () => {
      ;(execute as jest.Mock).mockImplementation((cmd: string) => {
        if (cmd.includes('git lfs install')) {
          throw new Error('git-lfs: command not found')
        }
        return {stdout: '', stderr: ''}
      })

      Object.assign(action, {
        hostname: 'github.com',
        silent: false,
        folder: 'assets',
        branch: 'branch',
        token: '123',
        repositoryName: 'JamesIves/montezuma',
        lfs: true,
        tag: null,
        pusher: {
          name: 'asd',
          email: 'as@cat'
        },
        isTest: TestFlag.HAS_CHANGED_FILES
      })

      await expect(deploy(action)).rejects.toThrow(
        'There was an error creating the worktree: git-lfs: command not found ❌'
      )

      // Restore the default mock so this override doesn't leak into later tests.
      ;(execute as jest.Mock).mockImplementation(() => ({
        stdout: '',
        stderr: ''
      }))
    })

    it('should silently handle chmod failures on read-only folders', async () => {
      let chmodCallCount = 0
      ;(execute as jest.Mock).mockImplementation((cmd: string) => {
        // Simulate chmod failures for read-only folders
        if (cmd.includes('chmod -R +rw')) {
          chmodCallCount++
          throw new Error('Operation not permitted')
        }
        return {stdout: '', stderr: ''}
      })

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

      // Verify that chmod was attempted twice (once for folderPath, once for temporaryDeploymentDirectory)
      expect(chmodCallCount).toBe(2)
      // Verify deployment still succeeds despite chmod failures
      expect(response).toBe(Status.SUCCESS)
    })

    describe('push rejection handling', () => {
      afterEach(() => {
        ;(execute as jest.Mock).mockImplementation(() => ({
          stdout: '',
          stderr: ''
        }))
      })

      it('should throw for a genuinely fatal push error when isTest is falsy', async () => {
        ;(execute as jest.Mock).mockImplementation(async (cmd: string) => {
          if (cmd.startsWith('git status --porcelain')) {
            return {stdout: 'M assets/file.txt', stderr: ''}
          }
          if (cmd.startsWith('git push --porcelain')) {
            return {
              stdout: '',
              stderr:
                "fatal: unable to access 'https://github.com/JamesIves/montezuma.git/': Could not resolve host: github.com\n"
            }
          }
          return {stdout: '', stderr: ''}
        })

        Object.assign(action, {
          hostname: 'github.com',
          silent: false,
          folder: 'assets',
          branch: 'branch',
          force: false,
          token: '123',
          repositoryName: 'JamesIves/montezuma',
          pusher: {
            name: 'asd',
            email: 'as@cat'
          },
          isTest: TestFlag.NONE
        })

        await expect(deploy(action)).rejects.toThrow(
          "The deploy step encountered an error: fatal: unable to access 'https://github.com/JamesIves/montezuma.git/': Could not resolve host: github.com\n ❌"
        )
      })
    })
  })
})
