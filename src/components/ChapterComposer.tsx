import { useEffect, useRef, useState } from "react";
import { SEGMENTATION_MODES } from "../lib/segmentation-modes.mjs";
import {
  CHAPTER_FILE_ACCEPT,
  describeChapterFiles,
  validateChapterFiles,
} from "../lib/upload-selection.mjs";

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
  onUrlSubmit: (url: string) => void;
  onFilesSubmit: (files: File[]) => void;
  url: string;
  onUrlChange: (url: string) => void;
  requiresAuth?: boolean;
  onAuthRequired?: () => void;
  progress?: number | null;
};

export default function ChapterComposer({
  disabled,
  mode,
  onModeChange,
  onUrlSubmit,
  onFilesSubmit,
  url,
  onUrlChange,
  requiresAuth = false,
  onAuthRequired,
  progress = null,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const selected = modes.find((item) => item.id === mode);
  const hasSource = files.length > 0 || url.trim().length > 0;

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menu.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  if (!selected) return null;

  function selectFiles(nextFiles: FileList | File[]) {
    const next = Array.from(nextFiles);
    const validation = validateChapterFiles(next);
    if (!validation.valid) {
      setFiles([]);
      setSelectionError(
        validation.message ?? "Choose a supported comic file or page images.",
      );
      return;
    }

    setFiles(next);
    setSelectionError(null);
    onUrlChange("");
    if (mode !== "standard") onModeChange("standard");
    if (requiresAuth) onAuthRequired?.();
  }

  function clearFiles() {
    setFiles([]);
    setSelectionError(null);
    if (input.current) input.current.value = "";
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (files.length > 0) {
          const validation = validateChapterFiles(files);
          if (!validation.valid) {
            setSelectionError(
              validation.message ??
                "Choose a supported comic file or page images.",
            );
            return;
          }
          if (requiresAuth) {
            onAuthRequired?.();
            return;
          }
          onFilesSubmit(files);
          return;
        }
        onUrlSubmit(url);
      }}
      aria-busy={disabled}
      className={`relative border-3 bg-white transition-colors ${
        isDragging ? "border-ink bg-marker/20" : "border-ink"
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled && event.dataTransfer.files.length > 0) {
          selectFiles(event.dataTransfer.files);
        }
      }}
    >
      <input
        ref={input}
        type="file"
        accept={CHAPTER_FILE_ACCEPT}
        multiple
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) selectFiles(event.target.files);
        }}
        className="sr-only"
      />

      <div className="flex min-h-48 items-center justify-center px-5 py-8 sm:min-h-56 sm:px-8">
        {files.length > 0 ? (
          <div className="flex w-full max-w-lg items-center justify-between gap-4 border-2 border-ink bg-paper px-4 py-3 text-left">
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-extrabold tracking-tight text-ink">
                {describeChapterFiles(files)}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/50">
                {files.length === 1 ? "Comic file ready" : "Page images ready"}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFiles}
              disabled={disabled}
              aria-label="Remove selected files"
              className="grid h-9 w-9 shrink-0 place-items-center text-xl text-ink hover:bg-newsprint disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="chapter-source" className="sr-only">
              Chapter URL
            </label>
            <textarea
              id="chapter-source"
              rows={3}
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={disabled}
              value={url}
              onChange={(event) => {
                setSelectionError(null);
                onUrlChange(event.target.value);
              }}
              onPaste={(event) => {
                if (event.clipboardData.files.length > 0) {
                  event.preventDefault();
                  selectFiles(event.clipboardData.files);
                }
              }}
              placeholder="Drop files or paste a chapter URL"
              className="block w-full resize-none border-0 bg-transparent p-0 text-center text-lg leading-relaxed text-ink placeholder:text-ink/45 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-ink/40 sm:text-xl"
            />
          </>
        )}
      </div>

      {selectionError && (
        <p
          role="alert"
          className="border-t-2 border-ink bg-marker px-4 py-2 text-sm font-medium text-ink"
        >
          {selectionError}
        </p>
      )}

      {disabled && (
        <div className="border-t-2 border-ink/15" aria-live="polite">
          <div className="h-1 bg-newsprint">
            <div
              className={`h-full bg-ink transition-[width] ${
                progress === null ? "w-full animate-pulse" : ""
              }`}
              style={progress === null ? undefined : { width: `${progress}%` }}
            />
          </div>
          <p className="px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink/55">
            {progress === null
              ? "Reading pages and finding panels"
              : `Uploading ${progress}%`}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t-2 border-ink px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={disabled}
            className="inline-flex h-10 items-center gap-2 border-2 border-ink px-3 font-display text-sm font-extrabold tracking-tight text-ink transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span
              aria-hidden="true"
              className="text-xl font-normal leading-none"
            >
              +
            </span>
            <span className="hidden sm:inline">Add files</span>
            <span className="sm:hidden">Files</span>
          </button>

          <div className="h-8 w-px bg-ink/20" aria-hidden="true" />

          <div ref={menu} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isMenuOpen}
              aria-controls="chapter-mode-menu"
              disabled={disabled || files.length > 0}
              onClick={() => setMenuOpen((open) => !open)}
              className="px-2 py-2 text-left font-display text-sm font-extrabold tracking-tight text-ink hover:bg-newsprint disabled:cursor-not-allowed disabled:text-ink/45 sm:px-3"
            >
              {selected.showsCrown && <span aria-hidden="true">♛ </span>}
              {selected.label}
              <span aria-hidden="true" className="ml-2 text-ink/50">
                ⌄
              </span>
            </button>
            {isMenuOpen && (
              <div
                id="chapter-mode-menu"
                role="listbox"
                aria-label="Panel detection mode"
                className="absolute bottom-full left-0 z-10 mb-3 w-72 overflow-hidden border-3 border-ink bg-white"
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
                    className="block w-full border-b-2 border-ink/10 px-3 py-3 text-left last:border-b-0 hover:bg-marker"
                  >
                    <span className="flex items-center justify-between gap-3 font-display font-extrabold tracking-tight">
                      <span>
                        {item.showsCrown && <span aria-hidden="true">♛ </span>}
                        {item.label}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
                        {item.tier === "pro" ? "Pro" : "Free"}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm font-normal text-ink/65">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !hasSource}
          aria-label={disabled ? "Processing chapter" : "Import chapter"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-xl font-bold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-white"
        >
          <span aria-hidden="true">{disabled ? "…" : "↑"}</span>
        </button>
      </div>
    </form>
  );
}
