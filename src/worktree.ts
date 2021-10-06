import {info} from '@actions/core'
import {ActionInterface} from './constants'
import {execute} from './execute'
import {extractErrorMessage, suppressSensitiveInformation} from './util'

export class GitCheckout {
  orphan = false
  commitish?: string | null = null
  branch: string
  constructor(branch: string) {
    this.branch = branch
  }
  toString(): string {
    return [
      'git',
      'checkout',
      this.orphan ? '--orphan' : '-B',
      this.branch,
      this.commitish || ''
    ].join(' ')
  }
}

/* Generate the worktree and set initial content if it exists */
export async function generateWorktree(
  action: ActionInterface,
  worktreedir: string,
  branchExists: unknown
): Promise<void> {
  try {
    info('Creating worktree…')

    if (branchExists) {
      await execute(
        `git fetch --no-recurse-submodules --depth=1 origin ${action.branch}`,
        action.workspace,
        action.silent
      )
    }

    await execute(
      `git worktree add --no-checkout --detach ${worktreedir}`,
      action.workspace,
      action.silent
    )
    const checkout = new GitCheckout(action.branch)
    if (branchExists) {
      // There's existing data on the branch to check out
      checkout.commitish = `origin/${action.branch}`
    }
    if (!branchExists || action.singleCommit) {
      // Create a new history if we don't have the branch, or if we want to reset it
      checkout.orphan = true
    }
    await execute(
      checkout.toString(),
      `${action.workspace}/${worktreedir}`,
      action.silent
    )
    if (!branchExists) {
      info(`Created the ${action.branch} branch… 🔧`)
      // Our index is in HEAD state, reset
      await execute(
        'git reset --hard',
        `${action.workspace}/${worktreedir}`,
        action.silent
      )
      if (!action.singleCommit) {
        // New history isn't singleCommit, create empty initial commit
        await execute(
          `git commit --no-verify --allow-empty -m "Initial ${action.branch} commit"`,
          `${action.workspace}/${worktreedir}`,
          action.silent
        )
      }
    }
  } catch (error) {
    throw new Error(
      `There was an error creating the worktree: ${suppressSensitiveInformation(
        extractErrorMessage(error),
        action
      )} ❌`
    )
  }
}
