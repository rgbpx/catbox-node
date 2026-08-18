import type { LitterboxDuration, LitterboxFilenameLength } from "./lib/litterbox.js";
import {
  assertDoesNotMatchAnyOf,
  assertGreaterThan,
  assertIncludes,
  assertIsAlphanumeric,
  assertLessThanOrEqual,
  assertMatchesOneOf,
} from "./assertions.js";
import { CATBOX_ALBUM_MAX_ITEMS, FORBIDDEN_FILE_EXTENSIONS, USER_AGENT } from "./constants.js";
import { parseUrl } from "./parser.js";

export type CatboxReqType =
  | "fileupload"
  | "urlupload"
  | "createalbum"
  | "editalbum"
  | "addtoalbum"
  | "removefromalbum"
  | "deletealbum";

export const createUploadPayload = (): FormData => {
  const payload = new FormData();

  return payload;
};

export const assertUrl = (url: string): void => {
  assertGreaterThan(url.length, 0, "input url length");

  const parsedUrl = parseUrl(url, "input url");
  assertIncludes(parsedUrl.hostname, ".", "input url hostname");
  assertMatchesOneOf(
    parsedUrl.protocol,
    ["http", "https"],
    (proto, allowedProto) => proto.startsWith(allowedProto),
    "input url protocol"
  );
};

export const assertFile = (file: File, maxSize: number): void => {
  assertGreaterThan(file.size, 0, "file size");
  assertLessThanOrEqual(file.size, maxSize, "file size");

  assertDoesNotMatchAnyOf(
    file.name,
    FORBIDDEN_FILE_EXTENSIONS,
    (filename, ext) => filename.endsWith(ext),
    "file extension"
  );
};

export const assertUserhash = (userhash: string): void => {
  assertIsAlphanumeric(userhash, "userhash");
};

export const assertAlbumShort = (short: string): void => {
  assertIsAlphanumeric(short, "album short");
};

export const assertAlbumSize = (size: number): void => {
  assertLessThanOrEqual(size, CATBOX_ALBUM_MAX_ITEMS, "album size");
};

export const appendUrl = (payload: FormData, url: string): void => payload.append("url", url);
export const appendFile = (payload: FormData, file: File): void =>
  payload.append("fileToUpload", file, file.name);
export const appendReqType = (payload: FormData, reqType: CatboxReqType): void =>
  payload.append("reqtype", reqType);
export const appendUserhash = (payload: FormData, userhash: string): void =>
  payload.append("userhash", userhash);
export const appendTime = (payload: FormData, time: LitterboxDuration): void =>
  payload.append("time", time);
export const appendFilenameLength = (
  payload: FormData,
  filenameLength: LitterboxFilenameLength
): void => payload.append("fileNameLength", filenameLength);
export const appendTitle = (payload: FormData, title: string): void =>
  payload.append("title", title);
export const appendDescription = (payload: FormData, description: string): void =>
  payload.append("desc", description);
export const appendFilenames = (payload: FormData, filenames: string): void =>
  payload.append("files", filenames);
export const appendAlbumShort = (payload: FormData, short: string): void =>
  payload.append("short", short);

export const uploadPayload = async (
  payload: FormData,
  endpoint: string,
  options?: {
    service?: string;
    signal?: AbortSignal | undefined;
  }
): Promise<string> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "User-Agent": USER_AGENT },
    body: payload,
    signal: options?.signal ?? null,
  });

  const result = await response.text();

  if (!response.ok) {
    const err = ["HTTP", response.status];
    if (response.statusText) {
      err.push(response.statusText.trim());
    }

    const svc = options?.service ?? "Catbox";
    err.push(svc.trim());
    err.push(result.trim());

    throw new Error(err.join(" "));
  }

  return result;
};
