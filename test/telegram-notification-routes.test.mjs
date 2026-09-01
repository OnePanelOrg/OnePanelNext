import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routePaths = [
  "src/pages/api/onepanel/v2/chapter.ts",
  "src/pages/api/chapter-upload-notification.ts",
];

test("chapter routes register Telegram work before completing the response", async () => {
  for (const routePath of routePaths) {
    const source = await readFile(routePath, "utf8");
    const scheduledAt = source.indexOf("waitUntil(");
    const responseCompletedAt = Math.max(
      source.indexOf("res.status(response.status).send(responseBody)"),
      source.indexOf("res.status(204).end()"),
    );

    assert.match(source, /from "@vercel\/functions"/);
    assert.ok(scheduledAt >= 0, `${routePath} must schedule background work`);
    assert.ok(
      scheduledAt < responseCompletedAt,
      `${routePath} must schedule background work before completing its response`,
    );
    assert.doesNotMatch(source, /await sendChapterNotification/);
  }
});

test("chapter proxy allows enough time for synchronous extraction", async () => {
  const source = await readFile(
    "src/pages/api/onepanel/v2/chapter.ts",
    "utf8",
  );

  assert.match(source, /export const maxDuration = 60;/);
});
