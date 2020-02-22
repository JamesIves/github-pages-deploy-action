// Initial env variable setup for tests.
process.env["INPUT_FOLDER"] = "build";
process.env["GITHUB_SHA"] = "123";

import { action } from "../src/constants";
import { deploy, generateBranch, init, switchToBaseBranch } from "../src/git";
import { execute } from "../src/execute";
import { setFailed } from "@actions/core";

const originalAction = JSON.stringify(action);

jest.mock("@actions/core", () => ({
  setFailed: jest.fn(),
  getInput: jest.fn()
}));

jest.mock("../src/execute", () => ({
  execute: jest.fn()
}));

describe("git", () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction));
  });

  describe("init", () => {
    it("should execute commands if a GitHub token is provided", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        gitHubToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await init(action);
      expect(execute).toBeCalledTimes(6);
    });

    it("should execute commands if an Access Token is provided", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        accessToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await init(action);
      expect(execute).toBeCalledTimes(6);
    });

    it("should execute commands if SSH is true", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        ssh: true,
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await init(action);

      expect(execute).toBeCalledTimes(6);
    });

    it("should fail if there is no provided GitHub Token, Access Token or SSH bool", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        pusher: {
          name: "asd",
          email: "as@cat"
        },
        gitHubToken: null,
        accessToken: null,
        ssh: null
      });

      await init(action);
      expect(setFailed).toBeCalledTimes(1);
      expect(execute).toBeCalledTimes(0);
    });

    it("should fail if the build folder begins with a /", async () => {
      Object.assign(action, {
        accessToken: "123",
        branch: "branch",
        folder: "/",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await init(action);

      expect(setFailed).toBeCalledTimes(1);
      expect(execute).toBeCalledTimes(0);
    });

    it("should fail if the build folder begins with a ./", async () => {
      Object.assign(action, {
        accessToken: "123",
        branch: "branch",
        folder: "./",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await init(action);
      expect(setFailed).toBeCalledTimes(1);
      expect(execute).toBeCalledTimes(0);
    });

    it("should not fail if root is used", async () => {
      Object.assign(action, {
        accessToken: "123",
        branch: "branch",
        folder: ".",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await init(action);

      expect(execute).toBeCalledTimes(6);
    });
  });

  describe("generateBranch", () => {
    it("should execute six commands", async () => {
      Object.assign(action, {
        accessToken: "123",
        branch: "branch",
        folder: ".",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await generateBranch(action);
      expect(execute).toBeCalledTimes(6);
    });

    it("should fail if there is no branch", async () => {
      Object.assign(action, {
        accessToken: "123",
        branch: null,
        folder: ".",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      await generateBranch(action);
      expect(execute).toBeCalledTimes(0);
      expect(setFailed).toBeCalledTimes(1);
    });
  });

  describe("switchToBaseBranch", () => {
    it("should execute one command", async () => {
      Object.assign(action, {
        accessToken: "123",
        branch: "branch",
        folder: ".",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await switchToBaseBranch(action);
      expect(execute).toBeCalledTimes(1);
      expect(call).toBe("Switched to the base branch...");
    });
  });

  describe("deploy", () => {
    it("should execute commands", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        gitHubToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await deploy(action);

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(12);
      expect(call).toBe("Commit step complete...");
    });

    it("should execute commands with clean options", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        gitHubToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        },
        clean: true,
        cleanExclude: '["cat", "montezuma"]'
      });

      const call = await deploy(action);

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(12);
      expect(call).toBe("Commit step complete...");
    });

    it("should gracefully handle incorrectly formatted clean exclude items", async () => {
      Object.assign(action, {
        folder: ".",
        branch: "branch",
        gitHubToken: "123",
        pusher: {},
        clean: true,
        targetFolder: "new_folder",
        commitMessage: "Hello!",
        isTest: true,
        cleanExclude: '["cat, "montezuma"]' // There is a syntax errror in the string.
      });

      const call = await deploy(action);

      expect(execute).toBeCalledTimes(12);
      expect(call).toBe("Commit step complete...");
    });

    it("should stop early if there is nothing to commit", async () => {
      Object.assign(action, {
        folder: "build",
        branch: "branch",
        gitHubToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        },
        isTest: false // Setting this env variable to false means there will never be anything to commit and the action will exit early.
      });

      await deploy(action);
      expect(execute).toBeCalledTimes(12);
    });
  });
});
