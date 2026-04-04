// CJS stub for @actions/core (ESM-only in v3+)
// Provides working implementations for module-load-time calls (e.g. getInput in constants.ts).
// jest.mock('@actions/core', factory) calls in tests override this stub entirely.
module.exports = {
  exportVariable: () => {},
  getInput: name =>
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '',
  info: () => {},
  isDebug: () => process.env['RUNNER_DEBUG'] === '1',
  notice: () => {},
  setFailed: () => {},
  setOutput: () => {}
}
