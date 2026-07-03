import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingComponent from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRouter } from "next/router";
import ErrorMessage from "../components/ErrorMessage";
import { createChapter } from "../lib/api";

const Home: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function isValidChapterUrl(chapterUrl: string) {
    try {
      const url = new URL(chapterUrl);
      return url.protocol === "https:" && url.hostname === "opchapters.com";
    } catch {
      return false;
    }
  }

  async function postUrl(chapterUrl: string) {
    if (!isValidChapterUrl(chapterUrl)) {
      setError("Enter a valid https://opchapters.com chapter URL.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const chapterHash = await createChapter(chapterUrl);
      await router.push(`/chapter/${chapterHash}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not load the chapter.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>OnePanel Reader</title>
        <meta
          name="description"
          content="Read manga chapters in one seamless panel"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#64de9f] to-[#13aeae] text-gray-900">
        <Header />
        <main className="container mx-auto flex-grow px-4 py-8">
          <div className="flex h-full items-center justify-center">
            {!isLoading && (
              <div className="w-full max-w-md">
                <h1 className="mb-6 text-center text-4xl font-bold text-white">
                  Welcome to OnePanel Reader
                </h1>
                <p className="mb-8 text-center text-gray-900 dark:text-white">
                  Enter a{" "}
                  <a
                    href="https://opchapters.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-700 underline hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    OP Chapters
                  </a>{" "}
                  URL to get started
                </p>
                <InputForm childToParent={postUrl} disabled={isLoading} />
                {error && (
                  <div className="mt-4">
                    <ErrorMessage message={error} />
                  </div>
                )}
              </div>
            )}
            {isLoading && <LoadingComponent />}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
