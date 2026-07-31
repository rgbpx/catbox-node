export const USER_AGENT = "rgbpx/catbox-node";
export const CATBOX_API_ENDPOINT = "https://catbox.moe/user/api.php";
export const CATBOX_FILE_URL_PREFIX = "https://files.catbox.moe/";
export const CATBOX_MAX_GIF_BYTES = 20 * 1024 * 1024; // 20 MB
export const CATBOX_MAX_FILE_BYTES = 200 * 1024 * 1024; // 200 MB
export const FORBIDDEN_FILE_EXTENSIONS = [".exe", ".scr", ".cpl", ".doc", ".jar"] as const;
