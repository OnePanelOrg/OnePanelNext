import { waitUntil } from "@vercel/functions";
import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { sendChapterNotificationForAuthorization } from "../../../../lib/authenticated-chapter-notification.mjs";
import { createUrlChapterNotification } from "../../../../lib/chapter-notification.mjs";
import { segmentationModeSchema } from "../../../../lib/segmentation-modes.mjs";

export const maxDuration = 60;

const requestSchema = z.object({
  chapter_url: z.string().url(),
  segmentation_mode: segmentationModeSchema,
});

function firstHeaderValue(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue?.split(",", 1)[0]?.trim();
}

function getPublicOrigin(req: NextApiRequest) {
  const protocol =
    firstHeaderValue(req.headers["x-forwarded-proto"]) ?? "https";
  const host = firstHeaderValue(
    req.headers["x-forwarded-host"] ?? req.headers.host,
  );
  if (!host || (protocol !== "http" && protocol !== "https")) return null;

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return null;
  }
}

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
    if (response.ok) {
      let responseData: unknown;
      try {
        responseData = JSON.parse(responseBody.toString("utf8"));
      } catch {
        responseData = null;
      }
      const publicOrigin = getPublicOrigin(req);
      const notification = publicOrigin
        ? createUrlChapterNotification(responseData, {
            mode: body.data.segmentation_mode,
            sourceUrl: body.data.chapter_url,
            readerOrigin: publicOrigin,
          })
        : null;
      if (notification) {
        waitUntil(
          sendChapterNotificationForAuthorization(
            notification,
            req.headers.authorization,
          ),
        );
      }
    }
    if (contentType) res.setHeader("Content-Type", contentType);
    res.status(response.status).send(responseBody);
  } catch {
    res.status(502).json({ detail: "Could not reach the chapter API." });
  }
}
