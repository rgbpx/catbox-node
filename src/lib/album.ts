import { CATBOX_ALBUM_URL_PREFIX, CATBOX_API_ENDPOINT } from "@src/constants.js";
import {
  checkAlbumItemCount,
  createUploadFormData,
  mergeFilenames,
  postFormData,
} from "@src/helpers.js";

const createAlbumCreateFormData = (
  title: string,
  description: string,
  filenames?: string,
  userhash?: string
): FormData => {
  const formData = createUploadFormData("createalbum");
  formData.append("title", title);
  formData.append("desc", description);

  if (filenames) {
    formData.append("files", filenames);
  }

  if (userhash) {
    formData.append("userhash", userhash);
  }

  return formData;
};

const createAlbumDeleteFormData = (short: string, userhash: string): FormData => {
  const formData = createUploadFormData("deletealbum");
  formData.append("short", short);
  formData.append("userhash", userhash);

  return formData;
};

const createAlbumEditFormData = (
  short: string,
  title: string,
  description: string,
  filenames: string,
  userhash: string
): FormData => {
  const formData = createUploadFormData("editalbum");
  formData.append("short", short);
  formData.append("title", title);
  formData.append("desc", description);
  formData.append("files", filenames);
  formData.append("userhash", userhash);

  return formData;
};

const createAddToAlbumFormData = (short: string, filenames: string, userhash: string): FormData => {
  const formData = createUploadFormData("addtoalbum");
  formData.append("short", short);
  formData.append("files", filenames);
  formData.append("userhash", userhash);

  return formData;
};

const createRemoveFromAlbumFormData = (
  short: string,
  filenames: string,
  userhash: string
): FormData => {
  const formData = createUploadFormData("removefromalbum");
  formData.append("short", short);
  formData.append("files", filenames);
  formData.append("userhash", userhash);

  return formData;
};

const parseAlbumCreateResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`catbox album create failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.startsWith(CATBOX_ALBUM_URL_PREFIX);
  if (!resultOk) {
    throw new Error(`catbox response has no album link ${result}`);
  }

  return result;
};

const parseAlbumDeleteResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    throw new Error(`catbox album delete failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.length === 0;
  if (!resultOk) {
    throw new Error(`catbox album delete bad response ${result}`);
  }
};

const parseAlbumEditResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`catbox album edit failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.startsWith(CATBOX_ALBUM_URL_PREFIX);
  if (!resultOk) {
    throw new Error(`catbox response has no album link ${result}`);
  }

  return result;
};

const parseAddToAlbumResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`catbox add to album failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.startsWith(CATBOX_ALBUM_URL_PREFIX);
  if (!resultOk) {
    throw new Error(`catbox response has no album link ${result}`);
  }

  return result;
};

const parseRemoveFromAlbumResponse = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`catbox remove from album failed ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const resultOk = result.startsWith(CATBOX_ALBUM_URL_PREFIX);
  if (!resultOk) {
    throw new Error(`catbox response has no album link ${result}`);
  }

  return result;
};

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
 * @throws Throws when `filenames` item count is over the maximum Catbox allowed limit.
 * @throws Throws when Catbox response status is not ok.
 * @throws Throws when Catbox response text does not contain Catbox album URL.
 */
export const createAlbum = async (
  title: string = "",
  description: string = "",
  filenames: string[] = [],
  options?: { userhash?: string; signal?: AbortSignal }
): Promise<string> => {
  checkAlbumItemCount(filenames.length);

  const mergedFilenames = mergeFilenames(filenames);
  const formData = createAlbumCreateFormData(
    title,
    description,
    mergedFilenames,
    options?.userhash
  );
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);
  const result = await parseAlbumCreateResponse(response);

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
 * @throws Throws when Catbox response status is not ok.
 * @throws Throws when Catbox response text is not empty.
 */
export const deleteAlbum = async (
  short: string,
  options: { userhash: string; signal?: AbortSignal }
): Promise<void> => {
  const formData = createAlbumDeleteFormData(short, options.userhash);
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);

  await parseAlbumDeleteResponse(response);
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
 * @throws Throws when Catbox response status is not ok.
 * @throws Throws when Catbox response text does not contain Catbox album URL.
 */
export const editAlbum = async (
  short: string,
  title: string,
  description: string,
  filenames: string[],
  options: { userhash: string; signal?: AbortSignal }
): Promise<string> => {
  const mergedFilenames = mergeFilenames(filenames);
  const formData = createAlbumEditFormData(
    short,
    title,
    description,
    mergedFilenames,
    options.userhash
  );
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);
  const result = await parseAlbumEditResponse(response);

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
 * @throws Throws when Catbox response status is not ok.
 * @throws Throws when Catbox response text does not contain Catbox album URL.
 */
export const addToAlbum = async (
  short: string,
  filenames: string[] = [],
  options: { userhash: string; signal?: AbortSignal }
): Promise<string> => {
  const mergedFilenames = mergeFilenames(filenames);
  const formData = createAddToAlbumFormData(short, mergedFilenames, options.userhash);
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);
  const result = await parseAddToAlbumResponse(response);

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
 * @throws Throws when Catbox response status is not ok.
 * @throws Throws when Catbox response text does not contain Catbox album URL.
 */
export const removeFromAlbum = async (
  short: string,
  filenames: string[] = [],
  options: { userhash: string; signal?: AbortSignal }
): Promise<string> => {
  const mergedFilenames = mergeFilenames(filenames);
  const formData = createRemoveFromAlbumFormData(short, mergedFilenames, options.userhash);
  const response = await postFormData(formData, CATBOX_API_ENDPOINT, options?.signal);
  const result = await parseRemoveFromAlbumResponse(response);

  return result;
};
