import { describe, expect, it } from "vitest";
import { CATBOX_ALBUM_URL_PREFIX, CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { createAlbum } from "@src/lib/album.js";
import { uploadFile } from "@src/lib/catbox.js";
import { toFilename } from "@src/lib/utils.js";

describe("Album Integration", () => {
  describe("createAlbum", () => {
    it.concurrent("should create album using default parameters", async () => {
      const result = await createAlbum();

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album with title and description", async () => {
      const title = "Album";
      const description = "desc";
      const filenames = new Array<string>();

      const result = await createAlbum(title, description, filenames);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album when all provided parameters are empty", async () => {
      const title = "";
      const description = "";
      const filenames = new Array<string>();

      const result = await createAlbum(title, description, filenames);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album with created file", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const title = "Album";
      const description = "desc";

      const catboxFileURL = await uploadFile(file);
      expect(catboxFileURL).toContain(CATBOX_FILE_URL_PREFIX);

      const filename = toFilename(catboxFileURL);
      const albumResult = await createAlbum(title, description, [filename]);

      expect(albumResult).toContain(CATBOX_ALBUM_URL_PREFIX);
    });
  });
});
