import { verifyToken } from "@clerk/nextjs/server";
import { waitUntil } from "@vercel/functions";
import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { sendChapterNotification } from "../../lib/telegram-notification.mjs";
import { segmentationModeSchema } from "../../lib/segmentation-modes.mjs";

const requestSchema = z.object({
  fileCount: z.number().int().positive().max(1_000),
  fileNames: z.array(z.string().min(1).max(1_024)).min(1).max(1_000),
  chapterUrl: z.string().url().max(2_048),
  mode: segmentationModeSchema,
}).refine((data) => data.fileNames.length === data.fileCount, {
  message: "The file count must match the supplied file names.",
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

  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!token || !secretKey) {
    res.status(401).json({ detail: "Authentication required." });
    return;
  }

  try {
    await verifyToken(token, { secretKey });
  } catch {
    res.status(401).json({ detail: "Authentication required." });
    return;
  }

  const body = requestSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ detail: "Invalid upload notification." });
    return;
  }

  waitUntil(
    sendChapterNotification({
      kind: "upload",
      mode: body.data.mode,
      fileCount: body.data.fileCount,
      fileNames: body.data.fileNames,
      chapterUrl: body.data.chapterUrl,
    }),
  );
  res.status(204).end();
}
