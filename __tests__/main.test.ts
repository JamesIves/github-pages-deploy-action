// Initial env variable setup for tests.
process.env["INPUT_FOLDER"] = "build";
process.env["GITHUB_SHA"] = "123";

import { action } from "../src/constants";
import main from "../src/main";
import { execute } from "../src/execute";
import { setFailed } from "@actions/core";

const originalAction = JSON.stringify(action);

jest.mock("../src/execute", () => ({
  execute: jest.fn()
}));

jest.mock("@actions/core", () => ({
  setFailed: jest.fn(),
  getInput: jest.fn()
}));

describe("main", () => {
  afterEach(() => {
    Object.assign(action, JSON.parse(originalAction));
  });

  it("should run through the commands", async () => {
    Object.assign(action, {
      build: "build",
      branch: "branch",
      gitHubToken: "123",
      pusher: {
        name: "asd",
        email: "as@cat"
      },
      isTest: true
    });
    await main();
    expect(execute).toBeCalledTimes(30);
  });

  it("should throw if an error is encountered", async () => {
    Object.assign(action, {
      build: "build",
      branch: "branch",
      baseBranch: "master",
      gitHubToken: null,
      ssh: null,
      accessToken: null,
      pusher: {
        name: "asd",
        email: "as@cat"
      },
      isTest: true
    });
    await main();
    expect(execute).toBeCalledTimes(12);
    expect(setFailed).toBeCalledTimes(1);
  });
});
