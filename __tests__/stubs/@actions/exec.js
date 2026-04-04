// CJS stub for @actions/exec (ESM-only in v3+).
// Provides a working exec() using child_process for integration tests.
// jest.mock('@actions/exec', factory) calls in tests override this stub entirely.
const cp = require('child_process')

module.exports = {
  exec: async (command, args = [], options = {}) => {
    const {cwd, silent, listeners = {}, ignoreReturnCode = false} = options
    // Append additional args to command string
    const fullCommand =
      args && args.length ? `${command} ${args.join(' ')}` : command

    return new Promise((resolve, reject) => {
      const child = cp.spawn(fullCommand, {
        cwd: cwd || process.cwd(),
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe']
      })

      child.stdout.on('data', data => {
        if (listeners.stdout) listeners.stdout(data)
      })

      child.stderr.on('data', data => {
        if (listeners.stderr) listeners.stderr(data)
      })

      child.on('close', code => {
        if (code !== 0 && !ignoreReturnCode) {
          reject(new Error(`Command failed: ${command} (exit ${code})`))
        } else {
          resolve(code || 0)
        }
      })

      child.on('error', reject)
    })
  }
}
