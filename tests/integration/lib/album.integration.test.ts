import { describe, expect, it } from "vitest";
import { CATBOX_ALBUM_URL_PREFIX, CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import {
  createAlbum,
  deleteAlbum,
  editAlbum,
  addToAlbum,
  removeFromAlbum,
} from "@src/lib/album.js";
import { uploadFile } from "@src/lib/catbox.js";
import { toFilename, toShort } from "@src/lib/utils.js";

const userhash = process.env.CATBOX_USERHASH as string;

describe("Album Integration", () => {
  describe("createAlbum", () => {
    it.concurrent("should create album using userhash", async () => {
      const result = await createAlbum("", "", [], { userhash });

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album using default parameters", async () => {
      const result = await createAlbum();

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album with title and description", async () => {
      const title = "Album";
      const description = "desc";

      const result = await createAlbum(title, description, []);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album with empty parameters", async () => {
      const title = "";
      const description = "";

      const result = await createAlbum(title, description, []);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });

    it.concurrent("should create album with a file", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const title = "Album";
      const description = "desc";

      const catboxFileURL = await uploadFile(file);
      expect(catboxFileURL).toContain(CATBOX_FILE_URL_PREFIX);

      const filename = toFilename(catboxFileURL);
      const result = await createAlbum(title, description, [filename]);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
    });
  });

  describe("deleteAlbum", async () => {
    it.concurrent("should delete created album", async () => {
      const albumURL = await createAlbum("", "", [], { userhash });
      const albumShort = toShort(albumURL);

      const resultPromise = deleteAlbum(albumShort, { userhash });

      await expect(resultPromise).resolves.toBeUndefined();
    });
  });

  describe("editAlbum", async () => {
    it.concurrent("should edit album overriding title, description and file list", async () => {
      const file = new File(["A"], "a.txt", { type: "text/plain" });
      const catboxFileURL = await uploadFile(file);
      const catboxFilename = toFilename(catboxFileURL);
      const albumURL = await createAlbum("Title Here", "Description Here", [catboxFilename], {
        userhash,
      });

      const newFile = new File(["B"], "b.txt", { type: "text/plain" });
      const newCatboxFileURL = await uploadFile(newFile);
      const newCatboxFilename = toFilename(newCatboxFileURL);

      const albumShort = toShort(albumURL);
      const result = await editAlbum(
        albumShort,
        "New Title Here",
        "New Description Here",
        [newCatboxFilename],
        {
          userhash,
        }
      );

      expect(albumURL).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(albumURL);
    });
  });

  describe("addToAlbum", async () => {
    it.concurrent("should add file to album", async () => {
      const firstFile = new File(["first"], "first.txt", { type: "text/plain" });
      const firstFileURL = await uploadFile(firstFile);
      const firstFilename = toFilename(firstFileURL);
      const albumURL = await createAlbum("Title Here", "Description Here", [firstFilename], {
        userhash,
      });

      const secondFile = new File(["second"], "second.txt", { type: "text/plain" });
      const secondFileURL = await uploadFile(secondFile);
      const secondFilename = toFilename(secondFileURL);

      const albumShort = toShort(albumURL);
      const result = await addToAlbum(albumShort, [secondFilename], { userhash });

      expect(albumURL).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(albumURL);
    });
  });

  describe("removeFromAlbum", async () => {
    it.concurrent("should remove file from album", async () => {
      const file = new File(["content"], "file.txt", { type: "text/plain" });
      const catboxFileURL = await uploadFile(file);
      const catboxFilename = toFilename(catboxFileURL);
      const albumURL = await createAlbum("Title Here", "Description Here", [catboxFilename], {
        userhash,
      });

      const albumShort = toShort(albumURL);
      const result = await removeFromAlbum(albumShort, [catboxFilename], { userhash });

      expect(result).toBe(albumURL);
    });
  });
});
