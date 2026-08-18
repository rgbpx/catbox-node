import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CATBOX_FILE_URL_PREFIX,
  CATBOX_MAX_FILE_BYTES,
  CATBOX_MAX_GIF_BYTES,
  FORBIDDEN_FILE_EXTENSIONS,
} from "@src/constants.js";
import { uploadFile, uploadUrl, deleteFiles } from "@src/lib/catbox.js";

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

    it.concurrent("should throw for invalid URL input", async () => {
      const url = "example.com";

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow(`input url ("${url}") is not a valid URL.`);
    });

    it.concurrent("should throw for invalid URL protocol", async () => {
      const protocol = "ftp:";
      const url = `${protocol}example.com`;

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow(
        `input url protocol ("${protocol}") must match one of: http, https.`
      );
    });

    it.concurrent("should throw if response is not ok", async () => {
      const url = "https://example.com/file.txt";
      const mockStatusCode = 500;
      const mockStatusText = "Internal Server Error";
      const mockResult = "Server error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });

    it.concurrent("should throw if response does not start with catbox file URL prefix", async () => {
      const url = "https://example.com/file.txt";
      const mockResult = "Server error";
      const mockResponse = new Response(mockResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadUrl(url);

      await expect(resultPromise).rejects.toThrow(
        `catbox response ("${mockResult}") must start with "${CATBOX_FILE_URL_PREFIX}".`
      );
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

    it.concurrent("should throw if file size exceeds limit", async () => {
      const bigData = new Uint8Array(CATBOX_MAX_FILE_BYTES + 1);
      const bigFile = new File([bigData], "text.txt", { type: "text/plain" });

      const resultPromise = uploadFile(bigFile);

      await expect(resultPromise).rejects.toThrow(
        `file size (${bigFile.size}) must be less than or equal to ${CATBOX_MAX_FILE_BYTES}.`
      );
    });

    it.concurrent("should throw if file with GIF mime exceeds size limit", async () => {
      const bigGifData = new Uint8Array(CATBOX_MAX_GIF_BYTES + 1);
      const bigGifFile = new File([bigGifData], "image", { type: "image/gif" });

      const resultPromise = uploadFile(bigGifFile);

      await expect(resultPromise).rejects.toThrow(
        `file size (${bigGifFile.size}) must be less than or equal to ${CATBOX_MAX_GIF_BYTES}.`
      );
    });

    it.concurrent("should throw if file with GIF extension exceeds size limit", async () => {
      const bigGifData = new Uint8Array(CATBOX_MAX_GIF_BYTES + 1);
      const bigGifFile = new File([bigGifData], "image.gif");

      const resultPromise = uploadFile(bigGifFile);

      await expect(resultPromise).rejects.toThrow(
        `file size (${bigGifFile.size}) must be less than or equal to ${CATBOX_MAX_GIF_BYTES}.`
      );
    });

    it.concurrent("should throw if GIF file exceeds size limit", async () => {
      const bigGifData = new Uint8Array(CATBOX_MAX_GIF_BYTES + 1);
      const bigGifFile = new File([bigGifData], "image.gif", { type: "image/gif" });

      const resultPromise = uploadFile(bigGifFile);

      await expect(resultPromise).rejects.toThrow(
        `file size (${bigGifFile.size}) must be less than or equal to ${CATBOX_MAX_GIF_BYTES}.`
      );
    });

    it.concurrent("should throw if has forbidden file extension", async () => {
      const mockFilename = "bad.exe";
      const file = new File(["content"], mockFilename, { type: "application/octet-stream" });

      const resultPromise = uploadFile(file);

      await expect(resultPromise).rejects.toThrow(
        `file extension ("${mockFilename}") must not match any of: ${FORBIDDEN_FILE_EXTENSIONS.join(", ")}.`
      );
    });

    it.concurrent("should throw if fetch response is not ok", async () => {
      const mimeType = "text/plain";
      const file = new File(["content"], "test.txt", { type: mimeType });
      const mockStatusCode = 400;
      const mockStatusText = "Bad Request";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = uploadFile(file);

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
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

  describe("deleteFiles", () => {
    it.concurrent("should delete file", async () => {
      const userhash = "userhash123";
      const filename = "abc123.jpg";
      const mockSuccessResult = "Files successfully deleted.";
      const mockResponse = new Response(mockSuccessResult, { status: 200 });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteFiles([filename], { userhash });

      await expect(resultPromise).resolves.toBeUndefined();
    });

    it.concurrent("should throw if operation was aborted", async () => {
      const userhash = "userhash123";
      const filename = "abc123.jpg";
      const controller = new AbortController();

      const resultPromise = deleteFiles([filename], { userhash, signal: controller.signal });
      controller.abort();

      await expect(resultPromise).rejects.toThrow("This operation was aborted");
    });

    it.concurrent("should throw for invalid userhash", async () => {
      const userhash = "####";
      const filename = "abc123.jpg";

      const resultPromise = deleteFiles([filename], { userhash });

      await expect(resultPromise).rejects.toThrow(
        `userhash ("${userhash}") must contain only lowercase letters and numbers (a-z, 0-9).`
      );
    });

    it.concurrent("should throw if response is not ok", async () => {
      const userhash = "userhash123";
      const filename = "abc123.jpg";
      const mockStatusCode = 500;
      const mockStatusText = "Bad Request";
      const mockResult = "Internal Error";
      const mockResponse = new Response(mockResult, {
        status: mockStatusCode,
        statusText: mockStatusText,
      });
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(mockResponse);

      const resultPromise = deleteFiles([filename], { userhash });

      await expect(resultPromise).rejects.toThrow(
        `HTTP ${mockStatusCode} ${mockStatusText} Catbox ${mockResult}`
      );
    });
  });
});
