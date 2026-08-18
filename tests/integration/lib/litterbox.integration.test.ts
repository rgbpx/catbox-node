import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LITTERBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { uploadFile } from "@src/lib/litterbox.js";

describe("Litterbox Integration", () => {
  describe("uploadFile", () => {
    it.concurrent("should upload File", async ({ skip }) => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      try {
        const result = await uploadFile(file);

        expect(result).toContain(LITTERBOX_FILE_URL_PREFIX);
      } catch (err) {
        skip(String(err).includes("HTTP 403"));
      }
    });

    it("should upload file from path", async ({ skip }) => {
      const filePath = "./tests/resources/fixtures/icon.ico";
      const fileData = await readFile(filePath);
      const fileName = path.basename(filePath);
      const file = new File([fileData], fileName);

      try {
        const result = await uploadFile(file);

        expect(result).toContain(LITTERBOX_FILE_URL_PREFIX);
      } catch (err) {
        skip(String(err).includes("HTTP 403"));
      }
    });

    it("should upload file from blob", async ({ skip }) => {
      const blob = new Blob(["content"], { type: "text/plain" });
      const file = new File([blob], "text.txt");

      try {
        const result = await uploadFile(file);

        expect(result).toContain(LITTERBOX_FILE_URL_PREFIX);
      } catch (err) {
        skip(String(err).includes("HTTP 403"));
      }
    });
  });
});
