import { useId } from "react";
import { ui } from "../lib/theme";
import { useChapterSubmit } from "../lib/use-chapter-submit";

type Props = {
  /** Passed through to analytics so we can tell which form earned the chapter. */
  source: string;
  label?: string;
  submitLabel?: string;
};

/**
 * The one control that matters on the marketing pages: paste a chapter link and
 * start reading. Standard mode needs no account, so this works signed out.
 */
export default function ChapterLinkForm({
  source,
  label = "Paste a chapter link",
  submitLabel = "Read it panel by panel",
}: Props) {
  const { url, setUrl, isLoading, error, submit } = useChapterSubmit(source);
  const fieldId = `chapter-url-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit(url);
      }}
      aria-busy={isLoading}
      className="w-full"
    >
      <label htmlFor={fieldId} className={`mb-2 block ${ui.eyebrow}`}>
        {label}
      </label>
      <div className={`flex flex-col ${ui.field} sm:flex-row`}>
        <input
          id={fieldId}
          type="url"
          inputMode="url"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={isLoading}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://tcbonepiecechapters.com/chapters/..."
          className={ui.input}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`${ui.button} shrink-0`}
        >
          {isLoading ? "Cutting panels…" : submitLabel}
        </button>
      </div>
      <p className={`mt-2 ${ui.micro}`}>Free. No account. No card.</p>
      {error && (
        <p
          role="alert"
          className="mt-3 border-l-3 border-ink bg-marker px-3 py-2 text-sm font-medium text-ink"
        >
          {error}
        </p>
      )}
    </form>
  );
}
