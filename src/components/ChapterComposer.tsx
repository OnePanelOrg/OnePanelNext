import { useEffect, useRef, useState } from "react";
import { SEGMENTATION_MODES } from "../lib/segmentation-modes.mjs";

export type ChapterMode = "standard" | "gpt-5.6-layout";

const modes = SEGMENTATION_MODES as ReadonlyArray<{
  id: ChapterMode;
  label: string;
  tier: "free" | "pro";
  description: string;
  showsCrown: boolean;
}>;

type Props = {
  disabled: boolean;
  mode: ChapterMode;
  onModeChange: (mode: ChapterMode) => void;
  onSubmit: (url: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
};

export default function ChapterComposer({
  disabled,
  mode,
  onModeChange,
  onSubmit,
  url,
  onUrlChange,
}: Props) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const selected = modes.find((item) => item.id === mode);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menu.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  if (!selected) return null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(url);
      }}
      aria-busy={disabled}
    >
      <label htmlFor="chapter-url" className="sr-only">
        Chapter URL
      </label>
      <textarea
        id="chapter-url"
        rows={4}
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        required
        disabled={disabled}
        value={url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="Paste an OP Chapters or TCB chapter link…"
        className="block w-full resize-none border-0 bg-transparent px-5 pt-5 text-lg text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-gray-500"
      />
      <div className="flex items-end justify-between gap-3 border-t border-gray-200 px-4 py-3">
        <div ref={menu} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isMenuOpen}
            aria-controls="chapter-mode-menu"
            disabled={disabled}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed"
          >
            {selected.showsCrown && <span aria-hidden="true">♛ </span>}
            {selected.label}
            <span aria-hidden="true" className="ml-2 text-gray-500">
              ⌄
            </span>
          </button>
          {isMenuOpen && (
            <div
              id="chapter-mode-menu"
              role="listbox"
              aria-label="Panel detection mode"
              className="absolute bottom-full left-0 z-10 mb-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
            >
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={mode === item.id}
                  onClick={() => {
                    onModeChange(item.id);
                    setMenuOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-3 text-left hover:bg-gray-100"
                >
                  <span className="flex items-center justify-between gap-3 font-bold">
                    <span>
                      {item.showsCrown && <span aria-hidden="true">♛ </span>}
                      {item.label}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      {item.tier === "pro" ? "Pro" : "Free"}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm font-normal text-gray-600">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={disabled}
          aria-label={disabled ? "Processing chapter" : "Process chapter"}
          className="grid h-11 w-11 place-items-center rounded-full bg-gray-950 text-xl font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <span aria-hidden="true">{disabled ? "…" : "↑"}</span>
        </button>
      </div>
    </form>
  );
}
