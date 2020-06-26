import {exec} from '@actions/exec'

let output: string

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
  silent?: boolean
): Promise<any> {
  output = ''

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

export function stdout(data: any): string | void {
  output += data.toString().trim()
}
