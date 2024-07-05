"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitCheckout = void 0;
exports.generateWorktree = generateWorktree;
const core_1 = require("@actions/core");
const execute_1 = require("./execute");
const util_1 = require("./util");
/**
 * Git checkout command.
 */
class GitCheckout {
    /**
     * @param branch - The branch name.
     * @param commitish - The commitish to check out.
     */
    constructor(branch, commitish) {
        /**
         * @param orphan - Bool indicating if the branch is an orphan.
         */
        this.orphan = false;
        /**
         * @param commitish - The commitish to check out.
         */
        this.commitish = null;
        this.branch = branch;
        this.commitish = commitish || null;
    }
    /**
     * Returns the string representation of the git checkout command.
     */
    toString() {
        return [
            'git',
            'checkout',
            this.orphan ? '--orphan' : '-B',
            this.branch,
            this.commitish || ''
        ].join(' ');
    }
}
exports.GitCheckout = GitCheckout;
/**
 * Generates a git worktree.
 * @param action - The action interface.
 * @param worktreedir - The worktree directory.
 * @param branchExists - Bool indicating if the branch exists.
 */
function generateWorktree(action, worktreedir, branchExists) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, core_1.info)('Creating worktree…');
            if (branchExists) {
                yield (0, execute_1.execute)(`git fetch --no-recurse-submodules --depth=1 origin ${action.branch}`, action.workspace, action.silent);
            }
            yield (0, execute_1.execute)(`git worktree add --no-checkout --detach ${worktreedir}`, action.workspace, action.silent);
            let branchName = action.branch;
            let checkout = new GitCheckout(branchName);
            if (branchExists) {
                // There's existing data on the branch to check out
                checkout.commitish = `origin/${action.branch}`;
            }
            if (!branchExists ||
                (action.singleCommit && action.branch !== process.env.GITHUB_REF_NAME)) {
                /* Create a new history if we don't have the branch, or if we want to reset it.
                  If the ref name is the same as the branch name, do not attempt to create an orphan of it. */
                checkout.orphan = true;
            }
            try {
                yield (0, execute_1.execute)(checkout.toString(), `${action.workspace}/${worktreedir}`, action.silent);
            }
            catch (error) {
                (0, core_1.info)('Error encountered while checking out branch. Attempting to continue with a new branch name.');
                branchName = `temp-${Date.now()}`;
                checkout = new GitCheckout(branchName, `origin/${action.branch}`);
                yield (0, execute_1.execute)(checkout.toString(), `${action.workspace}/${worktreedir}`, action.silent);
            }
            if (!branchExists) {
                (0, core_1.info)(`Created the ${branchName} branch… 🔧`);
                // Our index is in HEAD state, reset
                yield (0, execute_1.execute)('git reset --hard', `${action.workspace}/${worktreedir}`, action.silent);
                if (!action.singleCommit) {
                    // New history isn't singleCommit, create empty initial commit
                    yield (0, execute_1.execute)(`git commit --no-verify --allow-empty -m "Initial ${branchName} commit"`, `${action.workspace}/${worktreedir}`, action.silent);
                }
            }
        }
        catch (error) {
            throw new Error(`There was an error creating the worktree: ${(0, util_1.suppressSensitiveInformation)((0, util_1.extractErrorMessage)(error), action)} ❌`);
        }
    });
}
