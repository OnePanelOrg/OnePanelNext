import assert from "node:assert/strict";
import test from "node:test";
import { formatChapterNotification } from "../src/lib/telegram-notification.mjs";

test("formats URL submissions with their mode and URL", () => {
  assert.equal(
    formatChapterNotification({
      kind: "url",
      mode: "standard",
      chapterUrl: "https://example.com/chapter/12",
    }),
    "OnePanel chapter URL submitted.\nMode: standard\nURL: https://example.com/chapter/12",
  );
});

test("formats uploads without exposing filenames", () => {
  assert.equal(
    formatChapterNotification({
      kind: "upload",
      mode: "standard",
      fileCount: 3,
    }),
    "OnePanel chapter uploaded.\nMode: standard\nFiles: 3",
  );
});
