import {execute} from '../src/execute'
import {exec} from '@actions/exec'

jest.mock('@actions/exec', () => ({
  exec: jest.fn()
}))

describe('execute', () => {
  it('should be called with the correct arguments when silent mode is enabled', async () => {
    await execute('echo Montezuma', './', true)

    expect(exec).toBeCalledWith('echo Montezuma', [], {
      cwd: './',
      silent: true
    })
  })

  it('should not silence the input when action.silent is false', async () => {
    process.env['RUNNER_DEBUG'] = '1'
    await execute('echo Montezuma', './', false)

    expect(exec).toBeCalledWith('echo Montezuma', [], {
      cwd: './',
      silent: false
    })
  })
})
