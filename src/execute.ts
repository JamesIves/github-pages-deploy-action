import {isDebug} from '@actions/core'
import {exec} from '@actions/exec'

let output: string

/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 *
 * @param {string} cmd - The command to execute.
 * @param {string} cwd - The current working directory.
 */
export async function execute(cmd: string, cwd: string): Promise<any> {
  output = ''

  await exec(cmd, [], {
    // Silences the input unless the INPUT_DEBUG flag is set.
    silent: isDebug() ? false : true,
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
