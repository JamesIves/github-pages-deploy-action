import * as core from '@actions/core'
import {execSync} from 'child_process'
import {ActionInterface, TestFlag} from '../src/constants.js'
import {
  isNullOrUndefined,
  generateTokenType,
  generateRepositoryPath,
  generateFolderPath,
  suppressSensitiveInformation,
  checkParameters,
  stripProtocolFromUrl,
  extractErrorMessage,
  getRsyncVersion
} from '../src/util.js'

jest.mock('child_process', () => ({
  execSync: jest.fn()
}))

describe('util', () => {
  describe('isNullOrUndefined', () => {
    it('should return true if the value is null', async () => {
      const value = null
      expect(isNullOrUndefined(value)).toBeTruthy()
    })

    it('should return true if the value is undefined', async () => {
      const value = undefined
      expect(isNullOrUndefined(value)).toBeTruthy()
    })

    it('should return false if the value is defined', async () => {
      const value = 'montezuma'
      expect(isNullOrUndefined(value)).toBeFalsy()
    })

    it('should return false if the value is empty string', async () => {
      const value = ''
      expect(isNullOrUndefined(value)).toBeTruthy()
    })
  })

  describe('generateTokenType', () => {
    it('should return ssh if ssh is provided', async () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: 'build',
        token: null,
        sshKey: 'real_token',
        silent: false,
        isTest: TestFlag.NONE
      }
      expect(generateTokenType(action)).toEqual('SSH Deploy Key')
    })

    it('should return deploy token if token is provided', async () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: 'build',
        token: '123',
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }
      expect(generateTokenType(action)).toEqual('Deploy Token')
    })

    it('should return ... if no token is provided', async () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: 'build',
        token: null,
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }
      expect(generateTokenType(action)).toEqual('…')
    })
  })

  describe('generateRepositoryPath', () => {
    it('should return ssh if ssh is provided', async () => {
      const action = {
        repositoryName: 'JamesIves/github-pages-deploy-action',
        branch: '123',
        workspace: 'src/',
        folder: 'build',
        hostname: 'github.com',
        token: null,
        sshKey: 'real_token',
        silent: false,
        isTest: TestFlag.NONE
      }

      expect(generateRepositoryPath(action)).toEqual(
        'git@github.com:JamesIves/github-pages-deploy-action'
      )
    })

    it('should return https with x-access-token if deploy token is provided', async () => {
      const action = {
        repositoryName: 'JamesIves/github-pages-deploy-action',
        branch: '123',
        workspace: 'src/',
        folder: 'build',
        hostname: 'enterprise.github.com',
        token: '123',
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }

      expect(generateRepositoryPath(action)).toEqual(
        'https://x-access-token:123@enterprise.github.com/JamesIves/github-pages-deploy-action.git'
      )
    })

    describe('suppressSensitiveInformation', () => {
      it('should replace any sensitive information with ***', async () => {
        const action = {
          repositoryName: 'JamesIves/github-pages-deploy-action',
          repositoryPath:
            'https://x-access-token:supersecret999%%%@github.com/anothersecret123333',
          branch: '123',
          workspace: 'src/',
          folder: 'build',
          token: 'anothersecret123333',
          silent: false,
          isTest: TestFlag.NONE
        }

        const string = `This is an error message! It contains ${action.token} and ${action.repositoryPath} and ${action.token} again!`
        expect(suppressSensitiveInformation(string, action)).toBe(
          'This is an error message! It contains *** and *** and *** again!'
        )
      })

      it('should not suppress information when in debug mode', async () => {
        const action = {
          repositoryName: 'JamesIves/github-pages-deploy-action',
          repositoryPath:
            'https://x-access-token:supersecret999%%%@github.com/anothersecret123333',
          branch: '123',
          workspace: 'src/',
          folder: 'build',
          token: 'anothersecret123333',
          silent: false,
          isTest: TestFlag.NONE
        }

        process.env['RUNNER_DEBUG'] = '1'

        const string = `This is an error message! It contains ${action.token} and ${action.repositoryPath}`
        expect(suppressSensitiveInformation(string, action)).toBe(
          'This is an error message! It contains anothersecret123333 and https://x-access-token:supersecret999%%%@github.com/anothersecret123333'
        )
      })
    })
  })

  describe('generateFolderPath', () => {
    it('should return absolute path if folder name is provided', () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: 'build',
        token: null,
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }
      expect(generateFolderPath(action)).toEqual('src/build')
    })

    it('should return original path if folder name begins with /', () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: '/home/user/repo/build',
        token: null,
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }
      expect(generateFolderPath(action)).toEqual('/home/user/repo/build')
    })

    it('should process as relative path if folder name begins with ./', () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: './build',
        token: null,
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }
      expect(generateFolderPath(action)).toEqual('src/build')
    })

    it('should return absolute path if folder name begins with ~', () => {
      const action = {
        branch: '123',
        workspace: 'src/',
        folder: '~/repo/build',
        token: null,
        sshKey: null,
        silent: false,
        isTest: TestFlag.NONE
      }
      process.env.HOME = '/home/user'
      expect(generateFolderPath(action)).toEqual('/home/user/repo/build')
    })
  })

  describe('hasRequiredParameters', () => {
    it('should fail if there is no provided GitHub Token, Access Token or SSH bool', () => {
      const action = {
        silent: false,
        repositoryPath: undefined,
        branch: 'branch',
        folder: 'build',
        workspace: 'src/',
        isTest: TestFlag.NONE
      }

      try {
        checkParameters(action)
      } catch (e) {
        expect(e instanceof Error && e.message).toMatch(
          'No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. For more details on how to use an ssh deploy key please refer to the documentation.'
        )
      }
    })

    it('should fail if token is defined but it is an empty string', () => {
      const action = {
        silent: false,
        repositoryPath: undefined,
        token: '',
        branch: 'branch',
        folder: 'build',
        workspace: 'src/',
        isTest: TestFlag.NONE
      }

      try {
        checkParameters(action)
      } catch (e) {
        expect(e instanceof Error && e.message).toMatch(
          'No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. For more details on how to use an ssh deploy key please refer to the documentation.'
        )
      }
    })

    it('should fail if there is no branch', () => {
      const action = {
        silent: false,
        repositoryPath: undefined,
        token: '123',
        branch: '',
        folder: 'build',
        workspace: 'src/',
        isTest: TestFlag.NONE
      }

      try {
        checkParameters(action)
      } catch (e) {
        expect(e instanceof Error && e.message).toMatch('Branch is required.')
      }
    })

    it('should fail if there is no folder', () => {
      const action = {
        silent: false,
        repositoryPath: undefined,
        token: '123',
        branch: 'branch',
        folder: '',
        workspace: 'src/',
        isTest: TestFlag.NONE
      }

      try {
        checkParameters(action)
      } catch (e) {
        expect(e instanceof Error && e.message).toMatch(
          'You must provide the action with a folder to deploy.'
        )
      }
    })

    it('should fail if the folder does not exist in the tree', () => {
      const action: ActionInterface = {
        silent: false,
        repositoryPath: undefined,
        token: '123',
        branch: 'branch',
        folder: 'notARealFolder',
        workspace: '.',
        isTest: TestFlag.NONE
      }

      try {
        action.folderPath = generateFolderPath(action)
        checkParameters(action)
      } catch (e) {
        expect(e instanceof Error && e.message).toMatch(
          `The directory you're trying to deploy named notARealFolder doesn't exist. Please double check the path and any prerequisite build scripts and try again. ❗`
        )
      }
    })

    it('should warn when running on an unsupported operating system', () => {
      const warningSpy = jest.spyOn(core, 'warning').mockImplementation(() => {
        return undefined
      })
      const originalRunnerOs = process.env.RUNNER_OS
      process.env.RUNNER_OS = 'Windows'

      const action: ActionInterface = {
        silent: false,
        token: '123',
        branch: 'branch',
        folder: '.',
        folderPath: '.',
        workspace: '.',
        isTest: TestFlag.NONE
      }

      checkParameters(action)

      expect(warningSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "operating system you're using is not supported"
        )
      )

      process.env.RUNNER_OS = originalRunnerOs
      warningSpy.mockRestore()
    })
  })

  describe('stripProtocolFromUrl', () => {
    it('removes https', () => {
      expect(stripProtocolFromUrl('https://github.com')).toBe('github.com')
    })

    it('removes http', () => {
      expect(stripProtocolFromUrl('http://github.com')).toBe('github.com')
    })

    it('removes https|http and www.', () => {
      expect(stripProtocolFromUrl('http://www.github.com')).toBe('github.com')
    })

    it('works with a url that is not github.com', () => {
      expect(stripProtocolFromUrl('http://github.enterprise.jamesiv.es')).toBe(
        'github.enterprise.jamesiv.es'
      )
    })
  })

  describe('extractErrorMessage', () => {
    it('gets the message of a Error', () => {
      expect(extractErrorMessage(new Error('a error message'))).toBe(
        'a error message'
      )
    })

    it('gets the message of a string', () => {
      expect(extractErrorMessage('a error message')).toBe('a error message')
    })

    it('gets the message of a object', () => {
      expect(extractErrorMessage({special: 'a error message'})).toBe(
        `{"special":"a error message"}`
      )
    })
  })

  describe('getRsyncVersion', () => {
    afterEach(() => {
      ;(execSync as jest.Mock).mockReset()
    })

    it('parses the version number out of `rsync --version` output', () => {
      ;(execSync as jest.Mock).mockImplementation(
        () => 'rsync  version 3.2.7  protocol version 31\nCopyright ...'
      )
      expect(getRsyncVersion()).toBe('3.2.7')
    })

    it('returns an empty string and swallows the error when execSync throws (e.g. rsync missing)', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      ;(execSync as jest.Mock).mockImplementation(() => {
        throw new Error('spawnSync rsync ENOENT')
      })

      expect(getRsyncVersion()).toBe('')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
      consoleErrorSpy.mockRestore()
    })
  })
})
