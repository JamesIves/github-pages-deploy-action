/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 */
export declare function execute(cmd: string, cwd: string): Promise<any>;
export declare function stdout(data: any): string | void;
