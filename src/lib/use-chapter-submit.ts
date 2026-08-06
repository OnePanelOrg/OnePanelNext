import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { trackMarketingEvent } from "./analytics";
import { createChapter } from "./api";
import { useAuth } from "./auth";
import { normalizeChapterUrl } from "./chapter-url.mjs";

/**
 * Submit a chapter link in Standard mode from anywhere on the marketing site.
 *
 * Standard mode needs no account, so the landing page can take a reader
 * straight into a chapter. Pro mode selection stays in the reader page, where
 * subscription state is already loaded.
 */
export function useChapterSubmit(source: string) {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [url, setUrl] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (value: string) => {
      const normalizedChapterUrl = normalizeChapterUrl(value);
      if (!normalizedChapterUrl) {
        setError("That does not look like a chapter link. Paste the full URL.");
        return;
      }

      setLoading(true);
      setError(null);
      trackMarketingEvent("chapter_url_submitted", {
        mode: "standard",
        source,
      });
      try {
        const token = isSignedIn ? await getToken() : null;
        const chapterHash = await createChapter(
          normalizedChapterUrl,
          "standard",
          token,
        );
        trackMarketingEvent("chapter_created", { mode: "standard", source });
        await router.push(`/chapter/${chapterHash}`);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not open that chapter. Try another link.",
        );
      } finally {
        setLoading(false);
      }
    },
    [getToken, isSignedIn, router, source],
  );

  return { url, setUrl, isLoading, error, submit };
}
