import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("subscription-status failures do not render as composer errors", async () => {
  const source = await readFile(
    new URL("../src/components/ChapterLauncher.tsx", import.meta.url),
    "utf8",
  );
  const subscriptionLoader = source.slice(
    source.indexOf("const loadSubscription"),
    source.indexOf("useEffect(() =>", source.indexOf("const loadSubscription")),
  );

  assert.ok(subscriptionLoader.includes("setSubscription(null)"));
  assert.doesNotMatch(subscriptionLoader, /\bsetError\(/);
});
