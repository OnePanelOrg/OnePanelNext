import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  ApiError,
  createChapter,
  createUploadedChapter,
  getChapter,
} from "../src/lib/api.ts";

globalThis.window = globalThis;

const originalFetch = globalThis.fetch;
const originalXMLHttpRequest = globalThis.XMLHttpRequest;

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.XMLHttpRequest = originalXMLHttpRequest;
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

class FakeXMLHttpRequest {
  static latest;

  upload = {};
  response = null;
  status = 0;
  statusText = "";
  headers = new Map();

  constructor() {
    FakeXMLHttpRequest.latest = this;
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name, value) {
    this.headers.set(name, value);
  }

  send(body) {
    this.body = body;
  }

  abort() {
    this.onabort?.();
  }
}

test("upload errors preserve structured access details", async () => {
  globalThis.XMLHttpRequest = FakeXMLHttpRequest;
  const pending = createUploadedChapter(
    [new File(["page"], "page.png")],
    "standard",
    null,
    () => {},
  );
  const request = FakeXMLHttpRequest.latest;
  request.status = 401;
  request.statusText = "Unauthorized";
  request.response = {
    detail: {
      code: "sign_in_required",
      message: "Sign in before uploading.",
    },
  };
  request.onload();

  await assert.rejects(pending, (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.code, "sign_in_required");
    assert.equal(error.accessState, "sign-in-required");
    assert.equal(error.message, "Sign in before uploading.");
    return true;
  });
});

test("uploaded chapters are consumed once from transient memory", async () => {
  globalThis.XMLHttpRequest = FakeXMLHttpRequest;
  const chapter = {
    pages: [{ image: "data:image/webp;base64,AA==", panels: [{ path: "0 0" }] }],
  };
  const pending = createUploadedChapter(
    [new File(["page"], "page.png")],
    "standard",
    "token",
    () => {},
  );
  const request = FakeXMLHttpRequest.latest;
  request.status = 200;
  request.response = { chapter_hash: "transient-upload", chapter };
  request.onload();
  await pending;

  globalThis.fetch = async () => {
    throw new Error("the first read must not call the API");
  };
  assert.deepEqual(await getChapter("transient-upload", "token"), chapter);

  globalThis.fetch = async () =>
    jsonResponse(
      { detail: "Uploaded chapters are session-only." },
      { status: 409, statusText: "Conflict" },
    );
  await assert.rejects(
    getChapter("transient-upload", "token"),
    (error) => error instanceof ApiError && error.status === 409,
  );
});

test("aborting an upload aborts its XHR", async () => {
  globalThis.XMLHttpRequest = FakeXMLHttpRequest;
  const controller = new AbortController();
  const pending = createUploadedChapter(
    [new File(["page"], "page.png")],
    "standard",
    "token",
    () => {},
    controller.signal,
  );

  controller.abort();

  await assert.rejects(
    pending,
    (error) =>
      error instanceof ApiError && error.message === "Chapter upload was cancelled.",
  );
});
