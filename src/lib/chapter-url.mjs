const MARKDOWN_LINK_PATTERN = /^\[[^\]]*\]\(\s*(\S+?)\s*\)$/;

/**
 * Normalize the common forms in which readers paste chapter links.
 *
 * Source support belongs to the API: the frontend only verifies that the input
 * is a safe HTTP(S) URL and sends the normalized URL through unchanged.
 */
export function normalizeChapterUrl(value) {
  if (typeof value !== "string") return null;

  let candidate = value.trim();
  const markdownLink = candidate.match(MARKDOWN_LINK_PATTERN);
  if (markdownLink) candidate = markdownLink[1];

  if (candidate.startsWith("<") && candidate.endsWith(">")) {
    candidate = candidate.slice(1, -1).trim();
  }

  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  } else if (!/^[a-z][a-z\d+.-]*:/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}
