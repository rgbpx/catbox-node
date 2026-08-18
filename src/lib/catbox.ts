import { assertEqualTo, assertStartsWith } from "../assertions.js";
import {
  CATBOX_API_ENDPOINT,
  CATBOX_FILE_URL_PREFIX,
  CATBOX_MAX_FILE_BYTES,
  CATBOX_MAX_GIF_BYTES,
} from "../constants.js";
import { stringifyFilenames } from "../parser.js";
import {
  appendFile,
  appendFilenames,
  appendReqType,
  appendUrl,
  appendUserhash,
  assertFile,
  assertUrl,
  assertUserhash,
  createUploadPayload,
  uploadPayload,
} from "../payload.js";

/**
 * Uploads a file to Catbox from a `URL`.
 *
 * For anonymous uploads do not supply a `userhash`.
 *
 * Only files uploaded with a `userhash` **CAN** be **removed** later.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const myUserhash = "####";
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   const result = await uploadUrl("https://example.com/file.txt", {
 *     userhash: myUserhash,
 *     signal: controller.signal,
 *   });
 *
 * @param url URL of the file to upload.
 * @param options Options with `userhash` and `signal`.
 *
 * @returns Catbox file URL.
 * @throws For invalid inputs or upload failures and error responses.
 */
export const uploadUrl = async (
  url: string,
  options?: { userhash?: string; signal?: AbortSignal }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "urlupload");

  const urlTrimmed = url.trim();
  assertUrl(urlTrimmed);
  appendUrl(payload, urlTrimmed);

  if (options?.userhash) {
    const userhashTrimmed = options.userhash.trim();

    assertUserhash(userhashTrimmed);
    appendUserhash(payload, userhashTrimmed);
  }

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertStartsWith(result, CATBOX_FILE_URL_PREFIX, "catbox response");

  return result;
};

/**
 * Uploads a file to Catbox from a `File`.
 *
 * For anonymous uploads do not supply a `userhash`.
 *
 * Only files uploaded with a `userhash` **CAN** be **removed** later.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const myUserhash = "####";
 *   const file = new File(["content"], "file.txt", { type: "text/plain" });
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   const result = await uploadFile(file, {
 *     userhash: myUserhash,
 *     signal: controller.signal,
 *   });
 *
 * @param file `File` to upload.
 * @param options Options with `userhash` and `signal`.
 *
 * @returns Catbox file URL.
 * @throws For invalid inputs or upload failures and error responses.
 */
export const uploadFile = async (
  file: File,
  options?: { userhash?: string; signal?: AbortSignal }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "fileupload");

  if (file.type === "image/gif" || file.name.endsWith(".gif")) {
    assertFile(file, CATBOX_MAX_GIF_BYTES);
  } else {
    assertFile(file, CATBOX_MAX_FILE_BYTES);
  }

  appendFile(payload, file);

  if (options?.userhash) {
    const userhashTrimmed = options.userhash.trim();

    assertUserhash(userhashTrimmed);
    appendUserhash(payload, userhashTrimmed);
  }

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertStartsWith(result, CATBOX_FILE_URL_PREFIX, "catbox response");

  return result;
};

export const deleteFiles = async (
  filenames: string[],
  options: { userhash: string; signal?: AbortSignal }
): Promise<void> => {
  const payload = createUploadPayload();
  appendReqType(payload, "deletefiles");

  appendFilenames(payload, stringifyFilenames(filenames));

  const userhashTrimmed = options.userhash.trim();
  assertUserhash(userhashTrimmed);
  appendUserhash(payload, userhashTrimmed);

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertEqualTo(result, "Files successfully deleted.", "catbox delete files response");
};
