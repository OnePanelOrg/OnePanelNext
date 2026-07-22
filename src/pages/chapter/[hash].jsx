import { SignInButton, useAuth } from "../../lib/auth";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ImageCanvas from "../../components/ImageCanvas";
import Head from "next/head";
import LoadingComponent from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { getChapter } from "../../lib/api";

export default function Page() {
  const router = useRouter();
  const chapterHash = Array.isArray(router.query.hash)
    ? router.query.hash[0]
    : router.query.hash;
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadChapter = useCallback(async () => {
    if (!router.isReady || !isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      setError("Sign in with an active subscription to read this chapter.");
      return;
    }
    if (!chapterHash) return;

    setLoading(true);
    setError(null);
    setData(null);
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      setData(await getChapter(chapterHash, token));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not load the chapter.",
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#64de9f] to-[#13aeae]">
        {isLoading && <LoadingComponent />}
        {error && (
          <div className="space-y-4 text-center">
            <ErrorMessage message={error} onRetry={loadChapter} />
            {!isSignedIn && (
              <SignInButton>
                <button className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white">
                  Sign in
                </button>
              </SignInButton>
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
