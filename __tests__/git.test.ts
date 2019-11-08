process.env["INPUT_FOLDER"] = "build";

import { execute } from "../src/util";
import { init } from "../src/git";
import {action} from '../src/constants'

jest.mock("../src/constants", () => ({
  build: 'dist',
  action: {
    pusher: {
      name: 'montezuma',
      email: 'best@cat',
    },
    gitHubToken: 'exists',
  }
}));

jest.mock("../src/util", () => ({
  execute: jest.fn()
}));

jest.mock("@actions/io", () => ({
  cp: jest.fn()
}));

describe("git", () => {
  describe("init", () => {
    it("should execute three commands", async () => {

      await init();

      expect(execute).toBeCalledTimes(3);
    });

    it("should fail if the dpeloyment folder begins with /", async () => {
      // TODO:
    })
  });
});
