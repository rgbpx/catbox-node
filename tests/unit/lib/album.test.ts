import { afterEach, describe, expect, it, vi } from "vitest";
import { CATBOX_ALBUM_MAX_ITEMS, CATBOX_ALBUM_URL_PREFIX } from "@src/constants.js";
import { createAlbum, deleteAlbum, editAlbum } from "@src/lib/album.js";

describe("Album Unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createAlbum", () => {
    it.concurrent("should create album using default parameters", async () => {
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await createAlbum();

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const controller = new AbortController();

      const resultPromise = createAlbum("", "", [], { signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should create album with all provided parameters", async () => {
      const title = "Album";
      const description = "desc";
      const filenames = ["file1.jpg", "file2.png"];
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}xyz`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await createAlbum(title, description, filenames);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should create album when all provided parameters are empty", async () => {
      const title = "";
      const description = "";
      const filenames = new Array<string>();
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await createAlbum(title, description, filenames);

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if response is not ok", async () => {
      const mockResponse = new Response("Error", { status: 400 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = createAlbum();

      await expect(resultPromise).rejects.toThrow("catbox album create failed 400");
    });

    it.concurrent("should throw if response does not start with catbox album URL prefix", async () => {
      const mockResult = "some message";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = createAlbum();

      await expect(resultPromise).rejects.toThrow("catbox response has no album link");
    });

    it.concurrent("should throw if item count exceeds limit", async () => {
      const title = "";
      const description = "";
      const filenames = new Array<string>(CATBOX_ALBUM_MAX_ITEMS + 1).fill("");

      const resultPromise = createAlbum(title, description, filenames);

      await expect(resultPromise).rejects.toThrow(
        `cannot accept more than ${CATBOX_ALBUM_MAX_ITEMS} items`
      );
    });
  });

  describe("deleteAlbum", () => {
    it.concurrent("should delete album", async () => {
      const short = "abc123";
      const userhash = "####";
      const mockResponse = new Response("", { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteAlbum(short, { userhash });

      await expect(resultPromise).resolves.toBeUndefined();
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const short = "abc123";
      const userhash = "####";
      const controller = new AbortController();

      const resultPromise = deleteAlbum(short, { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should throw if response is not ok", async () => {
      const short = "abc123";
      const userhash = "####";
      const mockResponse = new Response("Error", { status: 500 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteAlbum(short, { userhash });

      await expect(resultPromise).rejects.toThrow("catbox album delete failed 500");
    });

    it.concurrent("should throw if response body is not empty", async () => {
      const short = "abc123";
      const userhash = "####";
      const mockResponse = new Response("not empty", { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteAlbum(short, { userhash });

      await expect(resultPromise).rejects.toThrow("catbox album delete bad response");
    });
  });

  describe("editAlbum", () => {
    it.concurrent("should edit album", async () => {
      const short = "abc123";
      const userhash = "####";
      const title = "New Title";
      const description = "New Desc";
      const filenames = ["file1.jpg"];
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await editAlbum(short, title, description, filenames, { userhash });

      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const short = "abc123";
      const userhash = "####";
      const controller = new AbortController();

      const resultPromise = editAlbum(short, "", "", [], { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should edit album with all provided parameters", async () => {
      const short = "abc123";
      const userhash = "####";
      const title = "Album";
      const description = "desc";
      const filenames = ["file1.jpg", "file2.png"];
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}xyz`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await editAlbum(short, title, description, filenames, { userhash });

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should edit album when all metadata parameters are empty", async () => {
      const short = "abc123";
      const userhash = "####";
      const title = "";
      const description = "";
      const filenames = new Array<string>();
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}foo`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await editAlbum(short, title, description, filenames, { userhash });

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if response does not start with catbox album URL prefix", async () => {
      const short = "abc123";
      const userhash = "####";
      const title = "New Title";
      const description = "New Desc";
      const filenames = ["file1.jpg"];
      const mockResult = "some message";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = editAlbum(short, title, description, filenames, { userhash });

      await expect(resultPromise).rejects.toThrow("catbox response has no album link");
    });

    it.concurrent("should throw if response is not ok", async () => {
      const short = "abc123";
      const userhash = "####";
      const title = "New Title";
      const description = "New Desc";
      const filenames = ["file1.jpg"];
      const mockResponse = new Response("Error", { status: 400 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = editAlbum(short, title, description, filenames, { userhash });

      await expect(resultPromise).rejects.toThrow("catbox album edit failed 400");
    });
  });
});
