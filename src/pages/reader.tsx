import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import ChapterComposer, {
  type ChapterMode,
} from "../components/ChapterComposer";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SourceRequestForm from "../components/SourceRequestForm";
import UpgradeModal from "../components/UpgradeModal";
import { SignInButton, useAuth } from "../lib/auth";
import { trackMarketingEvent } from "../lib/analytics";
import { ui } from "../lib/theme";
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const signInTriggerRef = useRef<HTMLButtonElement | null>(null);
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

  useEffect(
    () => () => {
      uploadControllerRef.current?.abort();
      uploadControllerRef.current = null;
    },
    [],
  );

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
    if (!isSignedIn) {
      setError("Sign in before uploading a comic or page images.");
      return;
    }
    uploadControllerRef.current?.abort();
    const controller = new AbortController();
    uploadControllerRef.current = controller;
    setLoading(true);
    setUploadProgress(0);
    setError(null);
    trackMarketingEvent("chapter_upload_started", {
      file_count: files.length,
      mode: "standard",
      source: "reader_page",
    });
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      const { chapterHash } = await createUploadedChapter(
        files,
        "standard",
        token,
        setUploadProgress,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      trackMarketingEvent("chapter_upload_created", {
        mode: "standard",
        source: "reader_page",
      });
      await router.push(`/chapter/${chapterHash}`);
    } catch (error) {
      if (controller.signal.aborted) return;
      setError(
        error instanceof Error
          ? error.message
          : "Could not import the chapter.",
      );
    } finally {
      if (uploadControllerRef.current === controller) {
        uploadControllerRef.current = null;
        setLoading(false);
        setUploadProgress(null);
      }
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
      <div className="flex min-h-screen flex-col bg-paper text-ink">
        <Header />
        <main className="flex flex-grow items-center px-4 py-12">
          <div className="mx-auto w-full max-w-3xl">
            <section className="text-center">
              <p className={ui.eyebrow}>Reader</p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-5xl">
                Upload a chapter.
              </h1>
              <p className={`mx-auto mt-4 max-w-2xl ${ui.lead}`}>
                Bring the source you already have. OnePanel handles the rest.
              </p>
            </section>

            <section className="mt-8 overflow-visible">
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
                onUrlSubmit={(chapterUrl) => void postUrl(chapterUrl)}
                onFilesSubmit={(files) => void postFiles(files)}
                url={url}
                onUrlChange={setUrl}
                requiresAuth={!isSignedIn}
                onAuthRequired={() => signInTriggerRef.current?.click()}
                progress={uploadProgress}
              />

              <div className="mt-4 space-y-2 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ink/55 sm:text-[11px]">
                <p>
                  CBZ, CBR, ZIP, RAR, PDF, images
                  <span aria-hidden="true"> · </span>
                  <a
                    href="https://opchapters.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline underline-offset-4 hover:bg-marker"
                  >
                    OP Chapters
                  </a>
                  <span aria-hidden="true"> · </span>
                  <a
                    href="https://tcbonepiecechapters.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline underline-offset-4 hover:bg-marker"
                  >
                    TCB
                  </a>
                </p>
                <p>Files require an account · Links don’t</p>
                <p className="normal-case tracking-normal text-ink/60">
                  <span aria-hidden="true">▣ </span>
                  Uploads are deleted after analysis.
                </p>
              </div>
              {isLoading && uploadProgress === null && (
                <p className={`pt-4 text-center ${ui.micro}`}>
                  Preparing your panel-by-panel reader.
                </p>
              )}
              {error && (
                <div className="pt-5">
                  <ErrorMessage message={error} />
                </div>
              )}
            </section>

            <ul className="mt-6 grid gap-px border-3 border-ink bg-ink sm:grid-cols-3">
              {readerBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="bg-paper px-4 py-4 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-ink"
                >
                  {benefit}
                </li>
              ))}
            </ul>
            <SourceRequestForm />
          </div>
        </main>
        <Footer />
      </div>
      {!isSignedIn && (
        <SignInButton
          mode="modal"
          fallbackRedirectUrl="/reader"
          signUpFallbackRedirectUrl="/reader"
        >
          <button
            ref={signInTriggerRef}
            type="button"
            className="sr-only"
            tabIndex={-1}
          >
            Sign in to upload
          </button>
        </SignInButton>
      )}
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
