import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";
import Header from "../components/Header";
import InputForm from "../components/InputForm";
import LoadingComponent from "../components/Loading";
import { Show, SignInButton, SignUpButton, useAuth } from "../lib/auth";
import { trackMarketingEvent } from "../lib/analytics";
import {
  createBillingPortal,
  createChapter,
  createCheckout,
  getSubscription,
  type Subscription,
} from "../lib/api";

const readerBenefits = [
  "Paste an OP Chapters link.",
  "Read one panel at a time.",
  "Keep future panels off-screen.",
];

const Reader: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isBillingLoading, setBillingLoading] = useState(false);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadSubscription = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setSubscription(null);
      setBillingLoading(false);
      return;
    }

    setBillingLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
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
    trackMarketingEvent("chapter_url_submitted", {
      source: "reader_page",
    });
    try {
      const token = await getToken();
      if (!token)
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

  async function redirectToBilling(destination: "checkout" | "portal") {
    setBillingLoading(true);
    setError(null);
    trackMarketingEvent(
      destination === "checkout" ? "checkout_started" : "billing_portal_opened",
      {
        source: "reader_page",
      },
    );
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      const url =
        destination === "checkout"
          ? await createCheckout(token)
          : await createBillingPortal(token);
      trackMarketingEvent(
        destination === "checkout"
          ? "checkout_redirect_created"
          : "billing_portal_redirect_created",
        {
          source: "reader_page",
        },
      );
      window.location.assign(url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not open Stripe billing.",
      );
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Reader | OnePanel Reader</title>
        <meta
          name="description"
          content="Paste an OP Chapters URL and start a spoiler-safe panel-by-panel reading flow."
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
                Paste a chapter link.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-700">
                Drop in an{" "}
                <a
                  href="https://opchapters.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
                >
                  OP Chapters
                </a>{" "}
                URL and OnePanel will open it as a focused, spoiler-safe reader.
              </p>
            </section>

            <section className="mx-auto mt-8 rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              {!isLoaded && <LoadingComponent />}
              {isLoaded && (
                <>
                  <Show when="signed-out">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold">Join OnePanel Pro</h2>
                      <p className="my-3 text-3xl font-bold">
                        €4.99
                        <span className="text-base font-normal"> / month</span>
                      </p>
                      <p className="mb-5 text-sm text-gray-700">
                        Create an account to subscribe, process chapters, and
                        manage billing securely through Stripe.
                      </p>
                      <div className="grid gap-3">
                        <SignUpButton>
                          <button className="w-full rounded-md bg-gray-950 px-5 py-3 font-semibold text-white hover:bg-gray-800">
                            Subscribe now
                          </button>
                        </SignUpButton>
                        <SignInButton>
                          <button className="w-full rounded-md border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-100">
                            Sign in
                          </button>
                        </SignInButton>
                      </div>
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
                        {isLoading && (
                          <p className="mt-3 text-center text-sm font-semibold text-gray-600">
                            Preparing your panel-by-panel reader.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => void redirectToBilling("portal")}
                          className="mt-4 w-full text-sm font-semibold text-gray-900 underline underline-offset-4"
                        >
                          Manage subscription
                        </button>
                      </>
                    )}
                    {!isBillingLoading &&
                      subscription &&
                      !subscription.active && (
                        <div className="text-center">
                          <h2 className="text-2xl font-bold">OnePanel Pro</h2>
                          <p className="my-3 text-3xl font-bold">
                            €4.99
                            <span className="text-base font-normal">
                              {" "}
                              / month
                            </span>
                          </p>
                          <p className="mb-5 text-sm text-gray-700">
                            Unlimited access while your subscription is active.
                            Cancel any time. No free trial.
                          </p>
                          <button
                            type="button"
                            onClick={() => void redirectToBilling("checkout")}
                            className="w-full rounded-md bg-gray-950 px-4 py-3 font-semibold text-white hover:bg-gray-800"
                          >
                            Subscribe
                          </button>
                        </div>
                      )}
                  </Show>
                </>
              )}
              {error && (
                <div className="mt-4">
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
    </>
  );
};

export default Reader;
