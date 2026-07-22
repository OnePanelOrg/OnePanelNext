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

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OnePanel Reader",
  applicationCategory: "Entertainment",
  operatingSystem: "Web",
  url: "https://onepanel.app",
  description:
    "OnePanel Reader is a web app that reveals a manga chapter one panel at a time, so readers never see the next panel or page before they're ready for it.",
  offers: {
    "@type": "Offer",
    price: "4.99",
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "4.99",
      priceCurrency: "EUR",
      unitText: "MONTH",
    },
  },
};

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
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://onepanel.app" />
        <meta property="og:image" content="/icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://onepanel.app" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
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
                  OnePanel Reader is a spoiler-free manga reader: paste an OP
                  Chapters link and it turns the chapter into a focused,
                  panel-by-panel reading flow so every reveal lands exactly
                  when it should.
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
                  <div className="flex justify-center p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/preview.gif"
                      alt="OnePanel Reader panel-by-panel preview"
                      className="w-full max-w-[280px]"
                    />
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
