import { afterEach, describe, expect, it, vi } from "vitest";
import { LITTERBOX_FILE_URL_PREFIX, LITTERBOX_MAX_FILE_BYTES } from "@src/constants.js";
import { uploadFile } from "@src/lib/litterbox.js";

describe("Litterbox Unit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("uploadFile", () => {
    it.concurrent("should upload File", async () => {
      const mimeType = "text/plain";
      const file = new File(["content"], "test.txt", { type: mimeType });
      const mockResult = `${LITTERBOX_FILE_URL_PREFIX}abc123.txt`;
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
      const bigData = new Uint8Array(LITTERBOX_MAX_FILE_BYTES + 1);
      const bigFile = new File([bigData], "text.txt", { type: "text/plain" });

      const resultPromise = uploadFile(bigFile);

      await expect(resultPromise).rejects.toThrow(
        `cannot accept ${bigFile.type} files larger than max ${LITTERBOX_MAX_FILE_BYTES} bytes`
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

      await expect(resultPromise).rejects.toThrow("litterbox upload failed 400");
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
