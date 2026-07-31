import { CATBOX_FILE_URL_PREFIX } from "@src/constants.js";

/**
 * Extracts Catbox `filename` from Catbox file URL.
 *
 * Filename is required for album items operations.
 *
 * @example
 *   const catboxFileURL = await uploadUrl("https://example.com/file.txt");
 *
 *   const filename = toFilename(catboxFileURL);
 *
 * @param fileUrl Catbox file URL to convert to `filename`.
 *
 * @returns Catbox file `filename` for album items operations.
 * @throws Throws when `fileUrl` is not a Catbox file URL.
 */
export const toFilename = (fileUrl: string) => {
  if (!fileUrl.startsWith(CATBOX_FILE_URL_PREFIX)) {
    throw new Error("not catbox file url");
  }

  const filename = fileUrl.replace(CATBOX_FILE_URL_PREFIX, "");

  return filename;
};
