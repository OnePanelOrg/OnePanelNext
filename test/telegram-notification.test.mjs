import assert from "node:assert/strict";
import test from "node:test";
import {
  formatChapterNotification,
  sendChapterNotification,
} from "../src/lib/telegram-notification.mjs";

test("formats URL submissions with their mode and URL", () => {
  assert.equal(
    formatChapterNotification({
      kind: "url",
      mode: "standard",
      chapterUrl: "https://example.com/chapter/12",
    }),
    "OnePanel chapter URL submitted.\nMode: standard\nURL: https://example.com/chapter/12",
  );
});

test("formats uploads without exposing filenames", () => {
  assert.equal(
    formatChapterNotification({
      kind: "upload",
      mode: "standard",
      fileCount: 3,
    }),
    "OnePanel chapter uploaded.\nMode: standard\nFiles: 3",
  );
});

test("logs Telegram API rejections without exposing credentials", async () => {
  const errors = [];
  const sent = await sendChapterNotification(
    {
      kind: "url",
      mode: "standard",
      chapterUrl: "https://example.com/chapter/12",
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
  assert.doesNotMatch(JSON.stringify(errors), /secret-bot-token|secret-chat-id/);
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
      { status: 200, messageId: 42, chatType: "supergroup", chatIdSuffix: "7890" },
    ],
  ]);
  assert.doesNotMatch(JSON.stringify(messages), /secret-bot-token|1001234567890/);
});
