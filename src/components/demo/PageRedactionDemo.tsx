import { useId, useState } from "react";
import { ui } from "../../lib/theme";
import MangaPageArt, { PAGE_HEIGHT, PAGE_WIDTH, PANELS } from "./MangaPageArt";

const REVEAL = PANELS[PANELS.length - 1];

/**
 * The hero argument, as one control: the same page as a raw scan, then as
 * OnePanel reads it. Everything the reader has not reached stays under a bar.
 */
export default function PageRedactionDemo() {
  const [isOn, setOn] = useState(false);
  const [panel, setPanel] = useState(0);
  const barId = `bar-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const last = PANELS.length - 1;

  return (
    <figure className="m-0">
      <div className="flex items-center justify-between gap-4 border-3 border-b-0 border-ink bg-ink px-3 py-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          {isOn ? `Panel ${panel + 1} of ${PANELS.length}` : "Full page scan"}
        </p>
        <button
          type="button"
          onClick={() => {
            setOn((on) => !on);
            setPanel(0);
          }}
          aria-pressed={isOn}
          className="bg-marker px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-white"
        >
          {isOn ? "Show the raw page" : "Turn OnePanel on"}
        </button>
      </div>

      <div className="relative border-3 border-ink bg-white p-3 text-ink">
        <div className="relative">
          <MangaPageArt className="block w-full" focus={isOn ? panel : null} />

          <svg
            viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              {PANELS.map((p) => (
                <clipPath key={p.index} id={`${barId}-${p.index}`}>
                  <rect x={p.x} y={p.y} width={p.w} height={p.h} />
                </clipPath>
              ))}
            </defs>
            {PANELS.map((p) => {
              const lifted = !isOn || p.index <= panel;
              return (
                <g key={p.index} clipPath={`url(#${barId}-${p.index})`}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    fill="#0B0B0C"
                    className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none"
                    style={{
                      transform: lifted
                        ? `translateY(-${p.y + p.h + 4}px)`
                        : "translateY(0)",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          <div
            className={`pointer-events-none absolute transition-opacity duration-300 ${
              isOn ? "opacity-0" : "opacity-100"
            }`}
            style={{
              left: `${(((REVEAL?.x ?? 0) + 10) / PAGE_WIDTH) * 100}%`,
              top: `${(((REVEAL?.y ?? 0) + 10) / PAGE_HEIGHT) * 100}%`,
            }}
          >
            <p className="bg-marker px-2 py-1 font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-ink sm:text-[11px]">
              Your eye got here first
            </p>
          </div>
        </div>

        {isOn && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t-3 border-ink pt-3">
            <button
              type="button"
              onClick={() => setPanel((p) => Math.max(0, p - 1))}
              disabled={panel === 0}
              className={ui.buttonSmall}
            >
              Back
            </button>
            <div className="flex gap-1.5" aria-hidden="true">
              {PANELS.map((p) => (
                <span
                  key={p.index}
                  className={`h-1.5 w-6 ${p.index <= panel ? "bg-ink" : "bg-ink/20"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPanel((p) => Math.min(last, p + 1))}
              disabled={panel === last}
              className="inline-flex items-center justify-center border-2 border-ink bg-ink px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next panel
            </button>
          </div>
        )}
      </div>
      <figcaption className={`mt-3 ${ui.micro}`}>
        {isOn
          ? `${PANELS[panel]?.beat ?? ""} — nothing past this panel is on screen`
          : "Six panels, one screen, every reveal already visible"}
      </figcaption>
    </figure>
  );
}
