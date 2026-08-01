import { z } from "zod";

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

const API_TIMEOUT_MS = 120_000;
const UPLOAD_TIMEOUT_MS = 10 * 60_000;
const API_PROXY_PATH = "/api/onepanel";
const UPLOAD_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? API_PROXY_PATH;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request(
  path: string,
  token: string | null,
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
      const message =
        detail &&
        typeof detail === "object" &&
        "detail" in detail &&
        typeof detail.detail === "string"
          ? detail.detail
          : `The API returned ${response.status} ${response.statusText}.`;
      throw new ApiError(message, response.status);
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
  token: string | null = null,
): Promise<string> {
  const value = await request("/v2/chapter", token, {
    method: "POST",
    body: JSON.stringify({ chapter_url: chapterUrl }),
  });
  return parseResponse(chapterCreatedSchema, value).chapter_hash;
}

export function createUploadedChapter(
  files: File[],
  token: string,
  onProgress: (progress: number | null) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file, file.name));
    formData.append("segmentation_mode", "standard");

    const request = new XMLHttpRequest();
    request.open("POST", `${UPLOAD_API_ORIGIN}/v2/chapter/upload`);
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.responseType = "json";
    request.timeout = UPLOAD_TIMEOUT_MS;

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
        const detail =
          request.response &&
          typeof request.response === "object" &&
          "detail" in request.response &&
          typeof request.response.detail === "string"
            ? request.response.detail
            : `The API returned ${request.status} ${request.statusText}.`;
        reject(new ApiError(detail, request.status));
        return;
      }
      try {
        resolve(
          parseResponse(chapterCreatedSchema, request.response).chapter_hash,
        );
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () =>
      reject(
        new ApiError("Could not reach the API while uploading the chapter."),
      );
    request.ontimeout = () =>
      reject(new ApiError("Chapter processing timed out. Please try again."));
    request.onabort = () =>
      reject(new ApiError("Chapter upload was cancelled."));
    request.send(formData);
  });
}

export async function getChapter(
  hash: string,
  token: string,
): Promise<Chapter> {
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
