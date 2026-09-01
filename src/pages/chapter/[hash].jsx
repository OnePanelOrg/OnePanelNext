import { SignInButton, useAuth } from "../../lib/auth";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ImageCanvas from "../../components/ImageCanvas";
import Head from "next/head";
import LoadingComponent from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { ApiError, getChapter } from "../../lib/api";
import { isChapterSignInRequired } from "../../lib/chapter-access.mjs";

export default function Page() {
  const router = useRouter();
  const chapterHash = Array.isArray(router.query.hash)
    ? router.query.hash[0]
    : router.query.hash;
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [requiresReupload, setRequiresReupload] = useState(false);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadChapter = useCallback(async () => {
    if (!router.isReady || !isLoaded) return;
    if (!chapterHash) return;

    setLoading(true);
    setError(null);
    setRequiresSignIn(false);
    setRequiresReupload(false);
    setData(null);
    try {
      const token = isSignedIn ? await getToken() : null;
      if (isSignedIn && !token)
        throw new Error("Your session expired. Please sign in again.");
      setData(await getChapter(chapterHash, token));
    } catch (error) {
      const accountRequired = isChapterSignInRequired(error, isSignedIn);
      const reuploadRequired =
        error instanceof ApiError && error.status === 409;
      setRequiresSignIn(accountRequired);
      setRequiresReupload(reuploadRequired);
      setError(
        accountRequired
          ? "This GPT-5.6 chapter requires an account. Sign in to continue reading."
          : reuploadRequired
            ? "Uploaded chapters are session-only. Re-upload the source to read it again."
            : error instanceof Error
              ? error.message
              : "Could not load the chapter.",
      );
    } finally {
      setLoading(false);
    }
  }, [chapterHash, getToken, isLoaded, isSignedIn, router.isReady]);

  useEffect(() => {
    void loadChapter();
  }, [loadChapter]);

  return (
    <>
      <Head>
        <title>OnePanel Reader</title>
        <meta
          name="description"
          content="Read this manga chapter one panel at a time with OnePanel Reader."
        />
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        {isLoading && <LoadingComponent />}
        {error && (
          <div className="space-y-4 text-center">
            <div className="mx-auto max-w-md text-left">
              <ErrorMessage
                message={error}
                onRetry={requiresReupload ? undefined : loadChapter}
              />
            </div>
            {requiresSignIn && chapterHash && (
              <SignInButton
                fallbackRedirectUrl={`/chapter/${encodeURIComponent(chapterHash)}`}
                signUpFallbackRedirectUrl={`/chapter/${encodeURIComponent(chapterHash)}`}
              >
                <button className="border-3 border-paper px-5 py-3 font-display text-base font-extrabold text-paper transition hover:bg-paper hover:text-ink">
                  Sign in to read
                </button>
              </SignInButton>
            )}
            {requiresReupload && (
              <button
                type="button"
                onClick={() => void router.push("/#start-reader")}
                className="border-3 border-paper px-5 py-3 font-display text-base font-extrabold text-paper transition hover:bg-paper hover:text-ink"
              >
                Re-upload chapter
              </button>
            )}
          </div>
        )}
        {data && !isLoading && chapterHash && (
          <ImageCanvas data={data} chapterHash={chapterHash}></ImageCanvas>
        )}
      </main>
    </>
  );
}
