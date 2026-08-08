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

  it('should fall back through both checkout retries when checkout fails twice', async () => {
    ;(execute as jest.Mock)
      .mockImplementationOnce(() => ({stdout: 'abc123', stderr: ''})) // git fetch (branchExists)
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // git worktree add
      .mockImplementationOnce(() => {
        throw new Error('checkout failed')
      }) // attempt 1: git checkout -B gh-pages origin/gh-pages
      .mockImplementationOnce(() => {
        throw new Error('checkout failed again')
      }) // attempt 2: git checkout -B temp-<ts> origin/gh-pages
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // attempt 3: git checkout -B temp-<ts> (untracked) — succeeds
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // safe.directory config

    await expect(
      generateWorktree(
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
    ).resolves.toBeUndefined()

    const calls = (execute as jest.Mock).mock.calls.map(
      args => args[0] as string
    )
    expect(calls[2]).toBe('git checkout -B gh-pages origin/gh-pages')
    expect(calls[3]).toMatch(/^git checkout -B temp-\d+ origin\/gh-pages$/)
    expect(calls[4]).toMatch(/^git checkout -B temp-\d+ $/)
  })

  it('should preserve the orphan flag through both checkout retries (#1388)', async () => {
    // Reproduces https://github.com/JamesIves/github-pages-deploy-action/issues/1388:
    // deploying to a branch that doesn't exist yet (branchExists: false, so the first
    // checkout attempt is meant to be an orphan) can fail if a local branch of that
    // name already exists for an unrelated reason - e.g. it happens to share a name
    // with the workspace's own checked out branch, since a worktree shares the local
    // branch namespace with the main checkout. Before this fix, falling through to the
    // final retry dropped the orphan flag, so `git checkout -B temp-X` (with no
    // --orphan and no commitish) would silently create the new branch at the
    // workspace's *current* HEAD - carrying the workspace's own commit history into
    // what should be a brand new, unrelated deployment branch.
    ;(execute as jest.Mock)
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // git worktree add
      .mockImplementationOnce(() => {
        throw new Error("fatal: A branch named 'main' already exists.")
      }) // attempt 1: git checkout --orphan main
      .mockImplementationOnce(() => {
        throw new Error(
          "fatal: 'origin/main' is not a commit and a branch 'temp-X' cannot be created from it"
        )
      }) // attempt 2: git checkout --orphan temp-<ts> origin/main -- nothing was ever fetched
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // attempt 3: git checkout --orphan temp-<ts> -- succeeds
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // git reset --hard
      // No "initial commit" call - singleCommit: true skips it.
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // safe.directory config

    await expect(
      generateWorktree(
        {
          hostname: 'github.com',
          workspace: 'somewhere',
          singleCommit: true,
          branch: 'main',
          folder: '',
          silent: true,
          isTest: TestFlag.NONE
        },
        'worktree',
        false // branchExists: false, e.g. a fresh/empty target repo
      )
    ).resolves.toBeUndefined()

    const calls = (execute as jest.Mock).mock.calls.map(
      args => args[0] as string
    )
    expect(calls[1]).toBe('git checkout --orphan main ')
    expect(calls[2]).toMatch(/^git checkout --orphan temp-\d+ origin\/main$/)
    expect(calls[3]).toMatch(/^git checkout --orphan temp-\d+ $/)
  })

  it('should continue when unable to set the worktree as a safe directory', async () => {
    ;(execute as jest.Mock)
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // git worktree add
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // git checkout --orphan (succeeds)
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // git reset --hard
      .mockImplementationOnce(() => ({stdout: '', stderr: ''})) // initial commit
      .mockImplementationOnce(() => {
        throw new Error('cannot set safe.directory')
      }) // safe.directory config — throws

    await expect(
      generateWorktree(
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
        false
      )
    ).resolves.toBeUndefined()
  })
})
