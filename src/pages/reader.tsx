import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";
import Header from "../components/Header";
import InputForm from "../components/InputForm";
import UploadForm from "../components/UploadForm";
import { SignInButton, SignUpButton, useAuth } from "../lib/auth";
import { trackMarketingEvent } from "../lib/analytics";
import {
  createChapter,
  createUploadedChapter,
} from "../lib/api";
import { classifyChapterUrl } from "../lib/chapter-url.mjs";

const readerBenefits = [
  "Import links, comic files, or page images.",
  "Read one panel at a time.",
  "Keep future panels off-screen.",
];

const Reader: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  async function postUrl(chapterUrl: string) {
    const classification = classifyChapterUrl(chapterUrl);
    if (!classification.valid) {
      trackMarketingEvent("chapter_url_rejected", {
        source: "reader_page",
        reason: classification.reason,
        provider_hostname: classification.hostname ?? "unknown",
      });
      setError("Enter a valid https://opchapters.com chapter URL.");
      return;
    }

    setLoading(true);
    setError(null);
    trackMarketingEvent("chapter_url_submitted", {
      source: "reader_page",
    });
    try {
      const token = isSignedIn ? await getToken() : null;
      if (isSignedIn && !token)
        throw new Error("Your session expired. Please sign in again.");
      const chapterHash = await createChapter(chapterUrl, token);
      trackMarketingEvent("chapter_created", {
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
      source: "reader_page",
      file_count: files.length,
    });
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      const chapterHash = await createUploadedChapter(
        files,
        token,
        setUploadProgress,
      );
      trackMarketingEvent("chapter_upload_created", {
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
          content="Import a comic file, page images, or an OP Chapters URL for spoiler-safe panel-by-panel reading."
        />
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
                Import a comic from your library, your own page scans, or an OP
                Chapters link. OnePanel turns it into a focused, panel-by-panel
                reader.
              </p>
            </section>

            <section className="mx-auto mt-8 rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                    Add a chapter
                  </h2>
                  <p className="mt-1 text-sm text-gray-700">
                    Bring the source you already have. OnePanel handles the rest.
                  </p>
                </div>
                {isLoaded && !isSignedIn && (
                  <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                    Account required for uploads
                  </span>
                )}
              </div>

              {!isLoaded ? (
                <div className="h-56 animate-pulse rounded-md bg-gray-100" />
              ) : isSignedIn ? (
                <UploadForm
                  childToParent={postFiles}
                  disabled={isLoading}
                  progress={uploadProgress}
                />
              ) : (
                <div className="rounded-md border-2 border-dashed border-gray-300 bg-[#faf9f6] px-5 py-8 text-center">
                  <p className="text-lg font-black text-gray-950">
                    Sign in to upload your own files
                  </p>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
                    Upload CBZ, CBR, ZIP, RAR, PDF, or page images after creating
                    a free account.
                  </p>
                  <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                    <SignUpButton>
                      <button className="rounded-md bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        Create account
                      </button>
                    </SignUpButton>
                    <SignInButton>
                      <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                        Sign in
                      </button>
                    </SignInButton>
                  </div>
                </div>
              )}

              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                  Or paste a link
                </span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <div>
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-sm font-bold text-gray-950">
                    No account needed
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports chapter links from{" "}
                    <a
                      href="https://opchapters.com"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900"
                    >
                      OP Chapters
                    </a>
                    .
                  </p>
                </div>
                <InputForm childToParent={postUrl} disabled={isLoading} />
                {isLoading && (
                  <p className="mt-3 text-center text-sm font-semibold text-gray-600">
                    Preparing your panel-by-panel reader.
                  </p>
                )}
              </div>

              {error && (
                <div className="mt-4">
                  <ErrorMessage message={error} />
                </div>
              )}

              <div className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
                <p className="font-bold">Private by design</p>
                <p className="mt-1 leading-6 text-emerald-900">
                  Uploaded files are deleted after analysis. Only panel layout
                  data remains, so keep your original files.
                </p>
              </div>
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
    </>
  );
};

export default Reader;
