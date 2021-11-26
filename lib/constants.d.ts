export declare enum TestFlag {
    NONE = 0,
    HAS_CHANGED_FILES = 2,
    HAS_REMOTE_BRANCH = 4,
    UNABLE_TO_REMOVE_ORIGIN = 8,
    UNABLE_TO_UNSET_GIT_CONFIG = 16
}
export interface ActionInterface {
    /** The branch that the action should deploy to. */
    branch: string;
    /** git push with --dry-run */
    dryRun?: boolean | null;
    /** If your project generates hashed files on build you can use this option to automatically delete them from the deployment branch with each deploy. This option can be toggled on by setting it to true. */
    clean?: boolean | null;
    /** If you need to use CLEAN but you'd like to preserve certain files or folders you can use this option. */
    cleanExclude?: string[];
    /** If you need to customize the commit message for an integration you can do so. */
    commitMessage?: string;
    /** The hostname of which the GitHub Workflow is being run on, ie: github.com */
    hostname?: string;
    /** The git config email. */
    email?: string;
    /** The folder to deploy. */
    folder: string;
    /** The auto generated folder path. */
    folderPath?: string;
    /** Determines test scenarios the action is running in. */
    isTest: TestFlag;
    /** The git config name. */
    name?: string;
    /** The repository path, for example JamesIves/github-pages-deploy-action. */
    repositoryName?: string;
    /** The fully qualified repositpory path, this gets auto generated if repositoryName is provided. */
    repositoryPath?: string;
    /** Wipes the commit history from the deployment branch in favor of a single commit. */
    singleCommit?: boolean | null;
    /** Determines if the action should run in silent mode or not. */
    silent: boolean;
    /** Defines an SSH private key that can be used during deployment. This can also be set to true to use SSH deployment endpoints if you've already configured the SSH client outside of this package. */
    sshKey?: string | boolean | null;
    /** If you'd like to push the contents of the deployment folder into a specific directory on the deployment branch you can specify it here. */
    targetFolder?: string;
    /** Deployment token. */
    token?: string | null;
    /** The token type, ie ssh/token, this gets automatically generated. */
    tokenType?: string;
    /** The folder where your deployment project lives. */
    workspace: string;
}
/** The minimum required values to run the action as a node module. */
export interface NodeActionInterface {
    /** The branch that the action should deploy to. */
    branch: string;
    /** The folder to deploy. */
    folder: string;
    /** The repository path, for example JamesIves/github-pages-deploy-action. */
    repositoryName: string;
    /** GitHub deployment token. */
    token?: string | null;
    /** Determines if the action should run in silent mode or not. */
    silent: boolean;
    /** Defines an SSH private key that can be used during deployment. This can also be set to true to use SSH deployment endpoints if you've already configured the SSH client outside of this package. */
    sshKey?: string | boolean | null;
    /** The folder where your deployment project lives. */
    workspace: string;
    /** Determines test scenarios the action is running in. */
    isTest: TestFlag;
}
export declare const action: ActionInterface;
/** Types for the required action parameters. */
export declare type RequiredActionParameters = Pick<ActionInterface, 'token' | 'sshKey' | 'branch' | 'folder' | 'isTest'>;
/** Status codes for the action. */
export declare enum Status {
    SUCCESS = "success",
    FAILED = "failed",
    SKIPPED = "skipped",
    RUNNING = "running"
}
