import { describe, expect, it } from "vitest";
import { CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { uploadUrl } from "@src/lib/catbox.js";

describe("Catbox Integration", () => {
  describe("uploadUrl", () => {
    it.concurrent("should upload URL", async () => {
      const url = "https://catbox.moe/favicon.ico";

      const result = await uploadUrl(url);

      expect(result).toContain(CATBOX_FILE_URL_PREFIX);
    });
  });
});
