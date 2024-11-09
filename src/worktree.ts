import {info} from '@actions/core'
import {ActionInterface} from './constants'
import {execute} from './execute'
import {extractErrorMessage, suppressSensitiveInformation} from './util'

/**
 * Git checkout command.
 */
export class GitCheckout {
  /**
   * @param orphan - Bool indicating if the branch is an orphan.
   */
  orphan = false

  /**
   * @param commitish - The commitish to check out.
   */
  commitish?: string | null = null

  /**
   * @param branch - The branch name.
   */
  branch: string

  /**
   * @param branch - The branch name.
   * @param commitish - The commitish to check out.
   */
  constructor(branch: string, commitish?: string) {
    this.branch = branch
    this.commitish = commitish || null
  }

  /**
   * Returns the string representation of the git checkout command.
   */
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

    let branchName = action.branch
    let checkout = new GitCheckout(branchName)

    if (branchExists) {
      // There's existing data on the branch to check out
      checkout.commitish = `origin/${action.branch}`
    }

    if (
      !branchExists ||
      (action.singleCommit && action.branch !== process.env.GITHUB_REF_NAME)
    ) {
      /* Create a new history if we don't have the branch, or if we want to reset it.
        If the ref name is the same as the branch name, do not attempt to create an orphan of it. */
      checkout.orphan = true
    }

    try {
      await execute(
        checkout.toString(),
        `${action.workspace}/${worktreedir}`,
        action.silent
      )
    } catch (error) {
      if (!action.silent) {
        console.error(error)
      }

      info(
        'Error encountered while checking out branch. Attempting to continue with a new branch name.'
      )

      branchName = `temp-${Date.now()}`

      try {
        checkout = new GitCheckout(branchName, `origin/${action.branch}`)
        await execute(
          checkout.toString(),
          `${action.workspace}/${worktreedir}`,
          action.silent
        )
      } catch (error) {
        if (!action.silent) {
          console.error(error)
        }

        info('Unable to track the origin branch…')

        checkout = new GitCheckout(branchName)
        await execute(
          checkout.toString(),
          `${action.workspace}/${worktreedir}`,
          action.silent
        )
      }
    }

    if (!branchExists) {
      info(`Created the ${branchName} branch… 🔧`)

      // Our index is in HEAD state, reset
      await execute(
        'git reset --hard',
        `${action.workspace}/${worktreedir}`,
        action.silent
      )

      if (!action.singleCommit) {
        // New history isn't singleCommit, create empty initial commit
        await execute(
          `git commit --no-verify --allow-empty -m "Initial ${branchName} commit"`,
          `${action.workspace}/${worktreedir}`,
          action.silent
        )
      }
    }

    /**
     * Ensure that the workspace is a safe directory.
     */
    try {
      await execute(
        `git config --global --add safe.directory "${action.workspace}/${worktreedir}"`,
        action.workspace,
        action.silent
      )
    } catch {
      info('Unable to set worktree temp directory as a safe directory…')
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
