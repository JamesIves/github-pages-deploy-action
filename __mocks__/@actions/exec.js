const cp = require('child_process')

module.exports = {
  exec: jest.fn(async (command, args = [], options = {}) => {
    const {cwd, listeners = {}, ignoreReturnCode = false} = options
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
  })
}
