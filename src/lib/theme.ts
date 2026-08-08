/**
 * Shared class strings for the OnePanel print look: ink rules, paper ground,
 * heavy display type, and a single marker highlight.
 *
 * These exist so a button on the reader page and a button on the FAQ cannot
 * drift apart. Anything used once belongs in its own file, not here.
 */

export const ui = {
  container: "mx-auto w-full max-w-6xl px-5",
  containerNarrow: "mx-auto w-full max-w-3xl px-5",

  eyebrow:
    "font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/60",
  micro: "font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50",

  h1: "font-display text-[clamp(2.15rem,6.6vw,4.6rem)] font-extrabold leading-[0.92] tracking-[-0.035em]",
  h2: "font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl",
  h3: "font-display text-xl font-extrabold leading-tight tracking-[-0.02em]",
  lead: "text-[1.0625rem] leading-[1.65] text-ink/75",
  prose: "text-[0.95rem] leading-relaxed text-ink/70",

  button:
    "inline-flex items-center justify-center bg-ink px-5 py-3 text-center font-display text-base font-extrabold tracking-tight text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-ink/40",
  buttonGhost:
    "inline-flex items-center justify-center border-3 border-ink bg-transparent px-5 py-3 text-center font-display text-base font-extrabold tracking-tight text-ink transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40",
  buttonSmall:
    "inline-flex items-center justify-center border-2 border-ink px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink",

  input:
    "min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-base text-ink placeholder:text-ink/35 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-ink/40",
  field: "border-3 border-ink bg-white",

  card: "border-3 border-ink bg-white",
  rule: "border-b-3 border-ink",

  /** Grid whose gap is the ink rule itself. */
  gridRules: "grid gap-px border-3 border-ink bg-ink",
  gridCell: "bg-paper p-6 sm:p-8",
} as const;
