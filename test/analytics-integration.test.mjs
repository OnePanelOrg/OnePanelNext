import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(
  new URL("../src/pages/_app.tsx", import.meta.url),
  "utf8",
);
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

test("Vercel Analytics is installed and mounted for every page", () => {
  assert.ok(
    packageJson.dependencies["@vercel/analytics"],
    "@vercel/analytics must remain a production dependency",
  );
  assert.match(
    appSource,
    /import\s*{\s*Analytics\s*}\s*from\s*["']@vercel\/analytics\/react["']/,
  );
  assert.match(appSource, /<Analytics\s*\/>/);
});
