import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { ApiError, createChapter, getChapter } from "../src/lib/api.ts";

globalThis.window = globalThis;

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

test("anonymous Standard chapter creation sends a validated mode without Authorization", async () => {
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init.headers).has("Authorization"), false);
    assert.deepEqual(JSON.parse(init.body), {
      chapter_url: "https://example.test/chapter/1",
      segmentation_mode: "standard",
    });
    return jsonResponse({ chapter_hash: "chapter-hash" });
  };

  assert.equal(
    await createChapter("https://example.test/chapter/1"),
    "chapter-hash",
  );
});

test("chapter retrieval includes Authorization only when a token is available", async () => {
  const seenAuthorization = [];
  globalThis.fetch = async (_url, init) => {
    seenAuthorization.push(new Headers(init.headers).get("Authorization"));
    return jsonResponse({
      pages: [{ image: "page.jpg", panels: [{ path: "panel.jpg" }] }],
    });
  };

  await getChapter("public");
  await getChapter("account-only", "chapter-token");
  assert.deepEqual(seenAuthorization, [null, "Bearer chapter-token"]);
});

test("machine-readable access failures become stable access states", async () => {
  globalThis.fetch = async () =>
    jsonResponse(
      {
        detail: {
          code: "sign_in_required",
          message: "Authentication is required.",
        },
      },
      { status: 401 },
    );

  await assert.rejects(getChapter("private"), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 401);
    assert.equal(error.code, "sign_in_required");
    assert.equal(error.accessState, "sign-in-required");
    assert.equal(error.message, "Authentication is required.");
    return true;
  });
});

test("billing calls remain token-required at the type boundary", async () => {
  globalThis.fetch = async (_url, init) => {
    assert.equal(
      new Headers(init.headers).get("Authorization"),
      "Bearer billing-token",
    );
    return jsonResponse({ active: false, status: null });
  };

  const { getSubscription } = await import("../src/lib/api.ts");
  await getSubscription("billing-token");
});
