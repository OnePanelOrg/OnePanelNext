import { monitorSource, parseSourceUrls } from "./source-monitor.mjs";

const apiOrigin = process.env.MONITOR_API_URL?.replace(/\/$/, "");
if (!apiOrigin) throw new Error("MONITOR_API_URL is required.");

const sources = parseSourceUrls(process.env.MONITOR_CHAPTER_URLS ?? "");
let failures = 0;

for (const [index, source] of sources.entries()) {
  const label = `Source ${index + 1} (${new URL(source).hostname})`;
  try {
    const result = await monitorSource(apiOrigin, source);
    console.log(`PASS ${label}: ${result.pages} pages (${result.hash})`);
  } catch (error) {
    failures += 1;
    console.error(
      `FAIL ${label}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (failures > 0) {
  throw new Error(`${failures} of ${sources.length} source checks failed.`);
}
