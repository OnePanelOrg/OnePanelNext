import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "../lib/auth";
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
    title: "Paste an OP Chapters link",
    body: "Copy a chapter URL from opchapters.com and paste it into OnePanel Reader.",
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

const SpoilerFreeMangaReader: NextPage = () => {
  return (
    <>
      <Head>
        <title>Spoiler-Free Manga Reader | OnePanel Reader</title>
        <meta
          name="description"
          content="OnePanel Reader is a spoiler-free manga reader that shows OP Chapters links one panel at a time, so the next reveal never shows up before you're ready."
        />
        <meta
          property="og:title"
          content="Spoiler-Free Manga Reader | OnePanel Reader"
        />
        <meta
          property="og:description"
          content="A panel-by-panel manga reader for OP Chapters that keeps every reveal off-screen until you get to it."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://onepanel.app/spoiler-free-manga-reader"
        />
        <meta property="og:image" content="/icon.png" />
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
                A spoiler-free manga reader for OP Chapters
              </h1>
              <p className="mt-5 text-lg leading-8 text-gray-700">
                OnePanel Reader is a web app that turns an OP Chapters chapter
                link into a panel-by-panel reading flow, so you only ever see
                one panel at a time and every reveal lands exactly when you
                get to it.
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
                  <Link
                    href="/reader"
                    className="rounded-md bg-gray-950 px-5 py-3 text-center text-base font-bold text-white hover:bg-gray-800"
                  >
                    Open reader
                  </Link>
                </Show>
              </div>
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
            </div>
          </section>

          <section>
            <div className="container mx-auto max-w-3xl px-4 py-12">
              <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
                Who OnePanel Reader is for
              </h2>
              <p className="mt-4 text-gray-700">
                OnePanel Reader is built for people who read manga on{" "}
                <a
                  href="https://opchapters.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
                >
                  OP Chapters
                </a>{" "}
                and want every reveal to land cleanly, especially readers on
                desktop or tablet, where a full page shows more of the next
                panel than a phone screen does. OnePanel Pro costs
                &euro;4.99 per month, with no free trial, and can be
                cancelled any time. See the{" "}
                <Link
                  href="/faq"
                  className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
                >
                  FAQ
                </Link>{" "}
                for details on pricing and supported sources.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SpoilerFreeMangaReader;
