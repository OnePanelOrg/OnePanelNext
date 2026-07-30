import { z } from "zod";

export const segmentationModeSchema = z.enum(["standard", "gpt-5.6-layout"]);

export const DEFAULT_SEGMENTATION_MODE = "standard";

export const SEGMENTATION_MODES = [
  {
    id: "standard",
    label: "Standard",
    description: "Fast local panel detection for everyday page layouts.",
    tier: "free",
    showsCrown: false,
  },
  {
    id: "gpt-5.6-layout",
    label: "GPT-5.6 Layout",
    description: "Better panel detection for complex page layouts.",
    tier: "pro",
    showsCrown: true,
  },
];

/** @param {unknown} value */
export function parseSegmentationMode(value) {
  return segmentationModeSchema.parse(value);
}

/** @param {unknown} value */
export function findSegmentationMode(value) {
  const parsed = segmentationModeSchema.safeParse(value);
  return parsed.success
    ? SEGMENTATION_MODES.find((mode) => mode.id === parsed.data)
    : undefined;
}
