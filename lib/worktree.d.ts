import { ActionInterface } from './constants';
/**
 * Git checkout command.
 */
export declare class GitCheckout {
    /**
     * @param orphan - Bool indicating if the branch is an orphan.
     */
    orphan: boolean;
    /**
     * @param commitish - The commitish to check out.
     */
    commitish?: string | null;
    /**
     * @param branch - The branch name.
     */
    branch: string;
    /**
     * @param branch - The branch name.
     * @param commitish - The commitish to check out.
     */
    constructor(branch: string, commitish?: string);
    /**
     * Returns the string representation of the git checkout command.
     */
    toString(): string;
}
/**
 * Generates a git worktree.
 * @param action - The action interface.
 * @param worktreedir - The worktree directory.
 * @param branchExists - Bool indicating if the branch exists.
 */
export declare function generateWorktree(action: ActionInterface, worktreedir: string, branchExists: boolean | number): Promise<void>;
