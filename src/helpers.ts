import {
  CATBOX_MAX_FILE_BYTES,
  CATBOX_MAX_GIF_BYTES,
  FORBIDDEN_FILE_EXTENSIONS,
  USER_AGENT,
} from "./constants.js";

export const createUploadFormData = (reqtype: string): FormData => {
  const formData = new FormData();
  formData.append("reqtype", reqtype);

  return formData;
};

export const postFormData = async (
  formData: FormData,
  endpoint: string,
  signal?: AbortSignal
): Promise<Response> =>
  fetch(endpoint, {
    method: "POST",
    headers: { "User-Agent": USER_AGENT },
    body: formData,
    signal: signal ?? null,
  });

export const parseUrl = (str: string): string => {
  const url = new URL(str);

  const isHttp = url.protocol.startsWith("http") || url.protocol.startsWith("https");
  if (!isHttp) {
    throw new Error(`URL must use http(s) protocol`);
  }

  const strUrl = url.toString();

  return strUrl;
};

export const checkFileExtension = (file: File) => {
  const extOk = FORBIDDEN_FILE_EXTENSIONS.filter(ext => file.name.endsWith(ext)).length === 0;

  if (!extOk) {
    throw new Error(`filename ${file.name} with that extension is not allowed`);
  }
};

export const checkFileSize = (file: File, maxSize: number) => {
  const sizeOk = file.size <= maxSize;

  if (!sizeOk) {
    throw new Error(`cannot accept ${file.type} files larger than max ${maxSize} bytes`);
  }
};

export const getCatboxMaxUploadSize = (mimeType: string): number => {
  const isGif = mimeType === "image/gif";
  if (isGif) {
    return CATBOX_MAX_GIF_BYTES;
  }

  return CATBOX_MAX_FILE_BYTES;
};
