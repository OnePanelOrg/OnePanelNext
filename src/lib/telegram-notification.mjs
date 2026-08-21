const TELEGRAM_API_ORIGIN = "https://api.telegram.org";
const TELEGRAM_TIMEOUT_MS = 5_000;
const MAX_FILENAMES_IN_NOTIFICATION = 10;
const MAX_FILENAME_LENGTH = 120;

function describeUploadedFiles(fileNames = []) {
  const visibleNames = fileNames
    .slice(0, MAX_FILENAMES_IN_NOTIFICATION)
    .map((fileName) =>
      fileName.length > MAX_FILENAME_LENGTH
        ? `${fileName.slice(0, MAX_FILENAME_LENGTH - 1)}…`
        : fileName,
    );
  if (visibleNames.length === 0) return [];

  const remaining = fileNames.length - visibleNames.length;
  return [
    `File${fileNames.length === 1 ? "" : " names"}: ${visibleNames.join(", ")}`,
    ...(remaining > 0 ? [`…and ${remaining} more`] : []),
  ];
}

export function formatChapterNotification(event) {
  if (event.kind === "url") {
    return [
      "OnePanel chapter URL submitted.",
      `Mode: ${event.mode}`,
      `URL: ${event.sourceUrl}`,
      ...(event.chapterUrl ? [`Reader: ${event.chapterUrl}`] : []),
    ].join("\n");
  }

  return [
    "OnePanel chapter uploaded successfully.",
    `Mode: ${event.mode}`,
    `Files: ${event.fileCount}`,
    ...describeUploadedFiles(event.fileNames),
    ...(event.chapterUrl ? [`Reader: ${event.chapterUrl}`] : []),
  ].join("\n");
}

export async function sendChapterNotification(event, options = {}) {
  const token = options.token ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId ?? process.env.TELEGRAM_CHAT_ID;
  const logger = options.logger ?? console;
  const fetchRequest = options.fetch ?? fetch;
  if (!token || !chatId) {
    logger.error("Telegram chapter notification is not configured.", {
      missingToken: !token,
      missingChatId: !chatId,
    });
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  try {
    const response = await fetchRequest(
      `${TELEGRAM_API_ORIGIN}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          chat_id: chatId,
          text: formatChapterNotification(event),
          link_preview_options: JSON.stringify({ is_disabled: true }),
        }),
        signal: controller.signal,
      },
    );
    let body;
    try {
      body = await response.json();
    } catch {
      // Telegram normally returns JSON, but delivery still follows HTTP status.
    }
    if (response.ok) {
      logger.info?.("Telegram chapter notification delivered.", {
        status: response.status,
        messageId:
          typeof body?.result?.message_id === "number"
            ? body.result.message_id
            : null,
        chatType:
          typeof body?.result?.chat?.type === "string"
            ? body.result.chat.type
            : "unknown",
        chatIdSuffix: String(chatId).slice(-4),
      });
      return true;
    }

    const description =
      typeof body?.description === "string"
        ? body.description.slice(0, 500)
        : "Telegram API returned an error.";
    logger.error("Telegram chapter notification failed.", {
      status: response.status,
      description,
    });
    return false;
  } catch (error) {
    logger.error("Telegram chapter notification request failed.", {
      reason:
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : "network_error",
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
