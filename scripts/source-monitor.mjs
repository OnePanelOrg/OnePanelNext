const SUPPORTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function parseSourceUrls(value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("MONITOR_CHAPTER_URLS must be a JSON array of URLs.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("MONITOR_CHAPTER_URLS must contain at least one URL.");
  }

  return parsed.map((value, index) => {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`Source ${index + 1} is not a valid URL.`);
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error(`Source ${index + 1} must use HTTP or HTTPS.`);
    }
    return url.toString();
  });
}

export function detectImageType(bytes) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    bytes.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))
  )
    return "image/gif";
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  if (
    bytes.length >= 12 &&
    bytes.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis"].includes(bytes.subarray(8, 12).toString("ascii"))
  )
    return "image/avif";
  return null;
}

export function validateChapter(value) {
  if (
    !value ||
    typeof value !== "object" ||
    !Array.isArray(value.pages) ||
    value.pages.length === 0
  ) {
    throw new Error("Chapter response has no pages.");
  }

  return value.pages.map((page, index) => {
    if (
      !page ||
      typeof page !== "object" ||
      typeof page.image !== "string" ||
      page.image.length === 0
    ) {
      throw new Error(`Page ${index + 1} has no image URL.`);
    }
    if (
      !Array.isArray(page.panels) ||
      page.panels.length === 0 ||
      page.panels.some(
        (panel) =>
          !panel || typeof panel.path !== "string" || panel.path.length === 0,
      )
    ) {
      throw new Error(`Page ${index + 1} has invalid panels.`);
    }
    return page.image;
  });
}

export async function fetchJson(url, init, timeoutMs = 120_000) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok)
    throw new Error(
      `${init?.method ?? "GET"} ${url} returned ${response.status}.`,
    );
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json"))
    throw new Error(`${url} did not return JSON.`);
  return response.json();
}

export async function verifyImage(imageUrl, pageNumber, timeoutMs = 30_000) {
  const response = await fetch(imageUrl, {
    headers: { Range: "bytes=0-31" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok)
    throw new Error(`Page ${pageNumber} image returned ${response.status}.`);

  const reader = response.body?.getReader();
  if (!reader)
    throw new Error(`Page ${pageNumber} image had no response body.`);
  const { value } = await reader.read();
  await reader.cancel();
  const detectedType = detectImageType(Buffer.from(value ?? []));
  const declaredType = (response.headers.get("content-type") ?? "")
    .split(";", 1)[0]
    .toLowerCase();
  if (!detectedType)
    throw new Error(`Page ${pageNumber} is not a supported image format.`);
  if (!SUPPORTED_IMAGE_TYPES.has(declaredType))
    throw new Error(
      `Page ${pageNumber} declared unexpected content type ${declaredType || "(missing)"}.`,
    );
  if (declaredType !== detectedType)
    throw new Error(
      `Page ${pageNumber} declared ${declaredType} but contains ${detectedType}.`,
    );
}

export async function monitorSource(apiOrigin, sourceUrl) {
  const created = await fetchJson(`${apiOrigin}/v2/chapter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chapter_url: sourceUrl,
      segmentation_mode: "standard",
    }),
  });
  if (
    !created ||
    typeof created.chapter_hash !== "string" ||
    created.chapter_hash.length === 0
  ) {
    throw new Error("Chapter creation returned no chapter_hash.");
  }

  const chapter = await fetchJson(
    `${apiOrigin}/v2/chapter/${encodeURIComponent(created.chapter_hash)}`,
  );
  const images = validateChapter(chapter);
  await Promise.all(
    images.map((image, index) => verifyImage(image, index + 1)),
  );
  return { hash: created.chapter_hash, pages: images.length };
}
