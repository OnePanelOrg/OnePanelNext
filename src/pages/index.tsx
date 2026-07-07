import { type NextPage } from "next";
import { Show, SignInButton, SignUpButton, useAuth } from "../lib/auth";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import InputForm from "../components/InputForm";
import LoadingComponent from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRouter } from "next/router";
import ErrorMessage from "../components/ErrorMessage";
import { trackMarketingEvent } from "../lib/analytics";
import {
  createBillingPortal,
  createChapter,
  createCheckout,
  getSubscription,
  type Subscription,
} from "../lib/api";

const audienceHighlights = [
  "Avoid accidental spoilers from full-page chapter scans.",
  "Read one clean panel at a time on phone, tablet, or desktop.",
  "Jump from OP Chapters to a focused reader in seconds.",
];

const launchProof = [
  { label: "Reader mode", value: "Panel by panel" },
  { label: "Price", value: "€4.99/mo" },
  { label: "Access", value: "Cancel any time" },
];

const readerBenefits = [
  "Paste an OP Chapters link",
  "Move through the chapter panel by panel",
  "Keep surprise reveals off-screen until you are ready",
  "Manage subscription billing through Stripe",
];

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
    trackMarketingEvent("chapter_url_submitted", {
      source: "homepage_reader",
    });
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");
      const chapterHash = await createChapter(chapterUrl, token);
      trackMarketingEvent("chapter_created", {
        source: "homepage_reader",
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
        source: "homepage_reader",
      },
    );
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");
      const url =
        destination === "checkout"
          ? await createCheckout(token)
          : await createBillingPortal(token);
      trackMarketingEvent(
        destination === "checkout"
          ? "checkout_redirect_created"
          : "billing_portal_redirect_created",
        {
          source: "homepage_reader",
        },
      );
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
          content="Read manga chapters one panel at a time. OnePanel Reader turns OP Chapters links into a focused spoiler-safe reading flow."
        />
        <meta
          property="og:title"
          content="OnePanel Reader - Manga without accidental spoilers"
        />
        <meta
          property="og:description"
          content="Paste an OP Chapters URL and read every chapter one panel at a time."
        />
        <meta property="og:image" content="/icon.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-[#f6f4ef] text-gray-950">
        <Header />
        <main className="flex-grow">
          <section className="border-b border-gray-200 bg-white">
            <div className="container mx-auto grid gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
              <div>
                <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  New faster version available now
                </p>
                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
                  Manga chapters without accidental spoilers.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
                  OnePanel Reader turns OP Chapters links into a focused,
                  panel-by-panel reading flow so every reveal lands exactly
                  when it should.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Show when="signed-out">
                    <SignUpButton mode="modal">
                      <button className="rounded-md bg-gray-950 px-5 py-3 text-base font-bold text-white hover:bg-gray-800">
                        Start reading
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button className="rounded-md border border-gray-300 px-5 py-3 text-base font-bold text-gray-800 hover:bg-gray-100">
                        I already have an account
                      </button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <a
                      href="#reader"
                      className="rounded-md bg-gray-950 px-5 py-3 text-center text-base font-bold text-white hover:bg-gray-800"
                    >
                      Open reader
                    </a>
                  </Show>
                </div>
                <dl className="mt-9 grid max-w-xl grid-cols-3 gap-3">
                  {launchProof.map((item) => (
                    <div
                      key={item.label}
                      className="border-l border-gray-200 pl-3"
                    >
                      <dt className="text-xs font-semibold uppercase text-gray-500">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-sm font-bold text-gray-950">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mx-auto w-full max-w-xl">
                <div className="overflow-hidden rounded-md border border-gray-200 bg-[#111111] shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-white/10 bg-black px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-300" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs font-semibold text-gray-300">
                      OnePanel Reader
                    </span>
                  </div>
                  <div className="grid gap-4 p-4 sm:grid-cols-[0.8fr_1.2fr]">
                    <div className="space-y-3">
                      <div className="h-24 rounded-sm bg-gray-800" />
                      <div className="h-32 rounded-sm bg-gray-800" />
                      <div className="h-20 rounded-sm bg-gray-800" />
                    </div>
                    <div className="rounded-sm bg-[#f8f8f3] p-3">
                      <div className="h-72 rounded-sm border-4 border-gray-950 bg-gradient-to-br from-white via-amber-100 to-emerald-200" />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">
                          Page 08 / Panel 03
                        </span>
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                          Spoiler-safe
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200">
            <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-3">
              {audienceHighlights.map((highlight) => (
                <div
                  key={highlight}
                  className="border-l-4 border-gray-950 pl-4"
                >
                  <p className="text-lg font-bold leading-7">{highlight}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="reader" className="container mx-auto px-4 py-10">
            {!isLoading && isLoaded && (
              <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-950">
                    Paste a chapter and start reading.
                  </h2>
                  <p className="mt-3 max-w-2xl text-gray-700">
                    Works with{" "}
                    <a
                      href="https://opchapters.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
                    >
                      OP Chapters
                    </a>{" "}
                    links. Active subscribers get unlimited access while the
                    subscription is active.
                  </p>
                  <ul className="mt-6 grid gap-3 text-sm font-semibold text-gray-800 sm:grid-cols-2">
                    {readerBenefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="rounded-md border border-gray-200 bg-white px-4 py-3"
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
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
                      <SignUpButton mode="modal">
                        <button className="w-full rounded-md bg-gray-950 px-5 py-3 font-semibold text-white hover:bg-gray-800">
                          Subscribe now
                        </button>
                      </SignUpButton>
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
                  {error && (
                    <div className="mt-4">
                      <ErrorMessage message={error} />
                    </div>
                  )}
                </div>
              </div>
            )}
            {(isLoading || !isLoaded) && <LoadingComponent />}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
