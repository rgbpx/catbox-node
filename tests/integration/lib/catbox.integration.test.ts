import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { uploadFile, uploadUrl } from "@src/lib/catbox.js";

const pauseMsg = "Uploads paused until I can resolve storage issues. Sorry!";
const userhash = process.env.CATBOX_USERHASH as string;

describe("Catbox Integration", () => {
  describe("uploadUrl", () => {
    it.concurrent("should upload URL anonymously", async ({ skip }) => {
      const url = "https://catbox.moe/favicon.ico";

      try {
        const result = await uploadUrl(url);

        expect(result).toContain(CATBOX_FILE_URL_PREFIX);
      } catch (err) {
        skip(String(err).includes(pauseMsg));
      }
    });

    it.concurrent("should upload URL using userhash", async ({ skip }) => {
      const url = "https://catbox.moe/favicon.ico";

      try {
        const result = await uploadUrl(url, { userhash });

        expect(result).toContain(CATBOX_FILE_URL_PREFIX);
      } catch (err) {
        skip(String(err).includes(pauseMsg));
      }
    });
  });

  describe("uploadFile", () => {
    it.concurrent("should upload File anonymously", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      const result = await uploadFile(file);

      expect(result).toContain(CATBOX_FILE_URL_PREFIX);
    });

    it.concurrent("should upload File using userhash", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      const result = await uploadFile(file, { userhash });

      expect(result).toContain(CATBOX_FILE_URL_PREFIX);
    });

    it("should upload file from path", async () => {
      const filePath = "./tests/resources/fixtures/icon.ico";
      const fileData = await readFile(filePath);
      const fileName = path.basename(filePath);
      const file = new File([fileData], fileName);

      const result = await uploadFile(file);

      expect(result).toContain(CATBOX_FILE_URL_PREFIX);
    });

    it("should upload file from blob", async () => {
      const blob = new Blob(["content"], { type: "text/plain" });
      const file = new File([blob], "text.txt");

      const result = await uploadFile(file);

      expect(result).toContain(CATBOX_FILE_URL_PREFIX);
    });

    it.concurrent("should throw if userhash is invalid", async () => {
      const rnd = "userhash123";
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      const resultPromise = uploadFile(file, { userhash: rnd });

      await expect(resultPromise).rejects.toThrow("HTTP 412 Catbox Not signed in!");
    });
  });
});
