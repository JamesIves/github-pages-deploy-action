/// <reference types="node" />
/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 * @param {boolean} silent - Determines if the in/out should be silenced or not.
 */
export declare function execute(cmd: string, cwd: string, silent: boolean): Promise<string>;
export declare function stdout(data: Buffer | string): void;
