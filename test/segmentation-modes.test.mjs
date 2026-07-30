import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SEGMENTATION_MODE,
  SEGMENTATION_MODES,
  findSegmentationMode,
  parseSegmentationMode,
} from "../src/lib/segmentation-modes.mjs";

test("the mode catalog has a free default and a crowned Pro mode", () => {
  assert.equal(DEFAULT_SEGMENTATION_MODE, "standard");
  assert.deepEqual(
    SEGMENTATION_MODES.map(({ id, tier, showsCrown }) => ({
      id,
      tier,
      showsCrown,
    })),
    [
      { id: "standard", tier: "free", showsCrown: false },
      { id: "gpt-5.6-layout", tier: "pro", showsCrown: true },
    ],
  );
});

test("mode parsing rejects identifiers outside the public catalog", () => {
  assert.equal(parseSegmentationMode("standard"), "standard");
  assert.equal(findSegmentationMode("gpt-5.6-layout")?.tier, "pro");
  assert.equal(findSegmentationMode("provider-model-name"), undefined);
  assert.throws(() => parseSegmentationMode("provider-model-name"));
});
