import { useRef, useState } from "react";
import { ui } from "../lib/theme";
import {
  CHAPTER_FILE_ACCEPT,
  describeChapterFiles,
  validateChapterFiles,
} from "../lib/upload-selection.mjs";

/**
 * @param {{
 *   childToParent: (files: File[]) => void | Promise<void>,
 *   disabled?: boolean,
 *   requiresAuth?: boolean,
 *   onAuthRequired?: () => void,
 *   progress?: number | null
 * }} props
 */
const UploadForm = ({
  childToParent,
  disabled = false,
  requiresAuth = false,
  onAuthRequired,
  progress = null,
}) => {
  const inputRef = useRef(null);
  /** @type {[File[], import("react").Dispatch<import("react").SetStateAction<File[]>>]} */
  const [files, setFiles] = useState([]);
  /** @type {[string | null, import("react").Dispatch<import("react").SetStateAction<string | null>>]} */
  const [selectionError, setSelectionError] = useState(null);
  const [isDragging, setDragging] = useState(false);

  /** @param {FileList | File[]} nextFiles */
  function selectFiles(nextFiles) {
    const selected = Array.from(nextFiles);
    const validation = validateChapterFiles(selected);
    if (!validation.valid) {
      setFiles([]);
      setSelectionError(validation.message);
      return;
    }
    setFiles(selected);
    setSelectionError(null);
    if (requiresAuth) onAuthRequired?.();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validation = validateChapterFiles(files);
    if (!validation.valid) {
      setSelectionError(validation.message);
      return;
    }
    if (requiresAuth) {
      onAuthRequired?.();
      return;
    }
    void childToParent(files);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) selectFiles(event.dataTransfer.files);
        }}
        className={`relative overflow-hidden border-3 border-dashed px-5 py-8 text-center transition-colors ${
          isDragging ? "border-ink bg-marker" : "border-ink/40 bg-white"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={CHAPTER_FILE_ACCEPT}
          multiple
          disabled={disabled}
          onChange={(event) => selectFiles(event.target.files)}
          className="sr-only"
        />
        <p className={ui.h3}>
          {files.length > 0
            ? describeChapterFiles(files)
            : "Drop a comic here"}
        </p>
        <p className={`mt-2 ${ui.prose}`}>
          One CBZ, CBR, ZIP, RAR, or PDF, or a selection of page images.
        </p>
        {!disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`mt-4 ${ui.buttonSmall}`}
          >
            {files.length > 0 ? "Choose different files" : "Choose files"}
          </button>
        )}
      </div>

      {selectionError && (
        <p
          role="alert"
          className="border-l-3 border-ink bg-marker px-3 py-2 text-sm font-medium text-ink"
        >
          {selectionError}
        </p>
      )}

      {disabled && (
        <div aria-live="polite">
          <div className="h-2 overflow-hidden border-2 border-ink bg-white">
            <div
              className={`h-full bg-ink transition-[width] ${
                progress === null ? "w-full animate-pulse" : ""
              }`}
              style={progress === null ? undefined : { width: `${progress}%` }}
            />
          </div>
          <p className={`mt-2 text-center ${ui.micro}`}>
            {progress === null
              ? "Reading pages and finding panels"
              : `Uploading ${progress}%`}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || files.length === 0}
        className={`w-full ${ui.button}`}
      >
        {disabled ? "Preparing chapter…" : "Import chapter"}
      </button>
    </form>
  );
};

export default UploadForm;
