import { assertStartsWith } from "../assertions.js";
import {
  LITTERBOX_API_ENDPOINT,
  LITTERBOX_DURATIONS,
  LITTERBOX_FILE_URL_PREFIX,
  LITTERBOX_FILENAME_LENGTHS,
  LITTERBOX_MAX_FILE_BYTES,
} from "../constants.js";
import {
  appendFile,
  appendFilenameLength,
  appendReqType,
  appendTime,
  assertFile,
  createUploadPayload,
  uploadPayload,
} from "../payload.js";

/**
 * Litterbox file duration after which the file is deleted.
 */
export type LitterboxDuration = (typeof LITTERBOX_DURATIONS)[number];

/**
 * Litterbox filename length to be used in the file URL.
 */
export type LitterboxFilenameLength = (typeof LITTERBOX_FILENAME_LENGTHS)[number];

/**
 * Uploads a temporary file to Litterbox from a `File`.
 *
 * To override default `duration` from `"1h"` supply it in `options`.
 *
 * To override default `filenameLength` from `6` supply it in `options`.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const file = new File(["content"], "file.txt", { type: "text/plain" });
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   const result = await uploadFile(file, {
 *     duration: "1h",
 *     filenameLength: 6,
 *     signal: controller.signal,
 *   });
 *
 * @param file `File` to upload.
 * @param options Options with `duration`, `filenameLength`, `signal`.
 *
 * @returns Litterbox file URL.
 * @throws For invalid inputs or upload failures and error responses.
 */
export const uploadFile = async (
  file: File,
  options?: {
    duration?: LitterboxDuration;
    filenameLength?: LitterboxFilenameLength;
    signal?: AbortSignal;
  }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "fileupload");

  assertFile(file, LITTERBOX_MAX_FILE_BYTES);
  appendFile(payload, file);

  if (options?.duration) {
    appendTime(payload, options.duration);
  }

  if (options?.filenameLength) {
    appendFilenameLength(payload, options.filenameLength);
  }

  const result = await uploadPayload(payload, LITTERBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Litterbox",
  });

  assertStartsWith(result, LITTERBOX_FILE_URL_PREFIX, "litterbox response");

  return result;
};
