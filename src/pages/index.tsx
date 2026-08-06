import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ChapterLinkForm from "../components/ChapterLinkForm";
import PageRedactionDemo from "../components/demo/PageRedactionDemo";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../lib/auth";
import { ui } from "../lib/theme";

const copy = {
  eyebrow: "Spoiler-safe manga reader",
  headlineStart: "You read",
  headlineRedacted: "the last panel",
  headlineEnd: "first.",
  sub: "A manga page puts six panels in front of you at once. Your eye goes to the biggest one, and the biggest one is usually the reveal. OnePanel gives the chapter back its timing: one panel per screen, in the order it was drawn.",
};

const steps = [
  {
    n: "01",
    title: "Paste the link you already use",
    body: "OP Chapters and TCB links work as they are. Nothing to install, nothing to sign up for.",
  },
  {
    n: "02",
    title: "OnePanel cuts the page into panels",
    body: "Each page is read in order: left to right, top to bottom, the way the artist laid it out.",
  },
  {
    n: "03",
    title: "You move one beat at a time",
    body: "Arrow keys on desktop, tap on phone. Nothing past the current panel is on screen.",
  },
];

const plans = [
  {
    name: "Standard",
    price: "Free",
    note: "No account",
    body: "Every chapter drawn on a normal grid, which is most of them. Panels are detected on the spot and you start reading immediately.",
    features: [
      "Unlimited chapters",
      "OP Chapters and TCB links",
      "Phone, tablet, desktop",
    ],
  },
  {
    name: "Pro",
    price: "€4.99",
    note: "per month, cancel any time",
    body: "Some pages are drawn to break the grid: splash spreads, diagonal cuts, panels sitting inside other panels. Standard guesses at those. Pro reads them the way they were drawn.",
    features: [
      "Everything in Standard",
      "GPT-5.6 Layout for complex pages",
      "Upload your own CBZ, CBR, or PDF",
    ],
  },
];

const faqs = [
  {
    q: "Do I need an account?",
    a: "Not to read a link. Paste it and go. An account is only needed to upload your own files or to subscribe to Pro.",
  },
  {
    q: "Which sources work?",
    a: "OP Chapters and TCB One Piece Chapters today. If a source you read is missing, there is a request form inside the reader.",
  },
  {
    q: "Do you store the chapter?",
    a: "Uploaded files are deleted after analysis. Only the panel layout is kept, so you keep your place without us keeping the art.",
  },
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
  offers: [
    {
      "@type": "Offer",
      name: "OnePanel Standard",
      price: "0",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "OnePanel Pro",
      price: "4.99",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "4.99",
        priceCurrency: "EUR",
        unitText: "MONTH",
      },
    },
  ],
};

function Redactable({
  children,
  lifted,
}: {
  children: string;
  lifted: boolean;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className={lifted ? "opacity-100" : "opacity-0"}>{children}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-1 -inset-y-[0.06em] origin-bottom bg-ink transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none"
        style={{ transform: lifted ? "scaleY(0)" : "scaleY(1)" }}
      />
    </span>
  );
}

const Home: NextPage = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void router.replace("/reader");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLifted(true);
      return;
    }
    const timer = window.setTimeout(() => setLifted(true), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>OnePanel Reader</title>
        <meta
          name="description"
          content="Read manga chapters one panel at a time for free. OnePanel Reader turns chapter links into a focused spoiler-safe reading flow, with Pro detection for complex layouts."
        />
        <meta
          property="og:title"
          content="OnePanel Reader - Manga without accidental spoilers"
        />
        <meta
          property="og:description"
          content="Paste a manga chapter URL and read one panel at a time for free. Upgrade only when you want Pro detection for complex layouts."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://onepanel.app" />
        <meta property="og:image" content="https://onepanel.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://onepanel.app" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </Head>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-paper text-ink">
        <Header />
        <main className="flex-grow">
          <section className={ui.rule}>
            <div
              className={`${ui.container} grid gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16 lg:py-20`}
            >
              <div>
                <p className={ui.eyebrow}>{copy.eyebrow}</p>
                <h1 className={`mt-5 ${ui.h1}`}>
                  {copy.headlineStart}{" "}
                  <Redactable lifted={lifted}>
                    {copy.headlineRedacted}
                  </Redactable>{" "}
                  {copy.headlineEnd}
                </h1>
                <p className={`mt-6 max-w-xl ${ui.lead}`}>{copy.sub}</p>
                <div className="mt-9 max-w-xl">
                  <ChapterLinkForm source="landing_hero" />
                </div>
                <p
                  className={`mt-6 max-w-xl border-t-3 border-ink pt-4 ${ui.micro} leading-relaxed`}
                >
                  Works with OP Chapters and TCB · Arrow keys or tap ·{" "}
                  <Link href="/reader" className="underline hover:text-ink">
                    Or upload your own file
                  </Link>
                </p>
              </div>

              <div className="lg:sticky lg:top-8">
                <PageRedactionDemo />
              </div>
            </div>
          </section>

          <section className={`${ui.rule} bg-ink text-paper`}>
            <div className={`${ui.container} py-14 sm:py-20`}>
              <p className="max-w-4xl font-display text-[clamp(1.5rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.02em]">
                The problem was never the scan quality. It is that a page is a{" "}
                <mark className="bg-marker px-1 text-ink">layout</mark>, and a
                layout shows you the ending and the beginning at the same
                moment.
              </p>
            </div>
          </section>

          <section id="how" className={ui.rule}>
            <div className={`${ui.container} py-14 sm:py-20`}>
              <h2 className={ui.h2}>Three steps, no setup</h2>
              <ol className={`mt-10 ${ui.gridRules} md:grid-cols-3`}>
                {steps.map((step) => (
                  <li key={step.n} className={ui.gridCell}>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">
                      {step.n}
                    </p>
                    <h3 className={`mt-4 ${ui.h3}`}>{step.title}</h3>
                    <p className={`mt-3 ${ui.prose}`}>{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="pricing" className={ui.rule}>
            <div className={`${ui.container} py-14 sm:py-20`}>
              <div className="max-w-2xl">
                <h2 className={ui.h2}>Free covers the everyday chapter</h2>
                <p className={`mt-4 ${ui.lead}`}>
                  Pro exists for one reason: the chapters people wait a week for
                  are the ones with the complicated pages.
                </p>
              </div>
              <div className={`mt-10 ${ui.gridRules} md:grid-cols-2`}>
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={
                      plan.name === "Pro"
                        ? "bg-ink p-6 text-paper sm:p-8"
                        : ui.gridCell
                    }
                  >
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] opacity-55">
                      {plan.name}
                    </p>
                    <p className="mt-4 font-display text-5xl font-extrabold tracking-[-0.04em]">
                      {plan.price}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] opacity-55">
                      {plan.note}
                    </p>
                    <p className="mt-5 text-[0.95rem] leading-relaxed opacity-80">
                      {plan.body}
                    </p>
                    <ul className="mt-6 space-y-2 text-[0.95rem]">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span aria-hidden="true" className="opacity-40">
                            —
                          </span>
                          <span className="opacity-85">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={ui.rule}>
            <div className={`${ui.container} py-14 sm:py-20`}>
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <h2 className={ui.h2}>Before you paste anything</h2>
                <dl className="divide-y-3 divide-ink border-y-3 border-ink">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="py-5">
                      <dt className="font-display text-lg font-extrabold tracking-[-0.02em]">
                        {faq.q}
                      </dt>
                      <dd className={`mt-2 ${ui.prose}`}>{faq.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className={`mt-8 ${ui.micro}`}>
                <Link href="/faq" className="underline hover:text-ink">
                  Read the full FAQ
                </Link>
              </p>
            </div>
          </section>

          <section className="bg-ink text-paper">
            <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
              <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">
                Read the next chapter in the order it was drawn.
              </h2>
              <div className="mt-9 bg-paper p-5 text-left text-ink sm:p-7">
                <ChapterLinkForm source="landing_footer" />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
