import { exec } from "@actions/exec";

/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 * @param {String} cmd = The command to execute.
 * @param {String} cwd - The current working directory.
 * @returns {Promise} - The output from the command.
 */
export async function execute(cmd: string, cwd: string): Promise<any> {
  let output = "";

  await exec(cmd, [], {
    cwd,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString().trim();
      }
    }
  });

  return Promise.resolve(output);
}
