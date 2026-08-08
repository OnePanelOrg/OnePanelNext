import { useState, type FormEvent } from "react";
import { ui } from "../lib/theme";
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
      className="mt-6 border-3 border-dashed border-ink/40 p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(18rem,1.15fr)] sm:items-end">
        <div>
          <p className={ui.eyebrow}>Request a source</p>
          <h2 id="source-request-title" className={`mt-2 ${ui.h3}`}>
            Want another site supported?
          </h2>
          <p className={`mt-2 ${ui.prose}`}>
            Share a link from the site. Requests decide which chapter sources
            get added next.
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="requested-source-url"
            className={`block ${ui.eyebrow}`}
          >
            Website or chapter URL
          </label>
          <div className={`mt-2 flex flex-col ${ui.field} sm:flex-row`}>
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
              className={`${ui.input} py-2.5 text-[0.95rem]`}
            />
            <button
              type="submit"
              className="shrink-0 bg-ink px-5 py-2.5 font-display text-[0.95rem] font-extrabold text-white transition hover:bg-ink-soft"
            >
              Let us know
            </button>
          </div>
          <p
            id="source-request-message"
            role={error ? "alert" : "status"}
            className={`mt-2 min-h-5 font-mono text-[11px] uppercase tracking-[0.12em] ${
              error ? "text-ink" : "text-ink/55"
            }`}
          >
            {error ?? status}
          </p>
        </form>
      </div>
    </section>
  );
}
