import {exec} from '@actions/exec'
import buffer from 'buffer'

let output = ''

/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 * @param {boolean} silent - Determines if the in/out should be silenced or not.
 */
export async function execute(
  cmd: string,
  cwd: string,
  silent: boolean
): Promise<string> {
  await exec(cmd, [], {
    // Silences the input unless the INPUT_DEBUG flag is set.
    silent,
    cwd,
    listeners: {
      stdout
    }
  })

  return Promise.resolve(output)
}

export function stdout(data: Buffer | string): void {
  if (output.length < buffer.constants.MAX_STRING_LENGTH) {
    output += data.toString().trim()
  }
}
