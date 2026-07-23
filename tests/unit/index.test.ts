import { describe, expect, it } from "vitest";
import { add } from "@src/index.js";

describe("Index Unit", () => {
  describe("add", () => {
    it("should add numbers", () => {
      const result = add(2, 2);

      expect(result).toBe(4);
    });
  });
});
