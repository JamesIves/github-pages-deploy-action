import { exec } from '@actions/exec';
import buffer from 'buffer';
const output = { stdout: '', stderr: '' };
/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 * @param {boolean} silent - Determines if the in/out should be silenced or not.
 * @param {boolean} ignoreReturnCode - Determines whether to throw an error
 * on a non-zero exit status or to leave implementation up to the caller.
 */
export async function execute(cmd, cwd, silent, ignoreReturnCode = false) {
    output.stdout = '';
    output.stderr = '';
    await exec(cmd, [], {
        // Silences the input unless the INPUT_DEBUG flag is set.
        silent,
        cwd,
        listeners: { stdout, stderr },
        ignoreReturnCode
    });
    return Promise.resolve(output);
}
/**
 * Writes the output of a command to the stdout buffer.
 */
export function stdout(data) {
    const dataString = data.toString().trim();
    if (output.stdout.length + dataString.length <
        buffer.constants.MAX_STRING_LENGTH) {
        output.stdout += dataString;
    }
}
/**
 * Writes the output of a command to the stderr buffer.
 */
export function stderr(data) {
    const dataString = data.toString().trim();
    if (output.stderr.length + dataString.length <
        buffer.constants.MAX_STRING_LENGTH) {
        output.stderr += dataString;
    }
}
