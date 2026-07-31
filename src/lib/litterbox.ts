import {
  LITTERBOX_API_ENDPOINT,
  LITTERBOX_DURATIONS,
  LITTERBOX_FILE_URL_PREFIX,
  LITTERBOX_FILENAME_LENGTHS,
  LITTERBOX_MAX_FILE_BYTES,
} from "../constants.js";
import {
  checkFileExtension,
  checkFileSize,
  createUploadFormData,
  postFormData,
} from "../helpers.js";

/**
 * Litterbox file duration after which the file is deleted.
 */
export type LitterboxDuration = (typeof LITTERBOX_DURATIONS)[number];

/**
 * Litterbox filename length to be used in the file URL.
 */
export type LitterboxFilenameLength = (typeof LITTERBOX_FILENAME_LENGTHS)[number];

const createFileUploadFormData = (
  file: File,
  duration: LitterboxDuration = "1h",
  filenameLength: LitterboxFilenameLength = 6
): FormData => {
  const formData = createUploadFormData("fileupload");
  formData.append("fileToUpload", file, file.name);
  formData.append("time", duration);
  formData.append("fileNameLength", filenameLength);

  return formData;
};

const parseUploadResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`litterbox upload failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.startsWith(LITTERBOX_FILE_URL_PREFIX);
  if (!resultOk) {
    throw new Error(`litterbox response has no result link ${result}`);
  }

  return result;
};

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
 * @throws Throws when `File` size is over Litterbox max file size limit.
 * @throws Throws when file extension is not allowed by Litterbox.
 * @throws Throws when operation was aborted using provided `signal`.
 * @throws Throws when Litterbox response status is not ok.
 * @throws Throws when Litterbox response text does not contain Litterbox file URL.
 */
export const uploadFile = async (
  file: File,
  options?: {
    duration?: LitterboxDuration;
    filenameLength?: LitterboxFilenameLength;
    signal?: AbortSignal;
  }
): Promise<string> => {
  checkFileExtension(file);
  checkFileSize(file, LITTERBOX_MAX_FILE_BYTES);

  const formData = createFileUploadFormData(file, options?.duration, options?.filenameLength);
  const response = await postFormData(formData, LITTERBOX_API_ENDPOINT, options?.signal);
  const result = await parseUploadResponse(response);

  return result;
};
