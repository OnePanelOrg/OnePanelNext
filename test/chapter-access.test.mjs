import assert from "node:assert/strict";
import test from "node:test";
import {
  isChapterSignInRequired,
  SIGN_IN_REQUIRED_CODE,
} from "../src/lib/chapter-access.mjs";

test("signed-out readers are prompted for stable account-gated responses", () => {
  assert.equal(
    isChapterSignInRequired(
      { code: SIGN_IN_REQUIRED_CODE, status: 403 },
      false,
    ),
    true,
  );
});

test("legacy unauthorized responses retain the focused sign-in flow", () => {
  assert.equal(isChapterSignInRequired({ status: 401 }, false), true);
});

test("signed-in and unrelated failures remain ordinary visible errors", () => {
  assert.equal(
    isChapterSignInRequired({ code: SIGN_IN_REQUIRED_CODE, status: 401 }, true),
    false,
  );
  assert.equal(isChapterSignInRequired({ status: 500 }, false), false);
  assert.equal(
    isChapterSignInRequired(
      { code: "subscription_required", status: 403 },
      false,
    ),
    false,
  );
});
