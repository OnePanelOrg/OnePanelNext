const TELEGRAM_API_ORIGIN = "https://api.telegram.org";
const TELEGRAM_TIMEOUT_MS = 5_000;

export function formatChapterNotification(event) {
  if (event.kind === "url") {
    return [
      "OnePanel chapter URL submitted.",
      `Mode: ${event.mode}`,
      `URL: ${event.chapterUrl}`,
    ].join("\n");
  }

  return [
    "OnePanel chapter uploaded.",
    `Mode: ${event.mode}`,
    `Files: ${event.fileCount}`,
  ].join("\n");
}

export async function sendChapterNotification(event, options = {}) {
  const token = options.token ?? process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  try {
    const response = await fetch(
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
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
