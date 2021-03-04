import {rmRF} from '@actions/io'
import {TestFlag} from '../src/constants'
import {generateWorktree} from '../src/worktree'
import {execute} from '../src/execute'
import fs from 'fs'
import os from 'os'
import path from 'path'

jest.mock('@actions/core', () => ({
  setFailed: jest.fn(),
  getInput: jest.fn(),
  isDebug: jest.fn(),
  info: jest.fn()
}))

/*
 Test generateWorktree against a known git repository.
 The upstream repository `origin` is set up once for the test suite,
 and for each test run, a new clone is created.

 See workstree.error.test.ts for testing mocked errors from git.*/

describe('generateWorktree', () => {
  let tempdir: string | null = null
  let clonedir: string | null = null
  beforeAll(async () => {
    // Set up origin repository
    const silent = true
    tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-deploy-'))
    const origin = path.join(tempdir, 'origin')
    await execute('git init origin', tempdir, silent)
    await execute('git config user.email "you@example.com"', origin, silent)
    await execute('git config user.name "Jane Doe"', origin, silent)
    await execute('git checkout -b main', origin, silent)
    fs.writeFileSync(path.join(origin, 'f1'), 'hello world\n')
    await execute('git add .', origin, silent)
    await execute('git commit -mc0', origin, silent)
    fs.writeFileSync(path.join(origin, 'f1'), 'hello world\nand planets\n')
    await execute('git add .', origin, silent)
    await execute('git commit -mc1', origin, silent)
    await execute('git checkout --orphan gh-pages', origin, silent)
    await execute('git reset --hard', origin, silent)
    await fs.promises.writeFile(path.join(origin, 'gh1'), 'pages content\n')
    await execute('git add .', origin, silent)
    await execute('git commit -mgh0', origin, silent)
    await fs.promises.writeFile(
      path.join(origin, 'gh1'),
      'pages content\ngoes on\n'
    )
    await execute('git add .', origin, silent)
    await execute('git commit -mgh1', origin, silent)
  })
  beforeEach(async () => {
    // Clone origin to our workspace for each test
    const silent = true
    clonedir = path.join(tempdir as string, 'clone')
    await execute('git init clone', tempdir as string, silent)
    await execute('git config user.email "you@example.com"', clonedir, silent)
    await execute('git config user.name "Jane Doe"', clonedir, silent)
    await execute(
      `git remote add origin ${path.join(tempdir as string, 'origin')}`,
      clonedir,
      silent
    )
    await execute('git fetch --depth=1 origin main', clonedir, silent)
    await execute('git checkout main', clonedir, silent)
  })
  afterEach(async () => {
    // Tear down workspace
    await rmRF(clonedir as string)
  })
  afterAll(async () => {
    // Tear down origin repository
    if (tempdir) {
      await rmRF(tempdir)
      // console.log(tempdir)
    }
  })
  describe('with existing branch and new commits', () => {
    it('should check out the latest commit', async () => {
      const workspace = clonedir as string
      await generateWorktree(
        {
          hostname: 'github.com',
          workspace,
          singleCommit: false,
          branch: 'gh-pages',
          folder: '',
          silent: true,
          isTest: TestFlag.NONE
        },
        'worktree',
        true
      )
      const dirEntries = await fs.promises.readdir(
        path.join(workspace, 'worktree')
      )
      expect(dirEntries.sort((a, b) => a.localeCompare(b))).toEqual([
        '.git',
        'gh1'
      ])
      const commitMessages = await execute(
        'git log --format=%s',
        path.join(workspace, 'worktree'),
        true
      )
      expect(commitMessages).toBe('gh1')
    })
  })
  describe('with missing branch and new commits', () => {
    it('should create initial commit', async () => {
      const workspace = clonedir as string
      await generateWorktree(
        {
          hostname: 'github.com',
          workspace,
          singleCommit: false,
          branch: 'no-pages',
          folder: '',
          silent: true,
          isTest: TestFlag.NONE
        },
        'worktree',
        false
      )
      const dirEntries = await fs.promises.readdir(
        path.join(workspace, 'worktree')
      )
      expect(dirEntries).toEqual(['.git'])
      const commitMessages = await execute(
        'git log --format=%s',
        path.join(workspace, 'worktree'),
        true
      )
      expect(commitMessages).toBe('Initial no-pages commit')
    })
  })
  describe('with existing branch and singleCommit', () => {
    it('should check out the latest commit', async () => {
      const workspace = clonedir as string
      await generateWorktree(
        {
          hostname: 'github.com',
          workspace,
          singleCommit: true,
          branch: 'gh-pages',
          folder: '',
          silent: true,
          isTest: TestFlag.NONE
        },
        'worktree',
        true
      )
      const dirEntries = await fs.promises.readdir(
        path.join(workspace, 'worktree')
      )
      expect(dirEntries.sort((a, b) => a.localeCompare(b))).toEqual([
        '.git',
        'gh1'
      ])
      expect(async () => {
        await execute(
          'git log --format=%s',
          path.join(workspace, 'worktree'),
          true
        )
      }).rejects.toThrow()
    })
  })
  describe('with missing branch and singleCommit', () => {
    it('should create initial commit', async () => {
      const workspace = clonedir as string
      await generateWorktree(
        {
          hostname: 'github.com',
          workspace,
          singleCommit: true,
          branch: 'no-pages',
          folder: '',
          silent: true,
          isTest: TestFlag.NONE
        },
        'worktree',
        false
      )
      const dirEntries = await fs.promises.readdir(
        path.join(workspace, 'worktree')
      )
      expect(dirEntries).toEqual(['.git'])
      expect(async () => {
        await execute(
          'git log --format=%s',
          path.join(workspace, 'worktree'),
          true
        )
      }).rejects.toThrow()
    })
  })
})
