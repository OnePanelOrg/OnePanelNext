import test from "node:test";
import assert from "node:assert/strict";
import { classifyChapterUrl } from "../src/lib/chapter-url.mjs";

test("accepts HTTPS OP Chapters URLs", () => {
  assert.deepEqual(
    classifyChapterUrl("https://opchapters.com/chapters/123"),
    { valid: true },
  );
});

test("identifies an unsupported provider without retaining the full URL", () => {
  assert.deepEqual(
    classifyChapterUrl(
      "https://tcbonepiecechapters.com/chapters/7996/one-piece-chapter-1189?reader=me",
    ),
    {
      valid: false,
      reason: "unsupported_provider",
      hostname: "tcbonepiecechapters.com",
    },
  );
});

test("identifies non-HTTPS URLs", () => {
  assert.deepEqual(
    classifyChapterUrl("http://opchapters.com/chapters/123"),
    {
      valid: false,
      reason: "unsupported_protocol",
      hostname: "opchapters.com",
    },
  );
});

test("identifies malformed URLs without retaining the input", () => {
  assert.deepEqual(classifyChapterUrl("not a chapter URL"), {
    valid: false,
    reason: "invalid_url",
  });
});
