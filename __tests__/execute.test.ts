import { execute, stdout } from "../src/execute";
import { exec } from "@actions/exec";

jest.mock("@actions/exec", () => ({
  exec: jest.fn()
}));

describe("execute", () => {
  it("should be called with the correct arguments", async () => {
    await stdout("hello");
    await execute("echo Montezuma", "./");

    expect(exec).toBeCalledWith("echo Montezuma", [], {
      cwd: "./",
      listeners: {
        stdout: expect.any(Function)
      }
    });
  });
});
