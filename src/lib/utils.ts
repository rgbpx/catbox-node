import { CATBOX_ALBUM_URL_PREFIX, CATBOX_FILE_URL_PREFIX } from "@src/constants.js";

/**
 * Extracts Catbox album `short` from Catbox album URL.
 *
 * Album `short` is required for album operations.
 *
 * @example
 *   const catboxFileURL = await uploadUrl("https://example.com/file.txt");
 *   const filename = toFilename(catboxFileURL);
 *   const albumURL = await createAlbum("Title Here", "Description Here", [filename]);
 *
 *   const short = toShort(albumURL);
 *
 * @param albumUrl Catbox album URL to convert to `short`.
 *
 * @returns Catbox album `short` for album operations.
 * @throws Throws when `albumUrl` is not a Catbox album URL.
 */
export const toShort = (albumUrl: string) => {
  if (!albumUrl.startsWith(CATBOX_ALBUM_URL_PREFIX)) {
    throw new Error("not catbox album url");
  }

  const short = albumUrl.replace(CATBOX_ALBUM_URL_PREFIX, "");

  return short;
};

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
