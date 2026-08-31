import { createClerkClient, verifyToken } from "@clerk/backend";
import { sendChapterNotification } from "./telegram-notification.mjs";

function bearerToken(authorization) {
  if (typeof authorization !== "string") return null;
  return authorization.match(/^Bearer (.+)$/)?.[1] ?? null;
}

async function verifiedUserId(authorization) {
  const token = bearerToken(authorization);
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!token || !secretKey) return null;

  try {
    const payload = await verifyToken(token, { secretKey });
    return payload.sub;
  } catch {
    return null;
  }
}

export async function getUserEmail(userId, options = {}) {
  if (!userId) return null;

  const getClerkClient =
    options.getClerkClient ??
    (() => createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }));
  const logger = options.logger ?? console;
  try {
    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress;
    return typeof email === "string" && email.length > 0 ? email : null;
  } catch {
    logger.error("Could not retrieve the chapter submitter's email.", {
      userIdSuffix: userId.slice(-4),
    });
    return null;
  }
}

export async function sendChapterNotificationForUser(
  event,
  userId,
  options = {},
) {
  const userEmail = await getUserEmail(userId, options);
  return sendChapterNotification(
    userEmail ? { ...event, userEmail } : event,
    options,
  );
}

export async function sendChapterNotificationForAuthorization(
  event,
  authorization,
  options = {},
) {
  const userId = await verifiedUserId(authorization);
  return sendChapterNotificationForUser(event, userId, options);
}
