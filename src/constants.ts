export const USER_AGENT = "rgbpx/catbox-node";

/**
 * File types not allowed by Catbox.
 */
export const FORBIDDEN_FILE_EXTENSIONS = [".exe", ".scr", ".cpl", ".doc", ".jar"] as const;

/**
 * Max number of items allowed in a Catbox album.
 */
export const CATBOX_ALBUM_MAX_ITEMS = 500;

/**
 * Max file size to upload allowed by Catbox.
 *
 * This rule does not apply to **GIF** files. Use {@link CATBOX_MAX_GIF_BYTES} instead.
 */
export const CATBOX_MAX_FILE_BYTES = 200 * 1024 * 1024; // 200 MB

/**
 * Max GIF size to upload allowed by Catbox.
 */
export const CATBOX_MAX_GIF_BYTES = 20 * 1024 * 1024; // 20 MB

export const CATBOX_API_ENDPOINT = "https://catbox.moe/user/api.php";
export const CATBOX_FILE_URL_PREFIX = "https://files.catbox.moe/";
export const CATBOX_ALBUM_URL_PREFIX = "https://catbox.moe/c/";

/**
 * Max file size allowed for Litterbox.
 */
export const LITTERBOX_MAX_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB

export const LITTERBOX_API_ENDPOINT = "https://litterbox.catbox.moe/resources/internals/api.php";
export const LITTERBOX_FILE_URL_PREFIX = "https://litter.catbox.moe/";
export const LITTERBOX_FILENAME_LENGTHS = [6, 16] as const;
export const LITTERBOX_DURATIONS = ["1h", "12h", "24h", "72h"] as const;
