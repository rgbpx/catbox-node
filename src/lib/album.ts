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
 *   const filename = toFilename(fileURL);
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
