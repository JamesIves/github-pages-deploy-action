module.exports = {
  exportVariable: jest.fn(),
  getInput: jest.fn(),
  info: jest.fn(),
  isDebug: jest.fn(() => process.env['RUNNER_DEBUG'] === '1'),
  notice: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn(),
  warning: jest.fn()
}
