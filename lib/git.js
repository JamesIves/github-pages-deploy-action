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
const io_1 = require("@actions/io");
const util_1 = require("./util");
const constants_1 = require("./constants");
/** Generates the branch if it doesn't exist on the remote. */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessToken = core.getInput("ACCESS_TOKEN");
            const gitHubToken = core.getInput("GITHUB_TOKEN");
            if (!accessToken && !gitHubToken) {
                core.setFailed("You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy.");
            }
            if (constants_1.build.startsWith("/") || constants_1.build.startsWith("./")) {
                core.setFailed(`The deployment folder cannot be prefixed with '/' or './'. Instead reference the folder name directly.`);
            }
            yield util_1.execute(`git init`, constants_1.workspace);
            yield util_1.execute(`git config user.name ${constants_1.action.pusher.name}`, constants_1.workspace);
            yield util_1.execute(`git config user.email ${constants_1.action.pusher.email}`, constants_1.workspace);
        }
        catch (error) {
            core.setFailed(`There was an error initializing the repository: ${error}`);
        }
        finally {
            Promise.resolve("Initializion Step Complete...");
        }
    });
}
exports.init = init;
/** Generates the branch if it doesn't exist on the remote. */
function generateBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Creating ${constants_1.action.branch} branch...`);
            yield util_1.execute(`git checkout ${constants_1.action.baseBranch || "master"}`, constants_1.workspace);
            yield util_1.execute(`git checkout --orphan ${constants_1.action.branch}`, constants_1.workspace);
            yield util_1.execute(`git reset --hard`, constants_1.workspace);
            yield util_1.execute(`git commit --allow-empty -m "Initial ${constants_1.action.branch} commit."`, constants_1.workspace);
            yield util_1.execute(`git push ${constants_1.repositoryPath} ${constants_1.action.branch}`, constants_1.workspace);
        }
        catch (error) {
            core.setFailed(`There was an error creating the deployment branch: ${error}`);
        }
        finally {
            Promise.resolve("Deployment branch creation step complete...");
        }
    });
}
exports.generateBranch = generateBranch;
/** Runs the neccersary steps to make the deployment. */
function deploy() {
    return __awaiter(this, void 0, void 0, function* () {
        const temporaryDeploymentDirectory = 'temp-deployment-folder';
        const temporaryDeploymentBranch = 'temp-deployment-branch';
        /*
          Checks to see if the remote exists prior to deploying.
          If the branch doesn't exist it gets created here as an orphan.
        */
        const branchExists = yield util_1.execute(`git ls-remote --heads ${constants_1.repositoryPath} ${constants_1.action.branch} | wc -l`, constants_1.workspace);
        if (!branchExists) {
            console.log('Deployment branch does not exist. Creating....');
            yield generateBranch();
        }
        // Checks out the base branch to begin the deployment process.
        yield util_1.execute(`git checkout ${constants_1.action.baseBranch || 'master'}`, constants_1.workspace);
        yield util_1.execute(`git fetch origin`, constants_1.workspace);
        yield util_1.execute(`git worktree add --checkout ${temporaryDeploymentDirectory} origin/${constants_1.action.branch}`, constants_1.workspace);
        /*
          Pushes all of the build files into the deployment directory.
          Allows the user to specify the root if '.' is provided. */
        yield io_1.cp(`${constants_1.build}/.`, temporaryDeploymentDirectory, { recursive: true, force: true });
        // Commits to GitHub.
        yield util_1.execute(`git add --all .`, temporaryDeploymentDirectory);
        yield util_1.execute(`git checkout -b ${temporaryDeploymentBranch}`, temporaryDeploymentDirectory);
        yield util_1.execute(`git commit -m "Deploying to ${constants_1.action.branch} from ${constants_1.action.baseBranch} ${process.env.GITHUB_SHA}" --quiet`, temporaryDeploymentDirectory);
        yield util_1.execute(`git push ${constants_1.repositoryPath} ${temporaryDeploymentBranch}:${constants_1.action.branch}`, temporaryDeploymentDirectory);
        return Promise.resolve('Files commit step complete...');
    });
}
exports.deploy = deploy;
