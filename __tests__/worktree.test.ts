import {rmRF} from '@actions/io'
import {generateWorktree} from '../src/git'
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

describe('generateWorktree', () => {
  let tempdir: string | null = null
  let clonedir: string | null = null
  beforeAll(async () => {
    tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-deploy-'))
    const origin = path.join(tempdir, 'origin')
    await execute('git init origin', tempdir, true)
    await execute('git checkout -b main', origin, true)
    fs.writeFileSync(path.join(origin, 'f1'), 'hello world\n')
    await execute('git add .', origin, true)
    await execute('git commit -mc0', origin, true)
    fs.writeFileSync(path.join(origin, 'f1'), 'hello world\nonce more\n')
    await execute('git add .', origin, true)
    await execute('git commit -mc1', origin, true)
    await execute('git checkout --orphan gh-pages', origin, true)
    await execute('git reset --hard', origin, true)
    await fs.promises.writeFile(path.join(origin, 'gh1'), 'pages content\n')
    await execute('git add .', origin, true)
    await execute('git commit -mgh0', origin, true)
    await fs.promises.writeFile(
      path.join(origin, 'gh1'),
      'pages content\ngoes on\n'
    )
    await execute('git add .', origin, true)
    await execute('git commit -mgh1', origin, true)
  })
  beforeEach(async () => {
    clonedir = path.join(tempdir as string, 'clone')
    await execute('git init clone', tempdir as string, true)
    await execute(
      `git remote add origin ${path.join(tempdir as string, 'origin')}`,
      clonedir,
      true
    )
    await execute('git fetch --depth=1 origin main', clonedir, true)
    await execute('git checkout main', clonedir, true)
  })
  afterEach(async () => {
    await rmRF(clonedir as string)
  })
  afterAll(async () => {
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
          workspace,
          singleCommit: false,
          branch: 'gh-pages',
          folder: '',
          silent: true
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
          workspace,
          singleCommit: false,
          branch: 'no-pages',
          folder: '',
          silent: true
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
          workspace,
          singleCommit: true,
          branch: 'gh-pages',
          folder: '',
          silent: true
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
          workspace,
          singleCommit: true,
          branch: 'no-pages',
          folder: '',
          silent: true
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
