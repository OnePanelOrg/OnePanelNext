import { z } from "zod";
import {
  DEFAULT_SEGMENTATION_MODE,
  segmentationModeSchema,
} from "./segmentation-modes.mjs";

export type SegmentationMode = z.infer<typeof segmentationModeSchema>;

const panelSchema = z.object({
  path: z.string().min(1),
});

const pageSchema = z.object({
  image: z.string().min(1),
  panels: z.array(panelSchema).min(1),
});

const chapterSchema = z.object({
  pages: z.array(pageSchema).min(1),
});

const chapterCreatedSchema = z.object({
  chapter_hash: z.string().min(1),
});

const uploadedChapterCreatedSchema = chapterCreatedSchema.extend({
  chapter: chapterSchema,
});

const accessErrorCodeSchema = z.enum([
  "sign_in_required",
  "subscription_required",
]);

export type ApiErrorCode = z.infer<typeof accessErrorCodeSchema>;
export type ApiAccessState = "sign-in-required" | "subscription-required";

const subscriptionSchema = z.object({
  active: z.boolean(),
  status: z.string().nullable(),
});

const redirectSchema = z.object({
  url: z.string().url(),
});

const feedbackResponseSchema = z.union([z.object({}).passthrough(), z.null()]);

export type Chapter = z.infer<typeof chapterSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type UploadedChapter = {
  chapterHash: string;
  chapter: Chapter;
};

// Uploaded page bytes are deliberately kept only in this JavaScript runtime.
// The API deletes its temporary copies after returning the analyzed chapter.
const transientUploadedChapters = new Map<string, Chapter>();

const API_TIMEOUT_MS = 120_000;
const UPLOAD_TIMEOUT_MS = 10 * 60_000;
const API_PROXY_PATH = "/api/onepanel";
const UPLOAD_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? API_PROXY_PATH;

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: ApiErrorCode;
  readonly accessState?: ApiAccessState;

  constructor(
    message: string,
    status?: number,
    code?: ApiErrorCode,
    accessState?: ApiAccessState,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.accessState = accessState;
  }
}

function apiErrorFromResponse(
  status: number,
  statusText: string,
  responseBody: unknown,
): ApiError {
  const errorDetail =
    responseBody &&
    typeof responseBody === "object" &&
    "detail" in responseBody
      ? responseBody.detail
      : responseBody;
  const errorRecord =
    errorDetail && typeof errorDetail === "object" ? errorDetail : null;
  const codeResult = accessErrorCodeSchema.safeParse(
    errorRecord && "code" in errorRecord ? errorRecord.code : undefined,
  );
  const message =
    typeof errorDetail === "string"
      ? errorDetail
      : errorRecord &&
          "message" in errorRecord &&
          typeof errorRecord.message === "string"
        ? errorRecord.message
        : `The API returned ${status} ${statusText}.`;
  const accessState = codeResult.success
    ? codeResult.data === "sign_in_required"
      ? "sign-in-required"
      : "subscription-required"
    : undefined;
  return new ApiError(
    message,
    status,
    codeResult.success ? codeResult.data : undefined,
    accessState,
  );
}

async function request(
  path: string,
  token?: string | null,
  init?: RequestInit,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_PROXY_PATH}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      let detail: unknown;
      try {
        detail = (await response.json()) as unknown;
      } catch {
        detail = null;
      }
      throw apiErrorFromResponse(response.status, response.statusText, detail);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The API request timed out. Please try again.");
    }
    throw new ApiError(
      error instanceof Error
        ? `Could not reach the API: ${error.message}`
        : "Could not reach the API.",
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError("The API returned an invalid response.");
  }
  return result.data;
}

export async function createChapter(
  chapterUrl: string,
  mode: SegmentationMode = DEFAULT_SEGMENTATION_MODE,
  token?: string | null,
): Promise<string> {
  const validatedMode = segmentationModeSchema.parse(mode);
  const value = await request("/v2/chapter", token, {
    method: "POST",
    body: JSON.stringify({
      chapter_url: chapterUrl,
      segmentation_mode: validatedMode,
    }),
  });
  return parseResponse(chapterCreatedSchema, value).chapter_hash;
}

export function createUploadedChapter(
  files: File[],
  mode: SegmentationMode = DEFAULT_SEGMENTATION_MODE,
  token: string | null,
  onProgress: (progress: number | null) => void,
  signal?: AbortSignal,
): Promise<UploadedChapter> {
  return new Promise((resolve, reject) => {
    const validatedMode = segmentationModeSchema.parse(mode);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file, file.name));
    formData.append("segmentation_mode", validatedMode);

    const request = new XMLHttpRequest();
    request.open("POST", `${UPLOAD_API_ORIGIN}/v2/chapter/upload`);
    if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.responseType = "json";
    request.timeout = UPLOAD_TIMEOUT_MS;
    const abortRequest = () => request.abort();
    signal?.addEventListener("abort", abortRequest, { once: true });
    if (signal?.aborted) {
      request.abort();
      reject(new ApiError("Chapter upload was cancelled."));
      return;
    }
    const settle = <T>(callback: (value: T) => void, value: T) => {
      signal?.removeEventListener("abort", abortRequest);
      callback(value);
    };

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100),
      );
      onProgress(progress);
      if (progress === 100) onProgress(null);
    };
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        settle(
          reject,
          apiErrorFromResponse(
            request.status,
            request.statusText,
            request.response,
          ),
        );
        return;
      }
      try {
        const result = parseResponse(
          uploadedChapterCreatedSchema,
          request.response,
        );
        transientUploadedChapters.clear();
        transientUploadedChapters.set(result.chapter_hash, result.chapter);
        settle(resolve, {
          chapterHash: result.chapter_hash,
          chapter: result.chapter,
        });
      } catch (error) {
        settle(reject, error);
      }
    };
    request.onerror = () =>
      settle(
        reject,
        new ApiError(
          "Could not reach the upload API. Check the API URL and CORS configuration.",
        ),
      );
    request.ontimeout = () =>
      settle(
        reject,
        new ApiError("Chapter processing timed out. Please try again."),
      );
    request.onabort = () =>
      settle(reject, new ApiError("Chapter upload was cancelled."));
    request.send(formData);
  });
}

export async function notifyChapterUpload(
  fileCount: number,
  mode: SegmentationMode,
  token: string,
): Promise<void> {
  try {
    await fetch("/api/chapter-upload-notification", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileCount, mode }),
    });
  } catch {
    // Notifications are operational telemetry and must not break the reader.
  }
}

export async function getChapter(
  hash: string,
  token?: string | null,
): Promise<Chapter> {
  const transientChapter = transientUploadedChapters.get(hash);
  if (transientChapter) {
    transientUploadedChapters.delete(hash);
    return transientChapter;
  }

  const value = await request(`/v2/chapter/${encodeURIComponent(hash)}`, token);
  return parseResponse(chapterSchema, value);
}

export async function getSubscription(token: string): Promise<Subscription> {
  const value = await request("/v2/billing/status", token);
  return parseResponse(subscriptionSchema, value);
}

export async function createCheckout(token: string): Promise<string> {
  const value = await request("/v2/billing/checkout", token, {
    method: "POST",
  });
  return parseResponse(redirectSchema, value).url;
}

export async function createBillingPortal(token: string): Promise<string> {
  const value = await request("/v2/billing/portal", token, {
    method: "POST",
  });
  return parseResponse(redirectSchema, value).url;
}

export async function submitFeedback(
  chapterHash: string,
  rating: number,
  comment: string,
  token: string,
): Promise<void> {
  const value = await request("/v2/feedback", token, {
    method: "POST",
    body: JSON.stringify({
      chapter_hash: chapterHash,
      rating,
      comment,
    }),
  });
  parseResponse(feedbackResponseSchema, value);
}
