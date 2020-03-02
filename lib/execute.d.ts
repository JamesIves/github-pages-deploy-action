/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 * @param cmd = The command to execute.
 * @param cwd - The current working directory.
 * @returns - The output from the command.
 */
export declare function execute(cmd: string, cwd: string): Promise<any>;
export declare function stdout(data: any): void;
