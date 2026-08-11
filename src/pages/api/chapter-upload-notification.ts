import { verifyToken } from "@clerk/nextjs/server";
import { waitUntil } from "@vercel/functions";
import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { sendChapterNotification } from "../../lib/telegram-notification.mjs";
import { segmentationModeSchema } from "../../lib/segmentation-modes.mjs";

const requestSchema = z.object({
  fileCount: z.number().int().positive().max(1_000),
  mode: segmentationModeSchema,
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
    }),
  );
  res.status(204).end();
}
