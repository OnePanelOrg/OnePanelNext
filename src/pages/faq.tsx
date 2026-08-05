import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    <div className="flex min-h-screen flex-col bg-[#f6f4ef] text-gray-950">
      <Header />
      <main className="flex-grow">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-4xl font-black leading-tight tracking-normal text-gray-950 sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Everything you need to know about bringing a chapter to OnePanel
              Reader. Still stuck? See the{" "}
              <Link
                href="/spoiler-free-manga-reader"
                className="font-semibold text-gray-950 underline underline-offset-4 hover:text-gray-700"
              >
                spoiler-free reading guide
              </Link>
              .
            </p>
          </div>
        </section>
        <section>
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <dl className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-lg font-bold text-gray-950">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-gray-700">{faq.answer}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-12 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
              <h2 className="text-2xl font-black text-gray-950">
                Have a chapter ready?
              </h2>
              <p className="mt-2 text-gray-700">
                Upload your comic or paste a supported link and read one panel
                at a time.
              </p>
              <Link
                href="/reader"
                className="mt-5 inline-block rounded-md bg-gray-950 px-5 py-3 text-base font-bold text-white hover:bg-gray-800"
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
