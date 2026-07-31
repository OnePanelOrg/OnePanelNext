import { useRef, useState } from "react";
import {
  CHAPTER_FILE_ACCEPT,
  describeChapterFiles,
  validateChapterFiles,
} from "../lib/upload-selection.mjs";

/**
 * @param {{
 *   childToParent: (files: File[]) => void | Promise<void>,
 *   disabled?: boolean,
 *   locked?: boolean,
 *   progress?: number | null
 * }} props
 */
const UploadForm = ({
  childToParent,
  disabled = false,
  locked = false,
  progress = null,
}) => {
  const unavailable = disabled || locked;
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
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validation = validateChapterFiles(files);
    if (!validation.valid) {
      setSelectionError(validation.message);
      return;
    }
    void childToParent(files);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!unavailable) setDragging(true);
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
          if (!unavailable) selectFiles(event.dataTransfer.files);
        }}
        className={`relative overflow-hidden rounded-md border-2 border-dashed px-5 py-8 text-center transition-colors ${
          isDragging
            ? "border-emerald-600 bg-emerald-50"
            : "border-gray-300 bg-[#faf9f6]"
        } ${unavailable ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={CHAPTER_FILE_ACCEPT}
          multiple
          disabled={unavailable}
          onChange={(event) => selectFiles(event.target.files)}
          className="sr-only"
        />
        <p className="text-lg font-black text-gray-950">
          {files.length > 0
            ? describeChapterFiles(files)
            : "Drop a comic onto the shelf"}
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          One CBZ, CBR, ZIP, RAR, or PDF—or a selection of page images.
        </p>
        {!unavailable && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {files.length > 0 ? "Choose different files" : "Choose files"}
          </button>
        )}
      </div>

      {selectionError && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {selectionError}
        </p>
      )}

      {disabled && (
        <div aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full bg-emerald-600 transition-[width] ${
                progress === null ? "w-full animate-pulse" : ""
              }`}
              style={progress === null ? undefined : { width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm font-semibold text-gray-700">
            {progress === null
              ? "Reading pages and finding panels…"
              : `Uploading… ${progress}%`}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={unavailable || files.length === 0}
        className="w-full rounded-md bg-gray-950 px-4 py-3 font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {disabled
          ? "Preparing chapter…"
          : locked
            ? "Sign in to import"
            : "Import chapter"}
      </button>
    </form>
  );
};

export default UploadForm;
