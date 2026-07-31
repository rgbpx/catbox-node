import { afterEach, describe, expect, it, vi } from "vitest";
import { CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { toFilename } from "@src/lib/utils.js";

describe("Utils Unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("toFilename", () => {
    it.concurrent("should extract filename from valid catbox file URL", async () => {
      const filename = "file.txt";
      const url = `${CATBOX_FILE_URL_PREFIX}${filename}`;

      const result = toFilename(url);

      expect(result).toBe(filename);
    });

    it.concurrent("should throw for invalid catbox file URL", async () => {
      const url = "https://example.com/file.txt";

      expect(() => toFilename(url)).toThrow("not catbox file url");
    });
  });
});
