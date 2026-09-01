import assert from "node:assert/strict";
import test from "node:test";
import { createUrlChapterNotification } from "../src/lib/chapter-notification.mjs";

test("creates a URL submission notification with its reader link", () => {
  assert.deepEqual(
    createUrlChapterNotification(
      { chapter_hash: "chapter/hash" },
      {
        mode: "standard",
        sourceUrl: "https://example.com/chapter/12",
        readerOrigin: "https://www.onepanel.app",
      },
    ),
    {
      kind: "url",
      mode: "standard",
      sourceUrl: "https://example.com/chapter/12",
      chapterUrl: "https://www.onepanel.app/chapter/chapter%2Fhash",
    },
  );
});

test("does not create a notification from an invalid chapter response", () => {
  assert.equal(
    createUrlChapterNotification(
      { chapter_hash: "" },
      {
        mode: "standard",
        sourceUrl: "https://example.com/chapter/12",
        readerOrigin: "https://www.onepanel.app",
      },
    ),
    null,
  );
});
