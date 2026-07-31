import assert from "node:assert/strict";
import test from "node:test";
import {
  describeChapterFiles,
  validateChapterFiles,
} from "../src/lib/upload-selection.mjs";

const named = (name) => ({ name });

test("accepts one comic container or PDF", () => {
  for (const extension of ["cbz", "cbr", "zip", "rar", "pdf"]) {
    assert.deepEqual(validateChapterFiles([named(`chapter.${extension}`)]), {
      valid: true,
    });
  }
});

test("accepts multiple page images", () => {
  assert.deepEqual(
    validateChapterFiles([named("1.jpg"), named("2.PNG"), named("3.webp")]),
    { valid: true },
  );
  assert.equal(
    describeChapterFiles([named("1.jpg"), named("2.png")]),
    "2 page images",
  );
});

test("rejects mixed containers and files", () => {
  assert.deepEqual(
    validateChapterFiles([named("chapter.cbz"), named("cover.png")]),
    {
      valid: false,
      message: "Choose one CBZ, CBR, ZIP, RAR, or PDF—or select page images.",
    },
  );
});

test("rejects unsupported files", () => {
  assert.deepEqual(validateChapterFiles([named("chapter.epub")]), {
    valid: false,
    message: "chapter.epub is not a supported comic or image format.",
  });
});
