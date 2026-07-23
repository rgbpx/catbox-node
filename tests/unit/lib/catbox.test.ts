import { afterEach, describe, expect, it, vi } from "vitest";
import { CATBOX_FILE_URL_PREFIX } from "@src/constants.js";
import { uploadUrl } from "@src/lib/catbox.js";

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
});
