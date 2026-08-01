import { afterEach, describe, expect, it, vi } from "vitest";
import { CATBOX_ALBUM_URL_PREFIX, CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { toFilename, toShort } from "@src/lib/utils.js";

describe("Utils Unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("toShort", () => {
    it.concurrent("should extract short from valid catbox album URL", async () => {
      const short = "abc123";
      const url = `${CATBOX_ALBUM_URL_PREFIX}${short}`;

      const result = toShort(url);

      expect(result).toBe(short);
    });

    it.concurrent("should throw for invalid catbox album URL", async () => {
      const url = "https://example.com/file.txt";

      expect(() => toShort(url)).toThrow("not catbox album url");
    });
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
