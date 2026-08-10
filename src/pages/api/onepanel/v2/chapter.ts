import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { sendChapterNotification } from "../../../../lib/telegram-notification.mjs";
import { segmentationModeSchema } from "../../../../lib/segmentation-modes.mjs";

const requestSchema = z.object({
  chapter_url: z.string().url(),
  segmentation_mode: segmentationModeSchema,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ detail: "Method not allowed." });
    return;
  }

  const body = requestSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ detail: "Invalid chapter request." });
    return;
  }

  const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiOrigin) {
    res.status(500).json({ detail: "The chapter API is not configured." });
    return;
  }

  try {
    const response = await fetch(`${apiOrigin}/v2/chapter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(typeof req.headers.authorization === "string"
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      body: JSON.stringify(body.data),
    });
    const responseBody = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.status(response.status).send(responseBody);

    if (response.ok) {
      await sendChapterNotification({
        kind: "url",
        mode: body.data.segmentation_mode,
        chapterUrl: body.data.chapter_url,
      });
    }
  } catch {
    res.status(502).json({ detail: "Could not reach the chapter API." });
  }
}
