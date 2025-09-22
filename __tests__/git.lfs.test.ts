// Initial env variable setup for tests.
process.env['INPUT_FOLDER'] = 'build'
process.env['GITHUB_SHA'] = '123'

import {TestFlag} from '../src/constants'
import {execute} from '../src/execute'
import {generateWorktree} from '../src/worktree'

jest.mock('../src/execute', () => ({
  __esModule: true,
  execute: jest.fn(() => ({stdout: '', stderr: ''}))
}))

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  getInput: jest.fn(),
  setOutput: jest.fn(),
  isDebug: jest.fn(),
  info: jest.fn()
}))

describe('Git LFS functionality', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generateWorktree with LFS', () => {
    it('should configure git lfs in worktree when gitLfs is enabled', async () => {
      await generateWorktree(
        {
          hostname: 'github.com',
          workspace: 'somewhere',
          singleCommit: false,
          branch: 'gh-pages',
          folder: '',
          silent: true,
          gitLfs: true,
          isTest: TestFlag.NONE
        },
        'worktree',
        false
      )

      expect(execute).toHaveBeenCalledWith(
        'git lfs install',
        'somewhere/worktree',
        true
      )
    })

    it('should not configure git lfs in worktree when gitLfs is disabled', async () => {
      await generateWorktree(
        {
          hostname: 'github.com',
          workspace: 'somewhere',
          singleCommit: false,
          branch: 'gh-pages',
          folder: '',
          silent: true,
          gitLfs: false,
          isTest: TestFlag.NONE
        },
        'worktree',
        false
      )

      expect(execute).not.toHaveBeenCalledWith(
        'git lfs install',
        'somewhere/worktree',
        true
      )
    })

    it('should throw error if git lfs installation fails in worktree', async () => {
      ;(execute as jest.Mock).mockImplementation((command: string) => {
        if (command === 'git lfs install') {
          throw new Error('LFS install failed')
        }
        return {stdout: '', stderr: ''}
      })

      try {
        await generateWorktree(
          {
            hostname: 'github.com',
            workspace: 'somewhere',
            singleCommit: false,
            branch: 'gh-pages',
            folder: '',
            silent: true,
            gitLfs: true,
            isTest: TestFlag.NONE
          },
          'worktree',
          false
        )
      } catch (error) {
        expect(error instanceof Error && error.message).toContain(
          'There was an error configuring Git LFS in worktree: LFS install failed ❌'
        )
      }
    })
  })
})