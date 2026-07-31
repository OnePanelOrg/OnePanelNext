const IMAGE_EXTENSIONS = new Set([
  "bmp",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "tif",
  "tiff",
  "webp",
]);
const CONTAINER_EXTENSIONS = new Set(["cbz", "cbr", "zip", "rar", "pdf"]);

export const CHAPTER_FILE_ACCEPT = [
  ".cbz",
  ".cbr",
  ".zip",
  ".rar",
  ".pdf",
  ...[...IMAGE_EXTENSIONS].map((extension) => `.${extension}`),
].join(",");

function extensionOf(filename) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function validateChapterFiles(files) {
  if (files.length === 0) {
    return { valid: false, message: "Choose a comic file or page images." };
  }

  const unsupported = files.find(
    (file) =>
      !IMAGE_EXTENSIONS.has(extensionOf(file.name)) &&
      !CONTAINER_EXTENSIONS.has(extensionOf(file.name)),
  );
  if (unsupported) {
    return {
      valid: false,
      message: `${unsupported.name} is not a supported comic or image format.`,
    };
  }

  const containers = files.filter((file) =>
    CONTAINER_EXTENSIONS.has(extensionOf(file.name)),
  );
  if (containers.length > 0 && files.length > 1) {
    return {
      valid: false,
      message: "Choose one CBZ, CBR, ZIP, RAR, or PDF—or select page images.",
    };
  }

  return { valid: true };
}

export function describeChapterFiles(files) {
  if (files.length === 1) return files[0].name;
  return `${files.length} page images`;
}
