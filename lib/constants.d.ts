export declare const workspace: any;
export declare const build: string;
export declare const root = ".";
export interface actionInterface {
    accessToken?: string;
    baseBranch?: string;
    branch: string;
    folder: string;
    clean?: string;
    cleanExclude?: string;
    commitMessage?: string;
    defaultBranch?: string;
    email?: string;
    gitHubRepository?: string;
    gitHubToken?: string;
    isTest?: string | undefined;
    name?: string;
    ssh?: string;
    targetFolder?: string;
}
export declare const action: actionInterface;
export declare const tokenType: string;
export declare const repositoryPath: string;
