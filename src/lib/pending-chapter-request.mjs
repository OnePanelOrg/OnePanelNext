export const PENDING_CHAPTER_REQUEST_KEY =
  "onepanel.pending-chapter-request.v1";

const VERSION = 1;
const CONTINUATIONS = new Set(["authenticate", "checkout", "restore"]);

export function parsePendingChapterRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const keys = Object.keys(value);
  if (
    keys.length !== 4 ||
    !keys.every((key) =>
      ["version", "url", "mode", "continuation"].includes(key),
    )
  ) {
    return null;
  }

  if (
    value.version !== VERSION ||
    typeof value.url !== "string" ||
    value.url.length === 0 ||
    value.url.length > 4096 ||
    !segmentationModeSchema.safeParse(value.mode).success ||
    !CONTINUATIONS.has(value.continuation)
  ) {
    return null;
  }

  try {
    const url = new URL(value.url);
    if (!["http:", "https:"].includes(url.protocol) || url.username)
      return null;
  } catch {
    return null;
  }

  return {
    version: VERSION,
    url: value.url,
    mode: value.mode,
    continuation: value.continuation,
  };
}

export function readPendingChapterRequest(storage) {
  if (!storage) return null;

  try {
    const raw = storage.getItem(PENDING_CHAPTER_REQUEST_KEY);
    if (!raw) return null;
    const parsed = parsePendingChapterRequest(JSON.parse(raw));
    if (!parsed) storage.removeItem(PENDING_CHAPTER_REQUEST_KEY);
    return parsed;
  } catch {
    try {
      storage.removeItem(PENDING_CHAPTER_REQUEST_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browsing contexts.
    }
    return null;
  }
}

export function writePendingChapterRequest(storage, request) {
  const parsed = parsePendingChapterRequest({
    version: VERSION,
    ...request,
  });
  if (!storage || !parsed) return false;

  try {
    storage.setItem(PENDING_CHAPTER_REQUEST_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

export function clearPendingChapterRequest(storage) {
  try {
    storage?.removeItem(PENDING_CHAPTER_REQUEST_KEY);
  } catch {
    // The UI still works if session storage is unavailable.
  }
}
import { segmentationModeSchema } from "./segmentation-modes.mjs";
