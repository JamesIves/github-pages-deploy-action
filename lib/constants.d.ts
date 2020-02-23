export interface actionInterface {
    accessToken?: string;
    baseBranch?: string;
    branch: string;
    clean?: string;
    cleanExclude?: string;
    commitMessage?: string;
    defaultBranch?: string;
    email?: string;
    folder: string;
    gitHubRepository?: string;
    gitHubToken?: string;
    isTest?: string | undefined;
    name?: string;
    root: string;
    ssh?: string;
    targetFolder?: string;
    workspace: string;
}
export declare const action: actionInterface;
export declare const tokenType: string;
export declare const repositoryPath: string;
