import { CATBOX_API_ENDPOINT, CATBOX_FILE_URL_PREFIX } from "../constants.js";
import { createUploadFormData, parseUrl, postFormData } from "../helpers.js";

const createUrlUploadFormData = (url: string, userhash?: string): FormData => {
  const formData = createUploadFormData("urlupload");
  formData.append("url", url);
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
 * @throws Throws when provided URL is invalid.
 * @throws Throws when provided URL protocol is not http(s).
 * @throws Throws when operation was aborted using provided `signal`.
 * @throws Throws when Catbox response status is not ok.
 * @throws Throws when Catbox response text does not contain Catbox file URL.
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
