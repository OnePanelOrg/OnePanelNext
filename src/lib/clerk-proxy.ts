import { fapiUrlFromPublishableKey } from "@clerk/backend/proxy";
import { type NextApiRequest, type NextApiResponse } from "next";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function getPublicOrigin(req: NextApiRequest) {
  const proto = getHeaderValue(req.headers["x-forwarded-proto"]) ?? "https";
  const host = getHeaderValue(
    req.headers["x-forwarded-host"] ?? req.headers.host,
  );
  if (!host) return null;
  return `${proto}://${host}`;
}

function getBody(req: NextApiRequest) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      resolve(
        body.buffer.slice(body.byteOffset, body.byteOffset + body.length),
      );
    });
    req.on("error", reject);
  });
}

export async function proxyClerkRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  publicProxyPath: "/_clerk" | "/__clerk",
) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publicOrigin = getPublicOrigin(req);

  if (!publishableKey || !secretKey || !publicOrigin) {
    res.status(500).json({
      detail:
        "Clerk proxy is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.",
    });
    return;
  }

  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path;
  const targetPath = path ? `/${path}` : "/";
  const sourceUrl = new URL(req.url ?? "", publicOrigin);
  const targetUrl = new URL(
    `${fapiUrlFromPublishableKey(publishableKey)}${targetPath}`,
  );
  targetUrl.search = sourceUrl.search;

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    const lowerName = name.toLowerCase();
    const headerValue = getHeaderValue(value);
    if (!headerValue || HOP_BY_HOP_HEADERS.has(lowerName)) continue;
    headers.set(name, headerValue);
  }
  headers.set("Accept-Encoding", "identity");
  headers.set("Clerk-Proxy-Url", `${publicOrigin}${publicProxyPath}`);
  headers.set("Clerk-Secret-Key", secretKey);
  headers.set("Host", targetUrl.host);
  headers.set("X-Forwarded-Host", new URL(publicOrigin).host);
  headers.set("X-Forwarded-Proto", new URL(publicOrigin).protocol.slice(0, -1));

  const method = req.method ?? "GET";
  const hasBody = !["GET", "HEAD"].includes(method);
  const response = await fetch(targetUrl, {
    body: hasBody ? await getBody(req) : undefined,
    headers,
    method,
    redirect: "manual",
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
  res.send(Buffer.from(await response.arrayBuffer()));
}
