import assert from "node:assert/strict";
import test from "node:test";
import {
  formatChapterNotification,
  sendChapterNotification,
} from "../src/lib/telegram-notification.mjs";

test("formats URL submissions with their source and reader URLs", () => {
  assert.equal(
    formatChapterNotification({
      kind: "url",
      mode: "standard",
      userEmail: "reader@example.com",
      sourceUrl: "https://example.com/chapter/12",
      chapterUrl: "https://www.onepanel.app/chapter/chapter-hash",
    }),
    "OnePanel chapter URL submitted.\nMode: standard\nEmail: reader@example.com\nURL: https://example.com/chapter/12\nReader: https://www.onepanel.app/chapter/chapter-hash",
  );
});

test("formats successful uploads with filenames and the returned reader URL", () => {
  assert.equal(
    formatChapterNotification({
      kind: "upload",
      mode: "standard",
      userEmail: "reader@example.com",
      fileCount: 1,
      fileNames: ["one-piece-chapter-1123.cbz"],
      chapterUrl: "https://www.onepanel.app/chapter/uploaded-chapter-hash",
    }),
    "OnePanel chapter uploaded successfully.\nMode: standard\nEmail: reader@example.com\nFiles: 1\nFile: one-piece-chapter-1123.cbz\nReader: https://www.onepanel.app/chapter/uploaded-chapter-hash",
  );
});

test("limits the filenames shown in upload notifications", () => {
  const fileNames = Array.from(
    { length: 12 },
    (_, index) => `page-${index + 1}.png`,
  );

  assert.match(
    formatChapterNotification({
      kind: "upload",
      mode: "standard",
      fileCount: fileNames.length,
      fileNames,
    }),
    /File names: page-1\.png, page-2\.png, page-3\.png, page-4\.png, page-5\.png, page-6\.png, page-7\.png, page-8\.png, page-9\.png, page-10\.png\n…and 2 more/,
  );
});

test("logs Telegram API rejections without exposing credentials", async () => {
  const errors = [];
  const sent = await sendChapterNotification(
    {
      kind: "url",
      mode: "standard",
      sourceUrl: "https://example.com/chapter/12",
      chapterUrl: "https://www.onepanel.app/chapter/chapter-hash",
    },
    {
      token: "secret-bot-token",
      chatId: "secret-chat-id",
      fetch: async () =>
        new Response(
          JSON.stringify({
            ok: false,
            error_code: 400,
            description: "Bad Request: chat not found",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        ),
      logger: { error: (...args) => errors.push(args) },
    },
  );

  assert.equal(sent, false);
  assert.deepEqual(errors, [
    [
      "Telegram chapter notification failed.",
      { status: 400, description: "Bad Request: chat not found" },
    ],
  ]);
  assert.doesNotMatch(
    JSON.stringify(errors),
    /secret-bot-token|secret-chat-id/,
  );
});

test("logs a sanitized receipt for successful Telegram deliveries", async () => {
  const messages = [];
  const sent = await sendChapterNotification(
    {
      kind: "upload",
      mode: "standard",
      fileCount: 3,
    },
    {
      token: "secret-bot-token",
      chatId: "-1001234567890",
      fetch: async () =>
        new Response(
          JSON.stringify({
            ok: true,
            result: {
              message_id: 42,
              chat: { id: -1001234567890, type: "supergroup" },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      logger: { info: (...args) => messages.push(args), error: () => {} },
    },
  );

  assert.equal(sent, true);
  assert.deepEqual(messages, [
    [
      "Telegram chapter notification delivered.",
      {
        status: 200,
        messageId: 42,
        chatType: "supergroup",
        chatIdSuffix: "7890",
      },
    ],
  ]);
  assert.doesNotMatch(
    JSON.stringify(messages),
    /secret-bot-token|1001234567890/,
  );
});
