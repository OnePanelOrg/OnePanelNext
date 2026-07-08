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
const API_PROXY_PATH = "/api/onepanel";

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
  token: string,
  init?: RequestInit,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API_PROXY_PATH}${path}`,
      {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      },
    );

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
      throw new ApiError(
        message,
        response.status,
      );
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
  token: string,
): Promise<string> {
  const value = await request("/v2/chapter", token, {
    method: "POST",
    body: JSON.stringify({ chapter_url: chapterUrl }),
  });
  return parseResponse(chapterCreatedSchema, value).chapter_hash;
}

export async function getChapter(
  hash: string,
  token: string,
): Promise<Chapter> {
  const value = await request(
    `/v2/chapter/${encodeURIComponent(hash)}`,
    token,
  );
  return parseResponse(chapterSchema, value);
}

export async function getSubscription(
  token: string,
): Promise<Subscription> {
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
