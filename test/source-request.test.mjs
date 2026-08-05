import assert from "node:assert/strict";
import test from "node:test";
import {
  createSourceRequestMailto,
  SOURCE_REQUEST_EMAIL,
} from "../src/lib/source-request.mjs";

test("creates a pre-addressed source request from a valid URL", () => {
  const mailto = createSourceRequestMailto("example.com/manga/chapter-1");

  assert.ok(mailto?.startsWith(`mailto:${SOURCE_REQUEST_EMAIL}?`));
  assert.match(mailto, /OnePanel%20source%20request/);
  assert.match(mailto, /https%3A%2F%2Fexample.com%2Fmanga%2Fchapter-1/);
});

test("rejects invalid and unsafe source request URLs", () => {
  assert.equal(createSourceRequestMailto("not a url"), null);
  assert.equal(createSourceRequestMailto("javascript:alert(1)"), null);
});
