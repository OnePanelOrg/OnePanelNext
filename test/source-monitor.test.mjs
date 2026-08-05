import assert from "node:assert/strict";
import test from "node:test";
import {
  detectImageType,
  parseSourceUrls,
  validateChapter,
} from "../scripts/source-monitor.mjs";

test("parses a non-empty JSON list of HTTP sources", () => {
  assert.deepEqual(parseSourceUrls('["https://example.com/chapter"]'), [
    "https://example.com/chapter",
  ]);
  assert.throws(() => parseSourceUrls("[]"), /at least one/);
  assert.throws(() => parseSourceUrls('["file:///tmp/page"]'), /HTTP or HTTPS/);
});

test("recognizes the image formats supported by the monitor", () => {
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff])), "image/jpeg");
  assert.equal(
    detectImageType(Buffer.from("89504e470d0a1a0a", "hex")),
    "image/png",
  );
  assert.equal(detectImageType(Buffer.from("GIF89a")), "image/gif");
  assert.equal(
    detectImageType(Buffer.from("524946460000000057454250", "hex")),
    "image/webp",
  );
  assert.equal(
    detectImageType(Buffer.from("000000006674797061766966", "hex")),
    "image/avif",
  );
  assert.equal(detectImageType(Buffer.from("not an image")), null);
});

test("validates page images and panel paths", () => {
  assert.deepEqual(
    validateChapter({
      pages: [
        { image: "https://example.com/1.jpg", panels: [{ path: "M0 0" }] },
      ],
    }),
    ["https://example.com/1.jpg"],
  );
  assert.throws(() => validateChapter({ pages: [] }), /no pages/);
  assert.throws(
    () => validateChapter({ pages: [{ image: "x", panels: [] }] }),
    /invalid panels/,
  );
});
