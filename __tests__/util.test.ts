import {
  isNullOrUndefined,
  generateTokenType,
  generateRepositoryPath
} from "../src/util";

describe("util", () => {
  describe("isNullOrUndefined", () => {
    it("should return true if the value is null", async () => {
      const value = null;
      expect(isNullOrUndefined(value)).toBeTruthy();
    });

    it("should return true if the value is undefined", async () => {
      const value = undefined;
      expect(isNullOrUndefined(value)).toBeTruthy();
    });

    it("should return false if the value is defined", async () => {
      const value = "montezuma";
      expect(isNullOrUndefined(value)).toBeFalsy();
    });
  });

  describe("generateTokenType", () => {
    it("should return ssh if ssh is provided", async () => {
      const action = {
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: null,
        accessToken: null,
        ssh: true
      };
      expect(generateTokenType(action)).toEqual("SSH Deploy Key");
    });

    it("should return access token if access token is provided", async () => {
      const action = {
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: null,
        accessToken: "123",
        ssh: null
      };
      expect(generateTokenType(action)).toEqual("Access Token");
    });

    it("should return github token if github token is provided", async () => {
      const action = {
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: "123",
        accessToken: null,
        ssh: null
      };
      expect(generateTokenType(action)).toEqual("GitHub Token");
    });

    it("should return ... if no token is provided", async () => {
      const action = {
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: null,
        accessToken: null,
        ssh: null
      };
      expect(generateTokenType(action)).toEqual("...");
    });
  });

  describe("generateRepositoryPath", () => {
    it("should return ssh if ssh is provided", async () => {
      const action = {
        gitHubRepository: "JamesIves/github-pages-deploy-action",
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: null,
        accessToken: null,
        ssh: true
      };
      expect(generateRepositoryPath(action)).toEqual(
        "git@github.com:JamesIves/github-pages-deploy-action"
      );
    });

    it("should return https if access token is provided", async () => {
      const action = {
        gitHubRepository: "JamesIves/github-pages-deploy-action",
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: null,
        accessToken: "123",
        ssh: null
      };
      expect(generateRepositoryPath(action)).toEqual(
        "https://123@github.com/JamesIves/github-pages-deploy-action.git"
      );
    });

    it("should return https with x-access-token if github token is provided", async () => {
      const action = {
        gitHubRepository: "JamesIves/github-pages-deploy-action",
        branch: "123",
        root: ".",
        workspace: "src/",
        folder: "build",
        gitHubToken: "123",
        accessToken: null,
        ssh: null
      };
      expect(generateRepositoryPath(action)).toEqual(
        "https://x-access-token:123@github.com/JamesIves/github-pages-deploy-action.git"
      );
    });
  });
});
