import { exec } from "@actions/exec";
import { getInput } from "@actions/core";

// Stores the output from execute.
let output: string;

/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 * @param {String} cmd = The command to execute.
 * @param {String} cwd - The current working directory.
 * @returns {Promise} - The output from the command.
 */
export async function execute(cmd: string, cwd: string): Promise<any> {
  output = "";

  await exec(cmd, [], {
    // Silences the input unless the INPUT_DEBUG flag is set.
    silent: getInput("DEBUG") ? false : true,
    cwd,
    listeners: {
      stdout
    }
  });

  return Promise.resolve(output);
}

export function stdout(data: any) {
  output += data.toString().trim();
}
