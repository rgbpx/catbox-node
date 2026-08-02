import { CATBOX_API_ENDPOINT, CATBOX_FILE_URL_PREFIX } from "../constants.js";
import {
  checkFileExtension,
  checkFileSize,
  createUploadFormData,
  getCatboxMaxUploadSize,
  parseUrl,
  postFormData,
} from "../helpers.js";

const createUrlUploadFormData = (url: string, userhash?: string): FormData => {
  const formData = createUploadFormData("urlupload");
  formData.append("url", url);
  if (userhash) {
    formData.append("userhash", userhash);
  }

  return formData;
};

const createFileUploadFormData = (file: File, userhash?: string): FormData => {
  const formData = createUploadFormData("fileupload");
  formData.append("fileToUpload", file, file.name);
  if (userhash) {
    formData.append("userhash", userhash);
  }

  return formData;
};

const parseUploadResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`catbox upload failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.startsWith(CATBOX_FILE_URL_PREFIX);
  if (!resultOk) {
    throw new Error(`catbox response has no result link ${result}`);
  }

  return result;
};

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
 */
export const uploadUrl = async (
  url: string,
  options?: { userhash?: string; signal?: AbortSignal }
): Promise<string> => {
  const parsedUrl = parseUrl(url);
  const formData = createUrlUploadFormData(parsedUrl, options?.userhash);
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);
  const result = await parseUploadResponse(response);

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
 */
export const uploadFile = async (
  file: File,
  options?: { userhash?: string; signal?: AbortSignal }
): Promise<string> => {
  const maxFileSize = getCatboxMaxUploadSize(file.type);

  checkFileExtension(file);
  checkFileSize(file, maxFileSize);

  const formData = createFileUploadFormData(file, options?.userhash);
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);
  const result = await parseUploadResponse(response);

  return result;
};
