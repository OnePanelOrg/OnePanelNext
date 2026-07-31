import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ChapterComposer, {
  type ChapterMode,
} from "../components/ChapterComposer";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UploadForm from "../components/UploadForm";
import UpgradeModal from "../components/UpgradeModal";
import { useAuth } from "../lib/auth";
import { trackMarketingEvent } from "../lib/analytics";
import {
  createChapter,
  createCheckout,
  createUploadedChapter,
  getSubscription,
  type Subscription,
} from "../lib/api";
import { normalizeChapterUrl } from "../lib/chapter-url.mjs";
import {
  clearPendingChapterRequest,
  readPendingChapterRequest,
  writePendingChapterRequest,
} from "../lib/pending-chapter-request.mjs";

const readerBenefits = [
  "Import links, comic files, or page images.",
  "Read one panel at a time.",
  "Keep future panels off-screen.",
];

const Reader: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isBillingLoading, setBillingLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<ChapterMode>("standard");
  const [isUpgradeOpen, setUpgradeOpen] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);
  const [sourceMethod, setSourceMethod] = useState<"upload" | "link">("upload");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadSubscription = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setSubscription(null);
      setBillingLoading(false);
      return;
    }

    setBillingLoading(true);
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      setSubscription(await getSubscription(token));
    } catch {
      setSubscription(null);
    } finally {
      setBillingLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const redirectToCheckout = useCallback(
    async (chapterUrl: string, chapterMode: ChapterMode) => {
      setBillingLoading(true);
      setError(null);
      trackMarketingEvent("checkout_continuation", {
        mode: chapterMode,
        stage: "started",
      });
      try {
        const token = await getToken();
        if (!token)
          throw new Error("Your session expired. Please sign in again.");
        writePendingChapterRequest(window.sessionStorage, {
          url: chapterUrl,
          mode: chapterMode,
          continuation: "restore",
        });
        const checkoutUrl = await createCheckout(token);
        trackMarketingEvent("checkout_continuation", {
          mode: chapterMode,
          stage: "redirect_created",
        });
        window.location.assign(checkoutUrl);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not open Stripe Checkout.",
        );
      } finally {
        setBillingLoading(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (!isLoaded || hasRestored) return;
    const pending = readPendingChapterRequest(window.sessionStorage);
    setHasRestored(true);
    if (!pending) return;

    setUrl(pending.url);
    setMode(pending.mode);
    if (pending.continuation === "authenticate" && isSignedIn) {
      trackMarketingEvent("authentication_continuation", {
        mode: pending.mode,
        stage: "authenticated",
      });
      writePendingChapterRequest(window.sessionStorage, {
        url: pending.url,
        mode: pending.mode,
        continuation: "checkout",
      });
      void redirectToCheckout(pending.url, pending.mode);
    }
  }, [hasRestored, isLoaded, isSignedIn, redirectToCheckout]);

  async function postUrl(chapterUrl: string) {
    const normalizedChapterUrl = normalizeChapterUrl(chapterUrl);
    if (!normalizedChapterUrl) {
      setError("Enter a valid chapter link.");
      return;
    }

    if (mode === "gpt-5.6-layout" && !subscription?.active) {
      setUrl(normalizedChapterUrl);
      setUpgradeOpen(true);
      trackMarketingEvent("upgrade_displayed", {
        mode,
        signed_in: isSignedIn,
      });
      return;
    }

    setLoading(true);
    setError(null);
    trackMarketingEvent("chapter_url_submitted", {
      mode,
      source: "reader_page",
    });
    try {
      const token = isSignedIn ? await getToken() : null;
      const chapterHash = await createChapter(
        normalizedChapterUrl,
        mode,
        token,
      );
      clearPendingChapterRequest(window.sessionStorage);
      trackMarketingEvent("chapter_created", {
        mode,
        source: "reader_page",
      });
      await router.push(`/chapter/${chapterHash}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not load the chapter.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function postFiles(files: File[]) {
    setLoading(true);
    setUploadProgress(0);
    setError(null);
    trackMarketingEvent("chapter_upload_started", {
      file_count: files.length,
      mode: "standard",
      source: "reader_page",
    });
    try {
      const token = isSignedIn ? await getToken() : null;
      const { chapterHash } = await createUploadedChapter(
        files,
        "standard",
        token,
        setUploadProgress,
      );
      trackMarketingEvent("chapter_upload_created", {
        mode: "standard",
        source: "reader_page",
      });
      await router.push(`/chapter/${chapterHash}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not import the chapter.",
      );
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  return (
    <>
      <Head>
        <title>Reader | OnePanel Reader</title>
        <meta
          name="description"
          content="Import a comic file, page images, or a chapter URL for spoiler-safe panel-by-panel reading."
        />
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-[#f6f4ef] text-gray-950">
        <Header />
        <main className="flex flex-grow items-center px-4 py-12">
          <div className="mx-auto w-full max-w-3xl">
            <section className="text-center">
              <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                Reader home
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-normal text-gray-950 sm:text-5xl">
                Bring your own chapter.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-700">
                Import a comic from your library, your own page scans, or a
                chapter link. OnePanel turns it into a focused, panel-by-panel
                reader.
              </p>
            </section>

            <section className="mx-auto mt-8 overflow-visible rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="grid grid-cols-2 rounded-t-2xl border-b border-gray-200 bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setSourceMethod("upload");
                    setError(null);
                  }}
                  aria-pressed={sourceMethod === "upload"}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    sourceMethod === "upload"
                      ? "bg-white text-gray-950 shadow-sm"
                      : "text-gray-600 hover:text-gray-950"
                  }`}
                >
                  Upload files
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceMethod("link");
                    setError(null);
                  }}
                  aria-pressed={sourceMethod === "link"}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    sourceMethod === "link"
                      ? "bg-white text-gray-950 shadow-sm"
                      : "text-gray-600 hover:text-gray-950"
                  }`}
                >
                  Paste link
                </button>
              </div>
              {sourceMethod === "upload" ? (
                <div className="p-5 sm:p-6">
                  <UploadForm
                    childToParent={postFiles}
                    disabled={isLoading}
                    progress={uploadProgress}
                  />
                </div>
              ) : (
                <ChapterComposer
                  disabled={isLoading}
                  mode={mode}
                  onModeChange={(nextMode) => {
                    setMode(nextMode);
                    trackMarketingEvent("mode_selected", {
                      mode: nextMode,
                      source: "reader_page",
                    });
                  }}
                  onSubmit={(chapterUrl) => void postUrl(chapterUrl)}
                  url={url}
                  onUrlChange={setUrl}
                />
              )}
              {isLoading && sourceMethod === "link" && (
                <p className="border-t border-gray-100 px-5 py-3 text-center text-sm font-semibold text-gray-600">
                  Preparing your panel-by-panel reader.
                </p>
              )}
              {error && (
                <div className="px-5 pb-5">
                  <ErrorMessage message={error} />
                </div>
              )}
            </section>

            <ul className="mt-6 grid gap-3 text-sm font-semibold text-gray-800 sm:grid-cols-3">
              {readerBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="rounded-md border border-gray-200 bg-white px-4 py-3 text-center"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </main>
        <Footer />
      </div>
      {isUpgradeOpen && (
        <UpgradeModal
          isSignedIn={isSignedIn}
          isLoading={isBillingLoading}
          onClose={() => setUpgradeOpen(false)}
          onAuthenticate={() => {
            const normalized = normalizeChapterUrl(url);
            trackMarketingEvent("authentication_continuation", {
              mode,
              stage: "started",
            });
            if (
              normalized &&
              writePendingChapterRequest(window.sessionStorage, {
                url: normalized,
                mode,
                continuation: "authenticate",
              })
            ) {
              setUrl(normalized);
            }
          }}
          onContinue={() => {
            const normalized = normalizeChapterUrl(url);
            if (normalized) void redirectToCheckout(normalized, mode);
          }}
        />
      )}
    </>
  );
};

export default Reader;
