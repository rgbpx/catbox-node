import { assertEqualTo, assertStartsWith } from "../assertions.js";
import { CATBOX_ALBUM_URL_PREFIX, CATBOX_API_ENDPOINT } from "../constants.js";
import { stringifyFilenames } from "../parser.js";
import {
  appendAlbumShort,
  appendDescription,
  appendFilenames,
  appendReqType,
  appendTitle,
  appendUserhash,
  assertAlbumShort,
  assertAlbumSize,
  assertUserhash,
  createUploadPayload,
  uploadPayload,
} from "../payload.js";

/**
 * Creates a new Catbox album.
 *
 * For an anonymous album, don't supply a `userhash`.
 *
 * Albums created anonymously **CANNOT** be **edited** or **deleted**.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const catboxFileURL = await uploadUrl("https://example.com/file.txt");
 *   const filename = toFilename(catboxFileURL);
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   const albumURL = await createAlbum("Title Here", "Description Here", [filename], {
 *     userhash: "####",
 *     signal: controller.signal,
 *   });
 *
 * @param title Album title.
 * @param description Album description.
 * @param filenames Catbox filenames to create the album with. Duplicates automatically removed.
 * @param options Options with `userhash` and `signal`.
 *
 * @returns Catbox album URL.
 */
export const createAlbum = async (
  title: string = "",
  description: string = "",
  filenames: string[] = [],
  options?: { userhash?: string; signal?: AbortSignal }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "createalbum");

  appendTitle(payload, title);
  appendDescription(payload, description);

  assertAlbumSize(filenames.length);
  appendFilenames(payload, stringifyFilenames(filenames));

  if (options?.userhash) {
    const userhashTrimmed = options.userhash.trim();

    assertUserhash(userhashTrimmed);
    appendUserhash(payload, userhashTrimmed);
  }

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertStartsWith(result, CATBOX_ALBUM_URL_PREFIX, "catbox album response");

  return result;
};

/**
 * Deletes an existing Catbox album.
 *
 * Only albums created with a `userhash` can be **deleted**.
 *
 * Anonymous albums created without a `userhash` **CANNOT** be **deleted**.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const myUserhash = "####";
 *   const catboxFileURL = await uploadUrl("https://example.com/file.txt");
 *   const filename = toFilename(catboxFileURL);
 *   const albumURL = await createAlbum("Title Here", "Description Here", [filename], {
 *     userhash: myUserhash,
 *   });
 *   const short = toShort(albumURL);
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   await deleteAlbum(short, { userhash: myUserhash, signal: controller.signal });
 *
 * @param short Album `short` to delete.
 * @param options Options with `userhash` and `signal`.
 */
export const deleteAlbum = async (
  short: string,
  options: { userhash: string; signal?: AbortSignal }
): Promise<void> => {
  const payload = createUploadPayload();
  appendReqType(payload, "deletealbum");

  assertAlbumShort(short);
  appendAlbumShort(payload, short);

  const userhashTrimmed = options.userhash.trim();
  assertUserhash(userhashTrimmed);
  appendUserhash(payload, userhashTrimmed);

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertEqualTo(result.length, 0, "catbox album delete response length");
};

/**
 * Edits an existing Catbox album.
 *
 * New values override existing ones. Supplying new `filenames` array will completely replace all
 * the existing files in the album. If you just want to add new files, use `addToAlbum` or if you
 * want to remove the files, use `removeFromAlbum` instead.
 *
 * Only albums created with a `userhash` can be **edited**.
 *
 * Anonymous albums created without a `userhash` **CANNOT** be **edited**.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const myUserhash = "####";
 *   const catboxFileURL = await uploadUrl("https://example.com/file.txt");
 *   const filename = toFilename(catboxFileURL);
 *   const albumURL = await createAlbum("Title Here", "Description Here", [filename], {
 *     userhash: myUserhash,
 *   });
 *
 *   const newCatboxFileURL = await uploadUrl("https://example.com/file.txt");
 *   const newFilename = toFilename(newCatboxFileURL);
 *   const short = toShort(albumURL);
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   await editAlbum(short, "New Title Here", "New Description Here", [newFilename], {
 *     userhash: myUserhash,
 *     signal: controller.signal,
 *   });
 *
 * @param short Album `short` to delete.
 * @param title New `title` for the album.
 * @param description New `description` for the album.
 * @param filenames New filename list of files to overwrite existing ones in the album.
 * @param options Options with `userhash` and `signal`.
 *
 * @returns Catbox album URL.
 */
export const editAlbum = async (
  short: string,
  title: string,
  description: string,
  filenames: string[],
  options: { userhash: string; signal?: AbortSignal }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "editalbum");

  assertAlbumShort(short);
  appendAlbumShort(payload, short);

  appendTitle(payload, title);
  appendDescription(payload, description);

  assertAlbumSize(filenames.length);
  appendFilenames(payload, stringifyFilenames(filenames));

  const userhashTrimmed = options.userhash.trim();
  assertUserhash(userhashTrimmed);
  appendUserhash(payload, userhashTrimmed);

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertStartsWith(result, CATBOX_ALBUM_URL_PREFIX, "catbox album response");

  return result;
};

/**
 * Adds Catbox files to a Catbox album.
 *
 * Only albums created with a `userhash` can **add** new files.
 *
 * Anonymous albums created without a `userhash` **CANNOT** **add** new files.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const myUserhash = "####";
 *   const firstFileURL = await uploadUrl("https://example.com/a.txt");
 *   const firstFilename = toFilename(firstFileURL);
 *   const albumURL = await createAlbum("Title Here", "Description Here", [firstFilename], {
 *     userhash: myUserhash,
 *   });
 *
 *   const secondFileURL = await uploadUrl("https://example.com/b.txt");
 *   const secondFilename = toFilename(secondFileURL);
 *   const short = toShort(albumURL);
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   await addToAlbum(short, [secondFilename], { userhash: myUserhash, signal: controller.signal });
 *
 * @param short Album `short` to delete.
 * @param filenames List of `filenames` to add to the album.
 * @param options Options with `userhash` and `signal`.
 *
 * @returns Catbox album URL.
 */
export const addToAlbum = async (
  short: string,
  filenames: string[] = [],
  options: { userhash: string; signal?: AbortSignal }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "addtoalbum");

  assertAlbumShort(short);
  appendAlbumShort(payload, short);

  assertAlbumSize(filenames.length);
  appendFilenames(payload, stringifyFilenames(filenames));

  const userhashTrimmed = options.userhash.trim();
  assertUserhash(userhashTrimmed);
  appendUserhash(payload, userhashTrimmed);

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertStartsWith(result, CATBOX_ALBUM_URL_PREFIX, "catbox album response");

  return result;
};

/**
 * Removes existing Catbox album files from a Catbox album.
 *
 * Only albums created with a `userhash` can **remove** files from the album.
 *
 * Anonymous albums created without a `userhash` **CANNOT** **remove** files from the album.
 *
 * Use `signal` for timeout/retries logic.
 *
 * @example
 *   const myUserhash = "####";
 *   const fileURL = await uploadUrl("https://example.com/file.txt");
 *   const filename = toFilename(fileURL);
 *   const albumURL = await createAlbum("Title Here", "Description Here", [filename], {
 *     userhash: myUserhash,
 *   });
 *   const short = toShort(albumURL);
 *   const controller = new AbortController();
 *   setTimeout(() => controller.abort(), 5000);
 *
 *   await removeFromAlbum(short, [filename], { userhash: myUserhash, signal: controller.signal });
 *
 * @param short Album `short` to delete.
 * @param filenames List of `filenames` to remove from the album.
 * @param options Options with `userhash` and `signal`.
 *
 * @returns Catbox album URL.
 */
export const removeFromAlbum = async (
  short: string,
  filenames: string[] = [],
  options: { userhash: string; signal?: AbortSignal }
): Promise<string> => {
  const payload = createUploadPayload();
  appendReqType(payload, "removefromalbum");

  assertAlbumShort(short);
  appendAlbumShort(payload, short);

  assertAlbumSize(filenames.length);
  appendFilenames(payload, stringifyFilenames(filenames));

  const userhashTrimmed = options.userhash.trim();
  assertUserhash(userhashTrimmed);
  appendUserhash(payload, userhashTrimmed);

  const result = await uploadPayload(payload, CATBOX_API_ENDPOINT, {
    signal: options?.signal,
    service: "Catbox",
  });

  assertStartsWith(result, CATBOX_ALBUM_URL_PREFIX, "catbox album response");

  return result;
};
