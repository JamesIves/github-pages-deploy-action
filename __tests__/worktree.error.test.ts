import {TestFlag} from '../src/constants.js'
import {execute} from '../src/execute.js'
import {generateWorktree} from '../src/worktree.js'

jest.mock('../src/execute', () => ({
  __esModule: true,
  execute: jest.fn(() => ({stdout: '', stderr: ''}))
}))

describe('generateWorktree', () => {
  it('should catch when a function throws an error', async () => {
    ;(execute as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mocked throw')
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
          isTest: TestFlag.HAS_CHANGED_FILES
        },
        'worktree',
        true
      )
    } catch (error) {
      expect(error instanceof Error && error.message).toBe(
        'There was an error creating the worktree: Mocked throw ❌'
      )
    }
  })
})
