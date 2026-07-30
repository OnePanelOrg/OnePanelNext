import assert from "node:assert/strict";
import test from "node:test";
import { normalizeChapterUrl } from "../src/lib/chapter-url.mjs";

test("accepts HTTP and HTTPS chapter URLs from any source", () => {
  assert.equal(
    normalizeChapterUrl("https://opchapters.com/chapter/1121?lang=en#page-3"),
    "https://opchapters.com/chapter/1121?lang=en#page-3",
  );
  assert.equal(
    normalizeChapterUrl("http://reader.example/chapter/12"),
    "http://reader.example/chapter/12",
  );
});

test("adds HTTPS to bare domains and protocol-relative links", () => {
  assert.equal(
    normalizeChapterUrl("www.reader.example/title/chapter-12"),
    "https://www.reader.example/title/chapter-12",
  );
  assert.equal(
    normalizeChapterUrl("//m.reader.example/chapter/12"),
    "https://m.reader.example/chapter/12",
  );
});

test("unwraps common copied-link formats", () => {
  assert.equal(
    normalizeChapterUrl("  <https://reader.example/chapter/12>  "),
    "https://reader.example/chapter/12",
  );
  assert.equal(
    normalizeChapterUrl("[Chapter 12](https://reader.example/chapter/12)"),
    "https://reader.example/chapter/12",
  );
});

test("preserves encoded, Unicode, query, and fragment URL information", () => {
  assert.equal(
    normalizeChapterUrl(
      "https://例え.テスト/作品/chapter%2012?quality=high#page=3",
    ),
    "https://xn--r8jz45g.xn--zckzah/%E4%BD%9C%E5%93%81/chapter%2012?quality=high#page=3",
  );
});

test("rejects malformed links, non-web schemes, and credentials", () => {
  assert.equal(normalizeChapterUrl(""), null);
  assert.equal(normalizeChapterUrl("not a url"), null);
  assert.equal(normalizeChapterUrl("javascript:alert(1)"), null);
  assert.equal(normalizeChapterUrl("ftp://reader.example/chapter/12"), null);
  assert.equal(
    normalizeChapterUrl("https://user:secret@reader.example/chapter/12"),
    null,
  );
});
