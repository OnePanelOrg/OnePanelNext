import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Show, SignInButton } from "../lib/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageRedactionDemo from "../components/demo/PageRedactionDemo";
import { ui } from "../lib/theme";

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
    body: "Upload a CBZ, CBR, ZIP, RAR, or PDF comic, select multiple page images, or paste an OP Chapters or TCB link.",
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
  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
    <Show when="signed-out">
      <Link href="/#start-reader" className={ui.button}>
        Start reading free
      </Link>
      <SignInButton>
        <button className={ui.buttonGhost}>Sign in</button>
      </SignInButton>
    </Show>
    <Show when="signed-in">
      <Link href="/#start-reader" className={ui.button}>
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
        content="Turn your comic files, page images, or OP Chapters and TCB links into a spoiler-free panel-by-panel manga reader. Standard detection is free."
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
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />
      <main className="flex-grow">
        <section className={ui.rule}>
          <div className={`${ui.containerNarrow} py-14`}>
            <p className={ui.eyebrow}>How it works</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-5xl">
              A spoiler-free manga reader for your own chapters
            </h1>
            <p className={`mt-5 ${ui.lead}`}>
              OnePanel Reader turns comic files, page images, and OP Chapters or
              TCB links into a panel-by-panel reading flow, so every reveal
              lands exactly when you get to it. Standard panel detection is
              free.
            </p>
            <ReaderCta />
          </div>
        </section>

        <section className={ui.rule}>
          <div className={`${ui.container} py-14`}>
            <h2 className={ui.h2}>Why manga scans spoil themselves</h2>
            <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
              <div className="space-y-6">
                {spoilerCauses.map((cause) => (
                  <div key={cause.title} className="border-l-3 border-ink pl-4">
                    <h3 className={ui.h3}>{cause.title}</h3>
                    <p className={`mt-2 ${ui.prose}`}>{cause.body}</p>
                  </div>
                ))}
              </div>
              <PageRedactionDemo />
            </div>
          </div>
        </section>

        <section className={ui.rule}>
          <div className={`${ui.containerNarrow} py-14`}>
            <h2 className={ui.h2}>How OnePanel Reader fixes it</h2>
            <ol className="mt-8 space-y-8">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-ink font-mono text-xs font-semibold text-paper">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={ui.h3}>{step.title}</h3>
                    <p className={`mt-2 ${ui.prose}`}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mx-auto mt-12 max-w-xl overflow-hidden border-3 border-ink bg-ink">
              <div className="border-b-3 border-ink bg-ink px-4 py-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  The reader, running
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

        <section className={ui.rule}>
          <div className={`${ui.containerNarrow} py-14`}>
            <h2 className={ui.h2}>Read from the source you already have</h2>
            <p className={`mt-5 ${ui.lead}`}>
              Import a comic archive or PDF, choose page images from your
              device, or paste a chapter URL from{" "}
              <a
                href="https://opchapters.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline underline-offset-4 hover:bg-marker"
              >
                OP Chapters
              </a>{" "}
              or{" "}
              <a
                href="https://tcbonepiecechapters.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline underline-offset-4 hover:bg-marker"
              >
                TCB One Piece Chapters
              </a>
              . Uploaded files require an account and are deleted after
              analysis; only the panel layout remains for the current browser
              session. Standard mode is free, while OnePanel Pro adds GPT‑5.6
              Layout for complex pages. See the{" "}
              <Link
                href="/faq"
                className="font-semibold text-ink underline underline-offset-4 hover:bg-marker"
              >
                FAQ
              </Link>{" "}
              for details.
            </p>
          </div>
        </section>

        <section className="bg-ink text-paper">
          <div className={`${ui.containerNarrow} py-16`}>
            <h2 className="font-display text-[clamp(1.8rem,4.5vw,2.75rem)] font-extrabold leading-[1] tracking-[-0.035em]">
              Ready to keep the next reveal off-screen?
            </h2>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-paper/70">
              Bring a chapter and start reading it one panel at a time.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#start-reader"
                className="inline-flex items-center justify-center bg-paper px-5 py-3 font-display text-base font-extrabold tracking-tight text-ink transition hover:bg-marker"
              >
                Start reading free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  </>
);

export default SpoilerFreeMangaReader;
