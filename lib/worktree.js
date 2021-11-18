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
exports.generateWorktree = exports.GitCheckout = void 0;
const core_1 = require("@actions/core");
const execute_1 = require("./execute");
const util_1 = require("./util");
class GitCheckout {
    constructor(branch) {
        this.orphan = false;
        this.commitish = null;
        this.branch = branch;
    }
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
/* Generate the worktree and set initial content if it exists */
function generateWorktree(action, worktreedir, branchExists) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, core_1.info)('Creating worktree…');
            if (branchExists) {
                yield (0, execute_1.execute)(`git fetch --no-recurse-submodules --depth=1 origin ${action.branch}`, action.workspace, action.silent);
            }
            yield (0, execute_1.execute)(`git worktree add --no-checkout --detach ${worktreedir}`, action.workspace, action.silent);
            const checkout = new GitCheckout(action.branch);
            if (branchExists) {
                // There's existing data on the branch to check out
                checkout.commitish = `origin/${action.branch}`;
            }
            if (!branchExists || action.singleCommit) {
                // Create a new history if we don't have the branch, or if we want to reset it
                checkout.orphan = true;
            }
            yield (0, execute_1.execute)(checkout.toString(), `${action.workspace}/${worktreedir}`, action.silent);
            if (!branchExists) {
                (0, core_1.info)(`Created the ${action.branch} branch… 🔧`);
                // Our index is in HEAD state, reset
                yield (0, execute_1.execute)('git reset --hard', `${action.workspace}/${worktreedir}`, action.silent);
                if (!action.singleCommit) {
                    // New history isn't singleCommit, create empty initial commit
                    yield (0, execute_1.execute)(`git commit --no-verify --allow-empty -m "Initial ${action.branch} commit"`, `${action.workspace}/${worktreedir}`, action.silent);
                }
            }
        }
        catch (error) {
            throw new Error(`There was an error creating the worktree: ${(0, util_1.suppressSensitiveInformation)((0, util_1.extractErrorMessage)(error), action)} ❌`);
        }
    });
}
exports.generateWorktree = generateWorktree;
