import {execute, stdout} from '../src/execute.js'
import {exec} from '@actions/exec'

jest.mock('@actions/exec')

jest.mock('buffer', () => ({
  constants: {MAX_STRING_LENGTH: 10}
}))

describe('execute', () => {
  it('should be called with the correct arguments when silent mode is enabled', async () => {
    stdout('hello')
    await execute('echo Montezuma', './', true)

    expect(exec).toHaveBeenCalledWith('echo Montezuma', [], {
      cwd: './',
      silent: true,
      ignoreReturnCode: false,
      listeners: {
        stdout: expect.any(Function),
        stderr: expect.any(Function)
      }
    })
  })

  it('should not silence the input when action.silent is false', async () => {
    process.env['RUNNER_DEBUG'] = '1'

    stdout('hello')
    await execute('echo Montezuma', './', false)

    expect(exec).toHaveBeenCalledWith('echo Montezuma', [], {
      cwd: './',
      silent: false,
      ignoreReturnCode: false,
      listeners: {
        stdout: expect.any(Function),
        stderr: expect.any(Function)
      }
    })
  })

  describe('output truncation', () => {
    it('stops appending to stdout once MAX_STRING_LENGTH would be exceeded', async () => {
      ;(exec as jest.Mock).mockImplementation(
        async (
          _cmd: string,
          _args: string[],
          options: {listeners: {stdout: (data: Buffer) => void}}
        ) => {
          options.listeners.stdout(Buffer.from('12345'))
          options.listeners.stdout(Buffer.from('67890'))
          return 0
        }
      )

      const result = await execute('echo montezuma', './', true)
      expect(result.stdout).toBe('12345')
    })

    it('stops appending to stderr once MAX_STRING_LENGTH would be exceeded', async () => {
      ;(exec as jest.Mock).mockImplementation(
        async (
          _cmd: string,
          _args: string[],
          options: {listeners: {stderr: (data: Buffer) => void}}
        ) => {
          options.listeners.stderr(Buffer.from('abcde'))
          options.listeners.stderr(Buffer.from('fghij'))
          return 0
        }
      )

      const result = await execute('echo montezuma', './', true)
      expect(result.stderr).toBe('abcde')
    })
  })
})
