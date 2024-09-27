/**
 * The output of a command.
 */
type ExecuteOutput = {
    /**
     * The standard output of the command.
     */
    stdout: string;
    /**
     * The standard error of the command.
     */
    stderr: string;
};
/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 * @param {boolean} silent - Determines if the in/out should be silenced or not.
 * @param {boolean} ignoreReturnCode - Determines whether to throw an error
 * on a non-zero exit status or to leave implementation up to the caller.
 */
export declare function execute(cmd: string, cwd: string, silent: boolean, ignoreReturnCode?: boolean): Promise<ExecuteOutput>;
/**
 * Writes the output of a command to the stdout buffer.
 */
export declare function stdout(data: Buffer | string): void;
/**
 * Writes the output of a command to the stderr buffer.
 */
export declare function stderr(data: Buffer | string): void;
export {};
