import { z } from "zod";

const chapterCreatedSchema = z.object({
  chapter_hash: z.string().min(1),
});

export function createUrlChapterNotification(
  responseBody,
  { mode, sourceUrl, readerOrigin },
) {
  const chapter = chapterCreatedSchema.safeParse(responseBody);
  if (!chapter.success) return null;

  try {
    return {
      kind: "url",
      mode,
      sourceUrl,
      chapterUrl: new URL(
        `/chapter/${encodeURIComponent(chapter.data.chapter_hash)}`,
        readerOrigin,
      ).href,
    };
  } catch {
    return null;
  }
}
