import { isNullOrUndefined } from "../src/util";

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
});
