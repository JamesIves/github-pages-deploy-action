import {TestFlag} from '../src/constants'
import {execute} from '../src/execute'
import {generateWorktree} from '../src/worktree'

jest.mock('../src/execute', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  execute: jest.fn()
}))

describe('generateWorktree', () => {
  it('should catch when a function throws an error', async () => {
    ;(execute as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mocked throw')
    })
    try {
      await generateWorktree(
        {
          workspace: 'somewhere',
          singleCommit: false,
          branch: 'gh-pages',
          folder: '',
          silent: true,
          isCrossRepositoryDeployment: false,
          isTest: TestFlag.HAS_CHANGED_FILES
        },
        'worktree',
        true
      )
    } catch (error) {
      expect(error.message).toBe(
        'There was an error creating the worktree: Mocked throw ❌'
      )
    }
  })
})
