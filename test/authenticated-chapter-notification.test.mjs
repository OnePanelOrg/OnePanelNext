import assert from "node:assert/strict";
import test from "node:test";
import { getUserEmail } from "../src/lib/authenticated-chapter-notification.mjs";

test("gets the authenticated user's primary email from Clerk", async () => {
  const requestedUserIds = [];

  const email = await getUserEmail("user_1234", {
    getClerkClient: async () => ({
      users: {
        getUser: async (userId) => {
          requestedUserIds.push(userId);
          return {
            primaryEmailAddress: { emailAddress: "reader@example.com" },
          };
        },
      },
    }),
  });

  assert.equal(email, "reader@example.com");
  assert.deepEqual(requestedUserIds, ["user_1234"]);
});

test("continues without an email when Clerk cannot load the user", async () => {
  const errors = [];

  const email = await getUserEmail("user_1234", {
    getClerkClient: async () => ({
      users: {
        getUser: async () => {
          throw new Error("Clerk unavailable");
        },
      },
    }),
    logger: { error: (...args) => errors.push(args) },
  });

  assert.equal(email, null);
  assert.deepEqual(errors, [
    [
      "Could not retrieve the chapter submitter's email.",
      { userIdSuffix: "1234" },
    ],
  ]);
});
