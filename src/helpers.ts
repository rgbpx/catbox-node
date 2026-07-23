import { USER_AGENT } from "./constants.js";

export const parseUrl = (str: string): string => {
  const url = new URL(str);

  const isHttp = url.protocol.startsWith("http") || url.protocol.startsWith("https");
  if (!isHttp) {
    throw new Error(`URL must use http(s) protocol`);
  }

  const strUrl = url.toString();

  return strUrl;
};

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
