import test from "node:test";
import assert from "node:assert/strict";
import {
  getNextPosition,
  getPreviousPosition,
} from "../src/lib/reader-state.mjs";

const panelCounts = [2, 3];

test("does not move before the first panel", () => {
  assert.deepEqual(getPreviousPosition(0, 0, panelCounts), {
    pageIndex: 0,
    panelIndex: 0,
  });
});

test("moves to the last panel of the previous page", () => {
  assert.deepEqual(getPreviousPosition(1, 0, panelCounts), {
    pageIndex: 0,
    panelIndex: 1,
  });
});

test("moves to the first panel of the next page", () => {
  assert.deepEqual(getNextPosition(0, 1, panelCounts), {
    pageIndex: 1,
    panelIndex: 0,
  });
});

test("does not move beyond the final panel", () => {
  assert.deepEqual(getNextPosition(1, 2, panelCounts), {
    pageIndex: 1,
    panelIndex: 2,
  });
});
