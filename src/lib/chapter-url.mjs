const SUPPORTED_CHAPTER_HOSTNAME = "opchapters.com";

/**
 * @typedef {{ valid: true } | {
 *   valid: false,
 *   reason: "invalid_url" | "unsupported_protocol" | "unsupported_provider",
 *   hostname?: string
 * }} ChapterUrlClassification
 */

/** @returns {ChapterUrlClassification} */
export function classifyChapterUrl(chapterUrl) {
  let url;

  try {
    url = new URL(chapterUrl);
  } catch {
    return { valid: false, reason: "invalid_url" };
  }

  if (url.protocol !== "https:") {
    return {
      valid: false,
      reason: "unsupported_protocol",
      hostname: url.hostname || "unknown",
    };
  }

  if (url.hostname !== SUPPORTED_CHAPTER_HOSTNAME) {
    return {
      valid: false,
      reason: "unsupported_provider",
      hostname: url.hostname,
    };
  }

  return { valid: true };
}
