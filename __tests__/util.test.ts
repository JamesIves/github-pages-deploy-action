import {
  isNullOrUndefined,
  generateTokenType,
  generateRepositoryPath,
  generateFolderPath,
  suppressSensitiveInformation
} from '../src/util'

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
  })

  describe('generateTokenType', () => {
    it('should return ssh if ssh is provided', async () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: null,
        accessToken: null,
        ssh: true,
        silent: false
      }
      expect(generateTokenType(action)).toEqual('SSH Deploy Key')
    })

    it('should return access token if access token is provided', async () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: null,
        accessToken: '123',
        ssh: null,
        silent: false
      }
      expect(generateTokenType(action)).toEqual('Access Token')
    })

    it('should return github token if github token is provided', async () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: '123',
        accessToken: null,
        ssh: null,
        silent: false
      }
      expect(generateTokenType(action)).toEqual('GitHub Token')
    })

    it('should return ... if no token is provided', async () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: null,
        accessToken: null,
        ssh: null,
        silent: false
      }
      expect(generateTokenType(action)).toEqual('…')
    })
  })

  describe('generateRepositoryPath', () => {
    it('should return ssh if ssh is provided', async () => {
      const action = {
        repositoryName: 'JamesIves/github-pages-deploy-action',
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: null,
        accessToken: null,
        ssh: true,
        silent: false
      }
      expect(generateRepositoryPath(action)).toEqual(
        'git@github.com:JamesIves/github-pages-deploy-action'
      )
    })

    it('should return https if access token is provided', async () => {
      const action = {
        repositoryName: 'JamesIves/github-pages-deploy-action',
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: null,
        accessToken: '123',
        ssh: null,
        silent: false
      }
      expect(generateRepositoryPath(action)).toEqual(
        'https://123@github.com/JamesIves/github-pages-deploy-action.git'
      )
    })

    it('should return https with x-access-token if github token is provided', async () => {
      const action = {
        repositoryName: 'JamesIves/github-pages-deploy-action',
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: '123',
        accessToken: null,
        ssh: null,
        silent: false
      }
      expect(generateRepositoryPath(action)).toEqual(
        'https://x-access-token:123@github.com/JamesIves/github-pages-deploy-action.git'
      )
    })

    describe('suppressSensitiveInformation', () => {
      it('should replace any sensitive information with ***', async () => {
        const action = {
          repositoryName: 'JamesIves/github-pages-deploy-action',
          repositoryPath:
            'https://x-access-token:supersecret999%%%@github.com/anothersecret123333',
          branch: '123',
          root: '.',
          workspace: 'src/',
          folder: 'build',
          accessToken: 'supersecret999%%%',
          gitHubToken: 'anothersecret123333',
          silent: false
        }

        const string = `This is an error message! It contains ${action.accessToken} and ${action.gitHubToken} and ${action.repositoryPath} and ${action.accessToken} again!`
        expect(suppressSensitiveInformation(string, action)).toBe(
          'This is an error message! It contains *** and *** and *** and *** again!'
        )
      })

      it('should not suppress information when in debug mode', async () => {
        const action = {
          repositoryName: 'JamesIves/github-pages-deploy-action',
          repositoryPath:
            'https://x-access-token:supersecret999%%%@github.com/anothersecret123333',
          branch: '123',
          root: '.',
          workspace: 'src/',
          folder: 'build',
          accessToken: 'supersecret999%%%',
          gitHubToken: 'anothersecret123333',
          silent: false
        }

        process.env['RUNNER_DEBUG'] = '1'

        const string = `This is an error message! It contains ${action.accessToken} and ${action.gitHubToken} and ${action.repositoryPath}`
        expect(suppressSensitiveInformation(string, action)).toBe(
          'This is an error message! It contains supersecret999%%% and anothersecret123333 and https://x-access-token:supersecret999%%%@github.com/anothersecret123333'
        )
      })
    })
  })

  describe('generateFolderPath', () => {
    it('should return absolute path if folder name is provided', () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: 'build',
        gitHubToken: null,
        accessToken: null,
        ssh: null,
        silent: false
      }
      expect(generateFolderPath(action)).toEqual('src/build')
    })

    it('should return original path if folder name begins with /', () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: '/home/user/repo/build',
        gitHubToken: null,
        accessToken: null,
        ssh: null,
        silent: false
      }
      expect(generateFolderPath(action)).toEqual('/home/user/repo/build')
    })

    it('should process as relative path if folder name begins with ./', () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: './build',
        gitHubToken: null,
        accessToken: null,
        ssh: null,
        silent: false
      }
      expect(generateFolderPath(action)).toEqual('src/build')
    })

    it('should return absolute path if folder name begins with ~', () => {
      const action = {
        branch: '123',
        root: '.',
        workspace: 'src/',
        folder: '~/repo/build',
        gitHubToken: null,
        accessToken: null,
        ssh: null,
        silent: false
      }
      process.env.HOME = '/home/user'
      expect(generateFolderPath(action)).toEqual('/home/user/repo/build')
    })
  })
})
