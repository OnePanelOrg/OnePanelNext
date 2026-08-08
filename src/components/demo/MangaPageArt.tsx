import { useId } from "react";

/**
 * A stylised manga page used across the marketing pages.
 *
 * It is deliberately abstract line art rather than a real scan: the argument
 * the landing page makes is about panel order and timing, and abstract panels
 * make that argument without shipping someone else's artwork.
 */

export type PanelKind =
  | "dialogue"
  | "closeup"
  | "action"
  | "reaction"
  | "aside"
  | "reveal";

export type Panel = {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: PanelKind;
  beat: string;
};

export const PAGE_WIDTH = 400;
export const PAGE_HEIGHT = 560;

export const PANELS: Panel[] = [
  { index: 0, x: 12, y: 12, w: 236, h: 158, kind: "dialogue", beat: "Setup" },
  { index: 1, x: 256, y: 12, w: 132, h: 158, kind: "closeup", beat: "Look" },
  { index: 2, x: 12, y: 182, w: 376, h: 116, kind: "action", beat: "Move" },
  { index: 3, x: 12, y: 310, w: 146, h: 116, kind: "reaction", beat: "Beat" },
  { index: 4, x: 170, y: 310, w: 218, h: 116, kind: "aside", beat: "Turn" },
  { index: 5, x: 12, y: 438, w: 376, h: 110, kind: "reveal", beat: "Reveal" },
];

const line = {
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Balloon({
  cx,
  cy,
  rx,
  ry,
  tail,
  lines = 3,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tail: [number, number];
  lines?: number;
}) {
  const step = (ry * 1.1) / Math.max(lines, 1);
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        {...line}
        fill="var(--panel-paper, #fff)"
        strokeWidth={2}
      />
      <path
        d={`M${cx - rx * 0.2} ${cy + ry * 0.85} L${tail[0]} ${tail[1]} L${cx + rx * 0.18} ${cy + ry * 0.92} Z`}
        {...line}
        fill="var(--panel-paper, #fff)"
        strokeWidth={2}
      />
      {Array.from({ length: lines }, (_, i) => {
        const y = cy - step * ((lines - 1) / 2) + step * i;
        const width = rx * (i === lines - 1 ? 0.7 : 1.15);
        return (
          <line
            key={i}
            x1={cx - width / 2}
            y1={y}
            x2={cx + width / 2}
            y2={y}
            {...line}
            strokeWidth={3}
            opacity={0.42}
          />
        );
      })}
    </g>
  );
}

function Figure({
  x,
  y,
  s,
  flip = false,
}: {
  x: number;
  y: number;
  s: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <path
        d="M0 40 C0 22 8 14 20 14 C32 14 40 22 40 40 L40 60 L0 60 Z"
        fill="currentColor"
        opacity={0.86}
      />
      <circle cx={20} cy={7} r={11} fill="currentColor" opacity={0.86} />
      <path d="M9 2 L20 -6 L31 2 Z" fill="currentColor" opacity={0.86} />
    </g>
  );
}

function SpeedLines({
  w,
  h,
  count = 22,
  angle = -14,
}: {
  w: number;
  h: number;
  count?: number;
  angle?: number;
}) {
  return (
    <g transform={`rotate(${angle} ${w / 2} ${h / 2})`} opacity={0.4}>
      {Array.from({ length: count }, (_, i) => {
        const y = (h / count) * i - h * 0.15;
        return (
          <line
            key={i}
            x1={-w * 0.3}
            y1={y}
            x2={w * 1.3}
            y2={y + 3}
            {...line}
            strokeWidth={i % 3 === 0 ? 2.4 : 1}
          />
        );
      })}
    </g>
  );
}

function Burst({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g opacity={0.5}>
      {Array.from({ length: 28 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 28;
        const inner = r * (i % 2 === 0 ? 0.28 : 0.4);
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * inner}
            y1={cy + Math.sin(a) * inner}
            x2={cx + Math.cos(a) * r}
            y2={cy + Math.sin(a) * r}
            {...line}
            strokeWidth={i % 2 === 0 ? 3 : 1.2}
          />
        );
      })}
    </g>
  );
}

function PanelContent({ panel, dots }: { panel: Panel; dots: string }) {
  const { w, h, kind } = panel;

  if (kind === "dialogue") {
    return (
      <>
        <rect x={0} y={h * 0.55} width={w} height={h * 0.45} fill={dots} />
        <Figure x={w * 0.08} y={h * 0.46} s={1.15} />
        <Figure x={w * 0.82} y={h * 0.52} s={0.95} flip />
        <Balloon
          cx={w * 0.34}
          cy={h * 0.26}
          rx={w * 0.24}
          ry={h * 0.16}
          tail={[w * 0.24, h * 0.56]}
        />
        <Balloon
          cx={w * 0.74}
          cy={h * 0.2}
          rx={w * 0.17}
          ry={h * 0.11}
          tail={[w * 0.82, h * 0.44]}
          lines={2}
        />
      </>
    );
  }

  if (kind === "closeup") {
    return (
      <>
        <rect x={0} y={0} width={w} height={h} fill={dots} />
        {[0.32, 0.68].map((fx, i) => (
          <g key={i}>
            <path
              d={`M${w * fx - 34} ${h * 0.5} Q${w * fx} ${h * 0.5 - 30} ${w * fx + 34} ${h * 0.5} Q${w * fx} ${h * 0.5 + 22} ${w * fx - 34} ${h * 0.5} Z`}
              {...line}
              fill="var(--panel-paper, #fff)"
              strokeWidth={2.6}
            />
            <circle
              cx={w * fx}
              cy={h * 0.5 - 3}
              r={11}
              fill="currentColor"
              opacity={0.9}
            />
            <circle cx={w * fx + 4} cy={h * 0.5 - 7} r={3.4} fill="#fff" />
            <path
              d={`M${w * fx - 36} ${h * 0.5 - 16} Q${w * fx} ${h * 0.5 - 42} ${w * fx + 36} ${h * 0.5 - 16}`}
              {...line}
              strokeWidth={5}
            />
          </g>
        ))}
        <SpeedLines w={w} h={h} count={9} angle={90} />
      </>
    );
  }

  if (kind === "action") {
    return (
      <>
        <SpeedLines w={w} h={h} />
        <path
          d={`M${w * 0.36} ${h} L${w * 0.46} ${h * 0.3} L${w * 0.54} ${h * 0.52} L${w * 0.63} ${h * 0.12} L${w * 0.7} ${h} Z`}
          fill="currentColor"
          opacity={0.88}
        />
        <path
          d={`M${w * 0.12} ${h * 0.78} Q${w * 0.3} ${h * 0.2} ${w * 0.48} ${h * 0.4}`}
          {...line}
          strokeWidth={3}
          opacity={0.7}
        />
      </>
    );
  }

  if (kind === "reaction") {
    return (
      <>
        <rect x={0} y={0} width={w} height={h} fill={dots} />
        <Figure x={w * 0.34} y={h * 0.42} s={1.1} />
        <path
          d={`M${w * 0.74} ${h * 0.22} q10 16 0 22 q-10 -6 0 -22 Z`}
          fill="currentColor"
          opacity={0.55}
        />
        <SpeedLines w={w} h={h} count={7} angle={0} />
      </>
    );
  }

  if (kind === "aside") {
    return (
      <>
        <rect x={0} y={0} width={w} height={h * 0.45} fill={dots} />
        <Figure x={w * 0.06} y={h * 0.38} s={1.05} />
        <Balloon
          cx={w * 0.62}
          cy={h * 0.44}
          rx={w * 0.3}
          ry={h * 0.3}
          tail={[w * 0.34, h * 0.86]}
          lines={4}
        />
      </>
    );
  }

  return (
    <>
      <rect x={0} y={0} width={w} height={h} fill={dots} />
      <Burst cx={w * 0.5} cy={h * 0.56} r={h * 0.8} />
      <path
        d={`M${w * 0.38} ${h} L${w * 0.42} ${h * 0.34} L${w * 0.5} ${h * 0.16} L${w * 0.58} ${h * 0.34} L${w * 0.62} ${h} Z`}
        fill="currentColor"
      />
      <circle cx={w * 0.5} cy={h * 0.2} r={h * 0.13} fill="currentColor" />
      <path
        d={`M${w * 0.2} ${h * 0.9} L${w * 0.8} ${h * 0.9}`}
        {...line}
        strokeWidth={2}
        opacity={0.3}
      />
    </>
  );
}

type Props = {
  /** Panels to draw. Anything not listed is left as an empty frame. */
  visible?: number[];
  /** Panel drawn at full strength. Others are dimmed. */
  focus?: number | null;
  className?: string;
  frameStrokeWidth?: number;
};

export default function MangaPageArt({
  visible,
  focus = null,
  className,
  frameStrokeWidth = 3,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const dotsId = `dots-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
      className={className}
      role="img"
      aria-label="A manga page laid out in six panels, ending with the chapter's reveal."
    >
      <defs>
        <pattern
          id={dotsId}
          width={7}
          height={7}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(20)"
        >
          <circle cx={1.6} cy={1.6} r={1.25} fill="currentColor" opacity={0.2} />
        </pattern>
      </defs>

      {PANELS.map((panel) => {
        const shown = visible ? visible.includes(panel.index) : true;
        const dimmed = focus !== null && focus !== panel.index;
        return (
          <g key={panel.index}>
            <clipPath id={`clip-${uid}-${panel.index}`}>
              <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} />
            </clipPath>
            <rect
              x={panel.x}
              y={panel.y}
              width={panel.w}
              height={panel.h}
              fill="var(--panel-paper, #fff)"
            />
            {shown && (
              <g
                clipPath={`url(#clip-${uid}-${panel.index})`}
                opacity={dimmed ? 0.16 : 1}
                style={{ transition: "opacity 320ms ease" }}
              >
                <g transform={`translate(${panel.x},${panel.y})`}>
                  <PanelContent panel={panel} dots={`url(#${dotsId})`} />
                </g>
              </g>
            )}
            <rect
              x={panel.x}
              y={panel.y}
              width={panel.w}
              height={panel.h}
              fill="none"
              stroke="currentColor"
              strokeWidth={frameStrokeWidth}
              opacity={dimmed ? 0.28 : 1}
              style={{ transition: "opacity 320ms ease" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
