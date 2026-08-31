import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ui } from "../lib/theme";

const faqs = [
  {
    question: "What is OnePanel Reader?",
    answer:
      "OnePanel Reader is a web app that reveals a manga chapter one panel at a time, so you never see the next panel or page before you're ready for it.",
  },
  {
    question: "How does OnePanel Reader prevent spoilers?",
    answer:
      "Instead of showing a full scanned page with several panels at once, OnePanel splits the chapter into individual panels in reading order and shows only the current one. You move forward and back with the left and right arrow keys.",
  },
  {
    question: "Which chapter sources does OnePanel Reader support?",
    answer:
      "You can upload one CBZ, CBR, ZIP, RAR, or PDF comic, select multiple JPG, JPEG, PNG, or WebP page images, or paste a chapter URL from opchapters.com or tcbonepiecechapters.com. Multiple images are ordered by filename.",
  },
  {
    question: "What happens to uploaded files?",
    answer:
      "Uploaded files are deleted after analysis. OnePanel keeps only the panel layout data, and you will need your original files again after the current browser session ends.",
  },
  {
    question: "How much does OnePanel Reader cost?",
    answer:
      "Standard mode is free, with no card or trial required. OnePanel Pro is €4.99 per month and adds GPT‑5.6 Layout for better panel detection on complex page layouts.",
  },
  {
    question: "Can I cancel my subscription any time?",
    answer:
      "Yes. Billing is handled by Stripe, and you can cancel or manage your subscription any time from the billing portal in your account.",
  },
  {
    question: "Do I need an account to use OnePanel Reader?",
    answer:
      "You can paste a supported chapter link and use Standard mode without an account. File uploads require sign-in. Subscribe to OnePanel Pro when you want GPT‑5.6 Layout.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const Faq: NextPage = () => (
  <>
    <Head>
      <title>FAQ | OnePanel Reader</title>
      <meta
        name="description"
        content="Answers about OnePanel Reader pricing, supported comic uploads and chapter links, file privacy, and spoiler-free panel-by-panel reading."
      />
      <meta property="og:title" content="FAQ | OnePanel Reader" />
      <meta
        property="og:description"
        content="Common questions about comic uploads, supported chapter sources, pricing, privacy, and spoiler-free reading."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://onepanel.app/faq" />
      <meta property="og:image" content="https://onepanel.app/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href="https://onepanel.app/faq" />
      <link rel="icon" href="/favicon.ico" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </Head>
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />
      <main className="flex-grow">
        <section className={ui.rule}>
          <div className={`${ui.containerNarrow} py-14`}>
            <p className={ui.eyebrow}>Questions</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className={`mt-5 ${ui.lead}`}>
              Everything you need to know about bringing a chapter to OnePanel
              Reader. Still stuck? See the{" "}
              <Link
                href="/spoiler-free-manga-reader"
                className="font-semibold text-ink underline underline-offset-4 hover:bg-marker"
              >
                spoiler-free reading guide
              </Link>
              .
            </p>
          </div>
        </section>
        <section>
          <div className={`${ui.containerNarrow} py-14`}>
            <dl className="divide-y-3 divide-ink border-y-3 border-ink">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <dt className="font-display text-lg font-extrabold tracking-[-0.02em] text-ink">
                    {faq.question}
                  </dt>
                  <dd className={`mt-2 ${ui.prose}`}>{faq.answer}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-12 bg-ink p-8 text-center text-paper">
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">
                Have a chapter ready?
              </h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-paper/70">
                Upload your comic or paste a supported link and read one panel
                at a time.
              </p>
              <Link
                href="/#start-reader"
                className="mt-6 inline-flex items-center justify-center bg-paper px-5 py-3 font-display text-base font-extrabold tracking-tight text-ink transition hover:bg-marker"
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

export default Faq;
