import { useState, type FormEvent } from "react";
import { createSourceRequestMailto } from "../lib/source-request.mjs";

export default function SourceRequestForm() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mailto = createSourceRequestMailto(sourceUrl);
    if (!mailto) {
      setStatus(null);
      setError("Enter a valid website or chapter URL.");
      return;
    }

    setError(null);
    setStatus("Your email app should open with the request ready to send.");
    window.location.href = mailto;
  }

  return (
    <section
      aria-labelledby="source-request-title"
      className="mx-auto mt-6 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(18rem,1.15fr)] sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
            Request a source
          </p>
          <h2
            id="source-request-title"
            className="mt-1 text-xl font-black text-gray-950"
          >
            Want another website supported?
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Share a link from the site. We use requests to decide which chapter
            sources to add next.
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="requested-source-url"
            className="text-sm font-bold text-gray-900"
          >
            Website or chapter URL
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="requested-source-url"
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={sourceUrl}
              onChange={(event) => {
                setSourceUrl(event.target.value);
                setError(null);
                setStatus(null);
              }}
              placeholder="https://example.com/chapter/…"
              aria-describedby="source-request-message"
              aria-invalid={Boolean(error)}
              className="min-w-0 flex-1 rounded-lg border-gray-300 bg-white text-gray-950 placeholder:text-gray-400 focus:border-emerald-600 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              Let us know
            </button>
          </div>
          <p
            id="source-request-message"
            role={error ? "alert" : "status"}
            className={`mt-2 min-h-5 text-sm font-medium ${
              error ? "text-red-700" : "text-emerald-800"
            }`}
          >
            {error ?? status}
          </p>
        </form>
      </div>
    </section>
  );
}
