import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CATBOX_FILE_URL_PREFIX,
  CATBOX_MAX_FILE_BYTES,
  CATBOX_MAX_GIF_BYTES,
} from "@src/constants.js";
import { uploadFile, uploadUrl } from "@src/lib/catbox.js";

describe("Catbox Unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("uploadUrl", () => {
    it.concurrent("should upload URL", async () => {
      const url = "https://example.com/file.txt";
      const mockResult = `${CATBOX_FILE_URL_PREFIX}file.txt`;
      const mockResponse = new Response(mockResult, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": mockResult.length.toString(),
        },
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).resolves.toBe(mockResult);
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const url = "https://example.com/file.txt";
      const controller = new AbortController();

      const resultPromise = uploadUrl(url, { signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should throw for bad URL input", async () => {
      const url = "example.com";

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow("Invalid URL");
    });

    it.concurrent("should throw for bad URL protocol", async () => {
      const url = "ftp://example.com";

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow("URL must use http(s) protocol");
    });

    it.concurrent("should throw if response is not ok", async () => {
      const url = "https://example.com/file.txt";
      const mockResponse = new Response("Server error", { status: 500 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow("catbox upload failed 500");
    });

    it.concurrent("should throw if response does not start with catbox file URL prefix", async () => {
      const url = "https://example.com/file.txt";
      const mockResponse = new Response("some error message", { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow("catbox response has no result link");
    });
  });

  describe("uploadFile", () => {
    it.concurrent("should upload File", async () => {
      const mimeType = "text/plain";
      const file = new File(["content"], "test.txt", { type: mimeType });
      const mockResult = `${CATBOX_FILE_URL_PREFIX}abc123.txt`;
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const result = await uploadFile(file);

      expect(result).toBe(mockResult);
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const mimeType = "text/plain";
      const file = new File(["content"], "test.txt", { type: mimeType });
      const controller = new AbortController();

      const resultPromise = uploadFile(file, { signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should throw if size exceeds limit", async () => {
      const bigData = new Uint8Array(CATBOX_MAX_FILE_BYTES + 1);
      const bigFile = new File([bigData], "text.txt", { type: "text/plain" });

      const resultPromise = uploadFile(bigFile);

      await expect(resultPromise).rejects.toThrow(
        `cannot accept ${bigFile.type} files larger than max ${CATBOX_MAX_FILE_BYTES} bytes`
      );
    });

    it.concurrent("should throw if GIF size exceeds limit", async () => {
      const bigGifData = new Uint8Array(CATBOX_MAX_GIF_BYTES + 1);
      const bigGifFile = new File([bigGifData], "image.gif", { type: "image/gif" });

      const resultPromise = uploadFile(bigGifFile);

      await expect(resultPromise).rejects.toThrow(
        `cannot accept ${bigGifFile.type} files larger than max ${CATBOX_MAX_GIF_BYTES} bytes`
      );
    });

    it.concurrent("should throw if has forbidden file extension", async () => {
      const mockFilename = "bad.exe";
      const file = new File(["content"], mockFilename, { type: "application/octet-stream" });

      const resultPromise = uploadFile(file);

      await expect(resultPromise).rejects.toThrow(
        `filename ${mockFilename} with that extension is not allowed`
      );
    });

    it.concurrent("should throw if fetch response is not ok", async () => {
      const mimeType = "text/plain";
      const file = new File(["content"], "test.txt", { type: mimeType });
      const mockResponse = new Response("Error", { status: 400 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadFile(file);

      await expect(resultPromise).rejects.toThrow("catbox upload failed 400");
    });

    it("should pass AbortSignal to fetch", async () => {
      const mimeType = "text/plain";
      const file = new File(["content"], "test.txt", { type: mimeType });
      const controller = new AbortController();
      const mockError = new DOMException("Aborted", "AbortError");
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockRejectedValueOnce(mockError);

      const resultPromise = uploadFile(file, { signal: controller.signal });

      await expect(resultPromise).rejects.toThrow("Aborted");
      expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal })
      );
      expect(fetchSpy).toHaveBeenCalledOnce();
    });
  });
});
