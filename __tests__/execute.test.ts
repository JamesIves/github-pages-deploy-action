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
      silent: true,
      listeners: {
        stdout: expect.any(Function)
      }
    });
  });

  it("should not silence the input when INPUT_DEBUG is defined", async () => {
    process.env["INPUT_DEBUG"] = "yes";

    await stdout("hello");
    await execute("echo Montezuma", "./");

    expect(exec).toBeCalledWith("echo Montezuma", [], {
      cwd: "./",
      silent: false,
      listeners: {
        stdout: expect.any(Function)
      }
    });
  });
});
