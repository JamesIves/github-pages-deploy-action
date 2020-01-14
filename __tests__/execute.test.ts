import {execute} from '../src/execute';
import {exec} from '@actions/exec';

jest.mock('@actions/exec', () => ({
  exec: jest.fn()
}))

describe('execute', () => {
  describe('execute', () => {
    it('should be called with the correct arguments', async() => {
      await execute('echo Montezuma', './')
    
      expect(exec).toBeCalledWith(
        "echo Montezuma", [], {
          cwd: "./",
          listeners: {
            stdout: expect.any(Function)
          }
        }
      )
    });
  })
})