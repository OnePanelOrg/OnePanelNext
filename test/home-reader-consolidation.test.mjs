import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeSource = await readFile(
  new URL("../src/pages/index.tsx", import.meta.url),
  "utf8",
);
const readerSource = await readFile(
  new URL("../src/pages/reader.tsx", import.meta.url),
  "utf8",
);

test("the complete chapter launcher is mounted on the homepage", () => {
  assert.match(homeSource, /<ChapterLauncher\s*\/>/);
  assert.doesNotMatch(homeSource, /router\.replace\(["']\/reader["']\)/);
});

test("the legacy reader route redirects temporarily to the homepage", () => {
  assert.match(readerSource, /destination:\s*["']\/["']/);
  assert.match(readerSource, /permanent:\s*false/);
});
