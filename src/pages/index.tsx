import { type NextPage } from "next";
import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import InputForm from "../components/InputForm";
import LoadingComponent from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRouter } from "next/router";
import ErrorMessage from "../components/ErrorMessage";
import {
  createBillingPortal,
  createChapter,
  createCheckout,
  getSubscription,
  type Subscription,
} from "../lib/api";

const Home: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isBillingLoading, setBillingLoading] = useState(false);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadSubscription = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setSubscription(null);
      return;
    }

    setBillingLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");
      setSubscription(await getSubscription(token));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not check your subscription.",
      );
    } finally {
      setBillingLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

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
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");
      const chapterHash = await createChapter(chapterUrl, token);
      await router.push(`/chapter/${chapterHash}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not load the chapter.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function redirectToBilling(destination: "checkout" | "portal") {
    setBillingLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");
      const url =
        destination === "checkout"
          ? await createCheckout(token)
          : await createBillingPortal(token);
      window.location.assign(url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not open Stripe billing.",
      );
      setBillingLoading(false);
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
            {!isLoading && isLoaded && (
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
                <Show when="signed-out">
                  <div className="rounded-lg bg-white/90 p-6 text-center shadow">
                    <p className="mb-4">
                      Sign in to subscribe and process chapters.
                    </p>
                    <SignInButton mode="modal">
                      <button className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
                        Sign in
                      </button>
                    </SignInButton>
                  </div>
                </Show>
                <Show when="signed-in">
                  {isBillingLoading && <LoadingComponent />}
                  {!isBillingLoading && subscription?.active && (
                    <>
                      <InputForm
                        childToParent={postUrl}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => void redirectToBilling("portal")}
                        className="mt-4 w-full text-sm font-semibold text-blue-900 underline"
                      >
                        Manage subscription
                      </button>
                    </>
                  )}
                  {!isBillingLoading && subscription && !subscription.active && (
                    <div className="rounded-lg bg-white p-6 text-center shadow">
                      <h2 className="text-2xl font-bold">OnePanel Pro</h2>
                      <p className="my-3 text-3xl font-bold">
                        €4.99
                        <span className="text-base font-normal"> / month</span>
                      </p>
                      <p className="mb-5 text-sm text-gray-700">
                        Unlimited access while your subscription is active.
                        Cancel any time. No free trial.
                      </p>
                      <button
                        type="button"
                        onClick={() => void redirectToBilling("checkout")}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                      >
                        Subscribe
                      </button>
                    </div>
                  )}
                </Show>
                {error && (
                  <div className="mt-4">
                    <ErrorMessage message={error} />
                  </div>
                )}
              </div>
            )}
            {(isLoading || !isLoaded) && <LoadingComponent />}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
