import assert from "node:assert/strict";
import test from "node:test";
import {
  PENDING_CHAPTER_REQUEST_KEY,
  parsePendingChapterRequest,
  readPendingChapterRequest,
  writePendingChapterRequest,
} from "../src/lib/pending-chapter-request.mjs";

function storage(initial) {
  const values = new Map(
    initial ? [[PENDING_CHAPTER_REQUEST_KEY, initial]] : [],
  );
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const valid = {
  version: 1,
  url: "https://opchapters.com/chapter/1",
  mode: "gpt-5.6-layout",
  continuation: "checkout",
};

test("validates the versioned minimal pending request", () => {
  assert.deepEqual(parsePendingChapterRequest(valid), valid);
  assert.equal(parsePendingChapterRequest({ ...valid, token: "secret" }), null);
  assert.equal(parsePendingChapterRequest({ ...valid, version: 2 }), null);
  assert.equal(
    parsePendingChapterRequest({ ...valid, mode: "provider-model" }),
    null,
  );
  assert.equal(
    parsePendingChapterRequest({ ...valid, url: "javascript:alert(1)" }),
    null,
  );
});

test("invalid JSON is discarded from session storage", () => {
  const target = storage("{");
  assert.equal(readPendingChapterRequest(target), null);
  assert.equal(target.getItem(PENDING_CHAPTER_REQUEST_KEY), null);
});

test("writes and reads only a valid request", () => {
  const target = storage();
  assert.equal(
    writePendingChapterRequest(target, {
      url: valid.url,
      mode: valid.mode,
      continuation: "authenticate",
    }),
    true,
  );
  assert.deepEqual(readPendingChapterRequest(target), {
    ...valid,
    continuation: "authenticate",
  });
});
