export const parseUrl = (url: string, label: string = "URL"): URL => {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl;
  } catch (err) {
    throw new Error(`${label} ("${url}") is not a valid URL.`, {
      cause: err,
    });
  }
};

export const stringifyFilenames = (filenames: string[]): string =>
  [...new Set(filenames)].join(" ").trim();
