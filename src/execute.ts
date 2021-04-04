import {exec} from '@actions/exec'

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
): Promise<void> {
  await exec(cmd, [], {
    // Silences the input unless the INPUT_DEBUG flag is set.
    silent,
    cwd,
  })

  return Promise.resolve()
}