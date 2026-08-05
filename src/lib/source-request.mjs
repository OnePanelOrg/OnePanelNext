import { normalizeChapterUrl } from "./chapter-url.mjs";

export const SOURCE_REQUEST_EMAIL = "support@onepanel.app";

export function createSourceRequestMailto(value) {
  const normalizedUrl = normalizeChapterUrl(value);
  if (!normalizedUrl) return null;

  const subject = "OnePanel source request";
  const body = [
    "I'd like OnePanel Reader to support chapters from:",
    normalizedUrl,
    "",
    "Anything else you should know:",
  ].join("\n");

  return `mailto:${SOURCE_REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
