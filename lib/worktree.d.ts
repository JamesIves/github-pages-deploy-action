import { ActionInterface } from './constants';
export declare class GitCheckout {
    orphan: boolean;
    commitish?: string | null;
    branch: string;
    constructor(branch: string);
    toString(): string;
}
/**
 * Generate the worktree and set initial content if it exists
 */
export declare function generateWorktree(action: ActionInterface, worktreedir: string, branchExists: unknown): Promise<void>;
