// Initial env variable setup for tests.
process.env["INPUT_FOLDER"] = "build";
process.env["GITHUB_SHA"] = "123";

import _ from "lodash";
import { action } from "../src/constants";
import { deploy, generateBranch, init, switchToBaseBranch } from "../src/git";
import { execute } from "../src/util";

const originalAction = _.cloneDeep(action);

jest.mock("../src/util", () => ({
  execute: jest.fn()
}));

describe("git", () => {
  afterEach(() => {
    _.assignIn(action, originalAction);
  });

  describe("init", () => {
    it("should execute three commands if a GitHub token is provided", async () => {
      Object.assign(action, {
        build: "build",
        gitHubToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await init();
      expect(execute).toBeCalledTimes(3);
      expect(call).toBe("Initialization step complete...");
    });

    it("should execute three commands if a Access token is provided", async () => {
      Object.assign(action, {
        build: "build",
        accessToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await init();

      expect(execute).toBeCalledTimes(3);
      expect(call).toBe("Initialization step complete...");
    });

    it("should fail if there is no provided GitHub Token or Access Token", async () => {
      Object.assign(action, {
        build: "build",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await init();

      expect(execute).toBeCalledTimes(0);
      expect(call).toBe("Initialization step complete...");
    });

    it("should fail if the build folder begins with a /", async () => {
      Object.assign(action, {
        accessToken: "123",
        build: "/",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await init();

      expect(execute).toBeCalledTimes(0);
      expect(call).toBe("Initialization step complete...");
    });

    it("should fail if the build folder begins with a ./", async () => {
      Object.assign(action, {
        accessToken: "123",
        build: "./",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await init();

      expect(execute).toBeCalledTimes(0);
      expect(call).toBe("Initialization step complete...");
    });

    it("should not fail if root is used", async () => {
      Object.assign(action, {
        accessToken: "123",
        build: ".",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await init();

      expect(execute).toBeCalledTimes(3);
      expect(call).toBe("Initialization step complete...");
    });
  });

  describe("generateBranch", () => {
    it("should execute five commands", async () => {
      const call = await generateBranch();
      expect(execute).toBeCalledTimes(6);
      expect(call).toBe("Deployment branch creation step complete... ✅");
    });
  });

  describe("switchToBaseBranch", () => {
    it("should execute one command", async () => {
      const call = await switchToBaseBranch();
      expect(execute).toBeCalledTimes(1);
      expect(call).toBe("Switched to the base branch...");
    });
  });

  describe("deploy", () => {
    it("should execute five commands", async () => {
      Object.assign(action, {
        build: "build",
        gitHubToken: "123",
        pusher: {
          name: "asd",
          email: "as@cat"
        }
      });

      const call = await deploy();

      // Includes the call to generateBranch
      expect(execute).toBeCalledTimes(19);
      expect(call).toBe("Commit step complete...");
    });
  });
});
