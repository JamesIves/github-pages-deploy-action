// Initial env variable setup for tests.
process.env["INPUT_FOLDER"] = "build";

import { execute } from "../src/util";
import { init, generateBranch, deploy } from "../src/git";
import {action} from '../src/constants'
import {cp} from '@actions/io';
import _ from 'lodash';

const originalAction = _.cloneDeep(action);

jest.mock("../src/util", () => ({
  execute: jest.fn()
}));

jest.mock("@actions/io", () => ({
  cp: jest.fn()
}));

describe("git", () => {
  afterEach(() => {
    _.assignIn(action, originalAction);
  });

  describe("init", () => {
    it("should execute three commands if a GitHub token is provided", async () => {

      
    Object.assign(action, {
      build: 'build',
      gitHubToken: '123',
      pusher: {
        name: 'asd',
        email: 'as@cat'
      }})

      const call = await init();
      expect(execute).toBeCalledTimes(3);
      expect(call).toBe('Initialization step complete...')
    });

    it("should execute three commands if a Access token is provided", async () => {
      
      Object.assign(action, {
        build: 'build',
        accessToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})
  
        const call = await init();
  
        expect(execute).toBeCalledTimes(3);
        expect(call).toBe('Initialization step complete...')
      });

    it("should fail if there is no provided GitHub Token or Access Token", async () => {
      Object.assign(action, {
        build: 'build',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})

        const call = await init()

        expect(execute).toBeCalledTimes(0);
        expect(call).toBe('Initialization step complete...')
    })

    it("should fail if the build folder begins with a /", async () => {
      Object.assign(action, {
        accessToken: '123',
        build: '/',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})

        const call = await init()

        expect(execute).toBeCalledTimes(0);
        expect(call).toBe('Initialization step complete...')
    })

    it("should fail if the build folder begins with a ./", async () => {
      Object.assign(action, {
        accessToken: '123',
        build: './',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})

        const call = await init()

        expect(execute).toBeCalledTimes(0);
        expect(call).toBe('Initialization step complete...')
    })

    it("should not fail if root is used", async () => {
      Object.assign(action, {
        accessToken: '123',
        build: '.',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})

        const call = await init()

        expect(execute).toBeCalledTimes(3);
        expect(call).toBe('Initialization step complete...')
    })
  });

  describe('generateBranch', () => {
    it('should execute five commands', async () => {
      const call = await generateBranch();
      expect(execute).toBeCalledTimes(6);
      expect(call).toBe('Deployment branch creation step complete...')
    })
  })

  describe('deploy', () => {
    it('should execute five commands', async () => {
      Object.assign(action, {
        build: 'build',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})
  
      const call = await deploy();

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(14);
      expect(cp).toBeCalledTimes(1)
      expect(call).toBe('Commit step complete...')
    })

    it('should execute six commands if root is used', async () => {
      Object.assign(action, {
        build: '.',
        gitHubToken: '123',
        pusher: {
          name: 'asd',
          email: 'as@cat'
        }})
  
      const call = await deploy();

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(15);
      expect(cp).toBeCalledTimes(0)
      expect(call).toBe('Commit step complete...')
    })
  })
});
