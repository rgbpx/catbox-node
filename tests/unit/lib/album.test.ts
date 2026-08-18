import { afterEach, describe, expect, it, vi } from "vitest";
import { CATBOX_ALBUM_MAX_ITEMS, CATBOX_ALBUM_URL_PREFIX } from "@src/constants.js";
import {
  addToAlbum,
  createAlbum,
  deleteAlbum,
  editAlbum,
  removeFromAlbum,
} from "@src/lib/album.js";

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
      const mockStatusCode = 400;
      const mockStatusText = "Bad Request";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = createAlbum();

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });

    it.concurrent("should throw if response does not start with catbox album URL prefix", async () => {
      const mockResult = "response without album link";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = createAlbum();

      await expect(resultPromise).rejects.toThrow(
        `catbox album response ("${mockResult}") must start with "${CATBOX_ALBUM_URL_PREFIX}".`
      );
    });

    it.concurrent("should throw if album item count exceeds size limit", async () => {
      const title = "";
      const description = "";
      const size = CATBOX_ALBUM_MAX_ITEMS + 1;
      const filenames = new Array<string>(size).fill("");

      const resultPromise = createAlbum(title, description, filenames);

      await expect(resultPromise).rejects.toThrow(
        `album size (${size}) must be less than or equal to ${CATBOX_ALBUM_MAX_ITEMS}.`
      );
    });
  });

  describe("deleteAlbum", () => {
    it.concurrent("should delete album", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = "";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteAlbum(short, { userhash });

      await expect(resultPromise).resolves.toBeUndefined();
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const controller = new AbortController();

      const resultPromise = deleteAlbum(short, { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should throw if response is not ok", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockStatusCode = 500;
      const mockStatusText = "Bad Request";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteAlbum(short, { userhash });

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });

    it.concurrent("should throw if response body is not empty", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = "not empty success";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteAlbum(short, { userhash });

      await expect(resultPromise).rejects.toThrow(
        `catbox album delete response length (${mockResult.length}) must be equal to 0.`
      );
    });
  });

  describe("editAlbum", () => {
    it.concurrent("should edit album", async () => {
      const short = "abc123";
      const userhash = "userhash123";
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
      const userhash = "userhash123";
      const controller = new AbortController();

      const resultPromise = editAlbum(short, "", "", [], { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should edit album with all provided parameters", async () => {
      const short = "abc123";
      const userhash = "userhash123";
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
      const userhash = "userhash123";
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
      const userhash = "userhash123";
      const title = "New Title";
      const description = "New Desc";
      const filenames = ["file1.jpg"];
      const mockResult = "response with no album link";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = editAlbum(short, title, description, filenames, { userhash });

      await expect(resultPromise).rejects.toThrow(
        `catbox album response ("${mockResult}") must start with "${CATBOX_ALBUM_URL_PREFIX}".`
      );
    });

    it.concurrent("should throw if response is not ok", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const title = "New Title";
      const description = "New Desc";
      const filenames = ["file1.jpg"];
      const mockStatusCode = 500;
      const mockStatusText = "Internal Server Error";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = editAlbum(short, title, description, filenames, { userhash });

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });
  });

  describe("addToAlbum", () => {
    it.concurrent("should add files to album", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const filenames = ["file1.jpg", "file2.png"];
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await addToAlbum(short, filenames, { userhash });

      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const controller = new AbortController();

      const resultPromise = addToAlbum(short, [], { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should use defaults when no file array is provided", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}xyz`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await addToAlbum(short, [], { userhash });

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should handle empty filenames array", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await addToAlbum(short, [], { userhash });

      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if response does not start with catbox album URL prefix", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = "response with no album link";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = addToAlbum(short, [], { userhash });

      await expect(resultPromise).rejects.toThrow(
        `catbox album response ("${mockResult}") must start with "${CATBOX_ALBUM_URL_PREFIX}".`
      );
    });

    it.concurrent("should throw if response is not ok", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockStatusCode = 500;
      const mockStatusText = "Internal Server Error";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = addToAlbum(short, [], { userhash });

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });
  });

  describe("removeFromAlbum", () => {
    it.concurrent("should remove files from album", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const filenames = ["file1.jpg"];
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await removeFromAlbum(short, filenames, { userhash });

      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const controller = new AbortController();

      const resultPromise = removeFromAlbum(short, [], { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should use defaults when no file array is provided", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}xyz`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await removeFromAlbum(short, [], { userhash });

      expect(result).toContain(CATBOX_ALBUM_URL_PREFIX);
      expect(result).toBe(mockResult);
    });

    it.concurrent("should handle empty filenames array", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = `${CATBOX_ALBUM_URL_PREFIX}abc123`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await removeFromAlbum(short, [], { userhash });

      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if response does not start with catbox album URL prefix", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockResult = "response with no album link";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = removeFromAlbum(short, [], { userhash });

      await expect(resultPromise).rejects.toThrow(
        `catbox album response ("${mockResult}") must start with "${CATBOX_ALBUM_URL_PREFIX}".`
      );
    });

    it.concurrent("should throw if response is not ok", async () => {
      const short = "abc123";
      const userhash = "userhash123";
      const mockStatusCode = 500;
      const mockStatusText = "Internal Server Error";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = removeFromAlbum(short, [], { userhash });

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });
  });
});
