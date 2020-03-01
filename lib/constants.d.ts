export interface actionInterface {
    /** Deployment access token. */
    accessToken?: string | null;
    /** The base branch that the deploy should be made from. */
    baseBranch?: string;
    /** The branch that the action should deploy to. */
    branch: string;
    /** If your project generates hashed files on build you can use this option to automatically delete them from the deployment branch with each deploy. This option can be toggled on by setting it to true. */
    clean?: string | boolean;
    /** If you need to use CLEAN but you'd like to preserve certain files or folders you can use this option. */
    cleanExclude?: string | Array<string>;
    /** If you need to customize the commit message for an integration you can do so. */
    commitMessage?: string;
    /** Unhides the Git commands from the function terminal. */
    debug?: boolean | string;
    /** The default branch of the deployment. Similar to baseBranch if you're using this action as a module. */
    defaultBranch?: string;
    /** The git config email. */
    email?: string;
    /** The folder to deploy. */
    folder: string;
    /** The repository path, for example JamesIves/github-pages-deploy-action */
    gitHubRepository?: string;
    /** GitHub deployment token. */
    gitHubToken?: string | null;
    /** Determines if the action is running in test mode or not. */
    isTest?: string | undefined | null;
    /** The git config name. */
    name?: string;
    /** The fully qualified repositpory path, this gets auto generated if gitHubRepository is provided. */
    repositoryPath?: string;
    /** The root directory where your project lives. */
    root?: string;
    /** Set to true if you're using an ssh client in your build step. */
    ssh?: string | boolean | null;
    /** If you'd like to push the contents of the deployment folder into a specific directory on the deployment branch you can specify it here. */
    targetFolder?: string;
    /** The token type, ie ssh/github token/access token, this gets automatically generated. */
    tokenType?: string;
    /** The folder where your deployment project lives. */
    workspace: string;
}
export declare const action: actionInterface;
