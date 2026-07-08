import { type NextPage } from "next";
import { Show, SignInButton, SignUpButton, useAuth } from "../lib/auth";
import Head from "next/head";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRouter } from "next/router";

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

const Home: NextPage = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void router.replace("/reader");
    }
  }, [isLoaded, isSignedIn, router]);

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
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f6f4ef] text-gray-950">
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
                  panel-by-panel reading flow so every reveal lands exactly when
                  it should.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Show when="signed-out">
                    <SignUpButton>
                      <button className="rounded-md bg-gray-950 px-5 py-3 text-base font-bold text-white hover:bg-gray-800">
                        Start reading
                      </button>
                    </SignUpButton>
                    <SignInButton>
                      <button className="rounded-md border border-gray-300 px-5 py-3 text-base font-bold text-gray-800 hover:bg-gray-100">
                        I already have an account
                      </button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <button
                      type="button"
                      onClick={() => void router.push("/reader")}
                      className="rounded-md bg-gray-950 px-5 py-3 text-center text-base font-bold text-white hover:bg-gray-800"
                    >
                      Open reader
                    </button>
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
                  <div className="space-y-4 p-4">
                    <div className="rounded-sm border border-white/10 bg-[#f7f5ef] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-normal text-gray-500">
                          Step 1
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[0.7rem] font-bold text-emerald-800">
                          Active
                        </span>
                      </div>
                      <p className="text-sm font-black text-gray-950">
                        Paste an OP Chapters link
                      </p>
                      <div className="mt-3 flex items-center gap-2 rounded-md border border-gray-300 bg-white p-2 shadow-sm">
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-600">
                          https://opchapters.com/chapters/1138
                        </span>
                        <span className="rounded-md bg-gray-950 px-3 py-2 text-xs font-bold text-white">
                          Load
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
                      <div className="rounded-sm border border-white/10 bg-[#1f2937] p-3">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[0.7rem] font-black uppercase tracking-normal text-gray-400">
                            Step 2
                          </span>
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-sm border border-emerald-300 bg-emerald-300/15 p-2">
                            <div className="h-10 rounded-sm bg-emerald-200/30" />
                            <p className="mt-2 text-[0.65rem] font-bold text-emerald-100">
                              Panel 03
                            </p>
                          </div>
                          <div className="rounded-sm bg-gray-800 p-2">
                            <div className="h-12 rounded-sm bg-gray-700" />
                            <p className="mt-2 text-[0.65rem] font-bold text-gray-400">
                              Hidden next
                            </p>
                          </div>
                          <div className="rounded-sm bg-gray-800 p-2">
                            <div className="h-8 rounded-sm bg-gray-700" />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-sm bg-[#f8f8f3] p-3">
                        <div className="flex h-72 items-center justify-center rounded-sm border-4 border-gray-950 bg-[radial-gradient(circle_at_30%_25%,#ffffff_0,#fff6bd_32%,#b8f4d0_68%,#93c5fd_100%)]">
                          <div className="w-3/4 rounded-md border-2 border-gray-950 bg-white/70 p-4 shadow-lg">
                            <div className="h-4 w-2/3 rounded-sm bg-gray-950" />
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <div className="h-16 rounded-sm bg-amber-200" />
                              <div className="h-16 rounded-sm bg-emerald-200" />
                              <div className="h-16 rounded-sm bg-sky-200" />
                            </div>
                            <div className="mt-4 h-3 w-1/2 rounded-sm bg-gray-950" />
                          </div>
                        </div>
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
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
