import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Show, SignInButton } from "../lib/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";

const spoilerCauses = [
  {
    title: "Full-page scans show too much at once",
    body: "A single scanned page often contains three, four, or more panels. Your eyes land on the next reveal before you have finished reading the current one.",
  },
  {
    title: "Wide screens make it worse",
    body: "On a tablet or desktop monitor, a full manga page sits small in the middle of a lot of empty space, and the panels below the one you are reading are easy to see out of the corner of your eye.",
  },
  {
    title: "Scrolling ruins pacing",
    body: "Scrolling past a page to get to the next one frequently flashes the top of the following page, which is exactly where the next chapter's twist tends to live.",
  },
];

const steps = [
  {
    title: "Bring your own chapter",
    body: "Upload a CBZ, CBR, ZIP, RAR, or PDF comic, select multiple page images, or paste an OP Chapters link.",
  },
  {
    title: "OnePanel builds a panel-by-panel flow",
    body: "The chapter is split into individual panels in reading order, one reveal per screen.",
  },
  {
    title: "Read at your own pace",
    body: "Move forward and back with the left and right arrow keys. Nothing past the current panel is on screen.",
  },
];

const ReaderCta = () => (
  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
    <Show when="signed-out">
      <Link
        href="/reader"
        className="rounded-md bg-gray-950 px-5 py-3 text-center text-base font-bold text-white hover:bg-gray-800"
      >
        Start reading free
      </Link>
      <SignInButton>
        <button className="rounded-md border border-gray-300 px-5 py-3 text-base font-bold text-gray-800 hover:bg-gray-100">
          Sign in
        </button>
      </SignInButton>
    </Show>
    <Show when="signed-in">
      <Link
        href="/reader"
        className="rounded-md bg-gray-950 px-5 py-3 text-center text-base font-bold text-white hover:bg-gray-800"
      >
        Open reader
      </Link>
    </Show>
  </div>
);

const SpoilerFreeMangaReader: NextPage = () => (
  <>
    <Head>
      <title>Spoiler-Free Manga Reader | OnePanel Reader</title>
      <meta
        name="description"
        content="Turn your comic files, page images, or OP Chapters links into a spoiler-free panel-by-panel manga reader. Standard detection is free."
      />
      <meta
        property="og:title"
        content="Spoiler-Free Manga Reader | OnePanel Reader"
      />
      <meta
        property="og:description"
        content="Upload a comic or paste a chapter link, then read it one panel at a time without seeing the next reveal early."
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content="https://onepanel.app/spoiler-free-manga-reader"
      />
      <meta property="og:image" content="https://onepanel.app/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <link
        rel="canonical"
        href="https://onepanel.app/spoiler-free-manga-reader"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className="flex min-h-screen flex-col bg-[#f6f4ef] text-gray-950">
      <Header />
      <main className="flex-grow">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-4xl font-black leading-tight tracking-normal text-gray-950 sm:text-5xl">
              A spoiler-free manga reader for your own chapters
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              OnePanel Reader turns comic files, page images, and OP Chapters
              links into a panel-by-panel reading flow, so every reveal lands
              exactly when you get to it. Standard panel detection is free.
            </p>
            <ReaderCta />
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
              Why manga scans spoil themselves
            </h2>
            <div className="mt-6 space-y-6">
              {spoilerCauses.map((cause) => (
                <div
                  key={cause.title}
                  className="border-l-4 border-gray-950 pl-4"
                >
                  <h3 className="text-lg font-bold">{cause.title}</h3>
                  <p className="mt-1 text-gray-700">{cause.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
              How OnePanel Reader fixes it
            </h2>
            <ol className="mt-6 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-1 text-gray-700">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-md border border-gray-200 bg-[#111111] shadow-2xl">
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
                  alt="OnePanel Reader moving through a manga chapter one panel at a time"
                  className="w-full max-w-[280px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
              Read from the source you already have
            </h2>
            <p className="mt-4 text-gray-700">
              Import a comic archive or PDF, choose page images from your
              device, or paste a chapter URL from{" "}
              <a
                href="https://opchapters.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
              >
                OP Chapters
              </a>
              . Uploaded files require an account and are deleted after
              analysis; only the panel layout remains for the current browser
              session. Standard mode is free, while OnePanel Pro adds GPT‑5.6
              Layout for complex pages. See the{" "}
              <Link
                href="/faq"
                className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
              >
                FAQ
              </Link>{" "}
              for details.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
              Ready to keep the next reveal off-screen?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-700">
              Bring a chapter and start reading it one panel at a time.
            </p>
            <ReaderCta />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  </>
);

export default SpoilerFreeMangaReader;
