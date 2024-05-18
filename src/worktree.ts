import {info} from '@actions/core'
import {ActionInterface} from './constants'
import {execute} from './execute'
import {extractErrorMessage, suppressSensitiveInformation} from './util'

/**
 * Git checkout command.
 */
export class GitCheckout {
  orphan = false
  commitish?: string | null = null
  branch: string
  constructor(branch: string, commitish?: string) {
    this.branch = branch
    this.commitish = commitish || null
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

/**
 * Generates a git worktree.
 * @param action - The action interface.
 * @param worktreedir - The worktree directory.
 * @param branchExists - Bool indicating if the branch exists.
 */
export async function generateWorktree(
  action: ActionInterface,
  worktreedir: string,
  branchExists: boolean | number
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

    /**
     * If the branch doesn't exist, we need to create a new branch using a unique name.
     */
    const uniqueBranchName = `temp-${Date.now()}`

    const checkout = new GitCheckout(
      uniqueBranchName,
      `origin/${action.branch}`
    )

    if (
      !branchExists ||
      (action.singleCommit && action.branch !== process.env.GITHUB_REF_NAME)
    ) {
      /* Create a new history if we don't have the branch, or if we want to reset it.
        If the ref name is the same as the branch name, do not attempt to create an orphan of it. */
      checkout.orphan = true
    }

    await execute(
      checkout.toString(),
      `${action.workspace}/${worktreedir}`,
      action.silent
    )

    if (!branchExists) {
      info(`Created the ${uniqueBranchName} branch… 🔧`)

      // Our index is in HEAD state, reset
      await execute(
        'git reset --hard',
        `${action.workspace}/${worktreedir}`,
        action.silent
      )

      if (!action.singleCommit) {
        // New history isn't singleCommit, create empty initial commit
        await execute(
          `git commit --no-verify --allow-empty -m "Initial ${uniqueBranchName} commit"`,
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
