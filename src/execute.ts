import { exec } from "@actions/exec";

let output: string;

/** Wrapper around the GitHub toolkit exec command which returns the output.
 * Also allows you to easily toggle the current working directory.
 * @param cmd = The command to execute.
 * @param cwd - The current working directory.
 * @returns - The output from the command.
 */
export async function execute(cmd: string, cwd: string): Promise<any> {
  output = "";

  await exec(cmd, [], {
    // Silences the input unless the INPUT_DEBUG flag is set.
    silent: process.env.DEBUG_DEPLOY_ACTION ? false : true,
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
