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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const util_1 = require("./util");
const constants_1 = require("./constants");
/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!constants_1.action.accessToken && !constants_1.action.gitHubToken) {
                return core.setFailed("You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy.");
            }
            /*if (action.build.startsWith("/") || action.build.startsWith("./")) {
              return core.setFailed(
                `The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.`
              );
            }*/
            yield util_1.execute(`git init`, constants_1.action.build);
            yield util_1.execute(`git config user.name ${constants_1.action.pusher.name}`, constants_1.action.build);
            yield util_1.execute(`git config user.email ${constants_1.action.pusher.email}`, constants_1.action.build);
        }
        catch (error) {
            core.setFailed(`There was an error initializing the repository: ${error}`);
        }
        finally {
            return Promise.resolve("Initialization step complete...");
        }
    });
}
exports.init = init;
/** Generates the branch if it doesn't exist on the remote.
 * @returns {Promise}
 */
function generateBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Creating ${constants_1.action.branch} branch...`);
            yield util_1.execute(`git switch ${constants_1.action.baseBranch || "master"}`, constants_1.workspace);
            yield util_1.execute(`git switch --orphan ${constants_1.action.branch}`, constants_1.workspace);
            yield util_1.execute(`git reset --hard`, constants_1.workspace);
            yield util_1.execute(`git commit --allow-empty -m "Initial ${constants_1.action.branch} commit."`, constants_1.workspace);
            yield util_1.execute(`git push ${constants_1.repositoryPath} ${constants_1.action.branch}`, constants_1.workspace);
            // Switches back to the base branch.
            yield util_1.execute(`git switch ${constants_1.action.baseBranch || "master"}`, constants_1.workspace);
        }
        catch (error) {
            core.setFailed(`There was an error creating the deployment branch: ${error}`);
        }
        finally {
            return Promise.resolve("Deployment branch creation step complete...");
        }
    });
}
exports.generateBranch = generateBranch;
/** Runs the necessary steps to make the deployment.
 * @returns {Promise}
 */
function deploy() {
    return __awaiter(this, void 0, void 0, function* () {
        /*
            Checks to see if the remote exists prior to deploying.
            If the branch doesn't exist it gets created here as an orphan.
          */
        const branchExists = yield util_1.execute(`git ls-remote --heads ${constants_1.repositoryPath} ${constants_1.action.branch} | wc -l`, constants_1.workspace);
        if (!branchExists) {
            console.log("Deployment branch does not exist. Creating....");
            yield generateBranch();
        }
        console.log('list', yield util_1.execute(`ls`, constants_1.action.build));
        yield util_1.execute(`git checkout --orphan ${constants_1.action.branch}`, constants_1.action.build);
        yield util_1.execute(`git remote rm origin`, constants_1.action.build);
        yield util_1.execute(`git remote add origin ${constants_1.repositoryPath}`, constants_1.action.build);
        yield util_1.execute(`git add --all`, constants_1.action.build);
        yield util_1.execute(`git commit -m "Deploying to ${constants_1.action.branch} from ${constants_1.action.baseBranch} ${process.env.GITHUB_SHA}" --quiet`, constants_1.action.build);
        yield util_1.execute(`git push --force origin ${constants_1.action.branch}`, constants_1.action.build);
        /*
        await execute(
          `git worktree add --checkout ${temporaryDeploymentDirectory} origin/${action.branch}`,
          workspace
        ); */
        /*
          Pushes all of the build files into the deployment directory.
          Allows the user to specify the root if '.' is provided.
        await cp(`${action.build}/.`, temporaryDeploymentDirectory, {
          recursive: true,
          force: true
        });
      
        // Commits to GitHub.
        await execute(`git add --all .`, temporaryDeploymentDirectory);
        await execute(
          `git switch -c ${temporaryDeploymentBranch}`,
          temporaryDeploymentDirectory
        );
        await execute(
          `git commit -m "Deploying to ${action.branch} from ${action.baseBranch} ${process.env.GITHUB_SHA}" --quiet`,
          temporaryDeploymentDirectory
        );
        await execute(
          `git push --force ${repositoryPath} ${temporaryDeploymentBranch}:${action.branch}`,
          temporaryDeploymentDirectory
        );*/
        return Promise.resolve("Commit step complete...");
    });
}
exports.deploy = deploy;
