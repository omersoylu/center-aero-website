"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useLang } from "@/lib/i18n";
import type { Segment } from "@/lib/content";
import { AirlinerTop, BizjetTop, DimLine, HelicopterTop, PlatformGlyph, airlinerScale, type PlatformKind } from "./aviation/drawings";
import { SectionHeading } from "./ui/section-heading";
import { Reveal } from "./ui/reveal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------------------------------------
 * Common-scale line-up — three representative types per segment, drawn to one scale.
 * Language-neutral: names and ICAO Doc 8643 designators are the same in both dictionaries.
 * ---------------------------------------------------------------------------------------------- */

// Published manufacturer figures, rounded to 0.1 m — verify against OEM airport-planning / spec sheets before launch.
type LineupType = { name: string; icao: string; kind: "airliner" | "helicopter" | "bizjet"; span: number; length: number; engines?: 2 | 3 | 4; engineAt?: number[] };
const LINEUP: Record<Segment["key"], { pxPerM: number; types: LineupType[] }> = {
  commercial: {
    pxPerM: 5.5,
    types: [
      { name: "A380-800", icao: "A388", kind: "airliner", span: 79.8, length: 72.7, engines: 4, engineAt: [0.32, 0.64] },
      { name: "787-9", icao: "B789", kind: "airliner", span: 60.1, length: 62.8, engines: 2, engineAt: [0.32] },
      { name: "737-800", icao: "B738", kind: "airliner", span: 35.8, length: 39.5, engines: 2 },
    ],
  },
  // for helicopters `span` is the main-rotor diameter
  rotary: {
    pxPerM: 22,
    types: [
      { name: "AW189", icao: "A189", kind: "helicopter", span: 14.6, length: 17.6 },
      { name: "AW139", icao: "A139", kind: "helicopter", span: 13.8, length: 16.7 },
      { name: "H145", icao: "EC45", kind: "helicopter", span: 11.0, length: 13.6 },
    ],
  },
  business: {
    pxPerM: 12,
    types: [
      { name: "Global 7500", icao: "GL7T", kind: "bizjet", span: 31.7, length: 33.8, engines: 2 },
      { name: "Falcon 7X", icao: "FA7X", kind: "bizjet", span: 26.2, length: 23.4, engines: 3 },
      { name: "Phenom 300", icao: "E55P", kind: "bizjet", span: 16.2, length: 15.9, engines: 2 },
    ],
  },
};

const GLYPH: Record<Segment["key"], PlatformKind> = { commercial: "airliner", rotary: "helicopter", business: "bizjet" };

/* Plate geometry (SVG units). */
const PLATE_W = 1100;
const PLATE_H = 470;
const DATUM_Y = 410; // aft-end datum: every silhouette parks its tail on this hairline
const DIM_Y = 434; // per-type span dimension
const SCALE_Y = 458; // 10 m scale bar
const GAP = 48; // clearance between wing tips / rotor discs

const r2 = (v: number) => Math.round(v * 100) / 100;

/*
 * Generator facts from ./aviation/drawings (base units per metre, centreline x, aft-end y), so each
 * silhouette can be scaled to the segment's px/m and parked with its tail on the datum:
 *   AirlinerTop   380×420 · 10 u/m · centreline 190·sx · aft 405·sy      (sx, sy from airlinerScale)
 *   HelicopterTop 300×360 · 20 u/m · centreline 150    · aft 150 + 207·sy (tail-rotor arc; the disc scales about (150,150))
 *   BizjetTop     280×260 · 10 u/m · centreline 140·sx · aft 242·sy — its winglets sit at ±134 u (26.8 m) on a
 *                 26.2 m base span, so 268/26.2 u/m keeps the tips exactly on the dimension line.
 */
function placement(type: LineupType, pxPerM: number): { k: number; cx: number; aft: number } {
  switch (type.kind) {
    case "airliner": {
      const { sx, sy } = airlinerScale(type.span, type.length);
      const k = pxPerM / 10;
      return { k, cx: 190 * sx * k, aft: 405 * sy * k };
    }
    case "helicopter": {
      const sy = type.length / 16.66;
      const k = pxPerM / 20;
      return { k, cx: 150 * k, aft: (150 + 207 * sy) * k };
    }
    case "bizjet": {
      const sx = type.span / 26.2;
      const sy = type.length / 23.4;
      const k = pxPerM / (268 / 26.2);
      return { k, cx: 140 * sx * k, aft: 242 * sy * k };
    }
  }
}

const SILHOUETTE = "text-graphite-800/90 fill-graphite-800/90";

function Silhouette({ type }: { type: LineupType }) {
  if (type.kind === "helicopter") return <HelicopterTop mode="silhouette" rotor={type.span} length={type.length} className={SILHOUETTE} />;
  if (type.kind === "bizjet") return <BizjetTop mode="silhouette" span={type.span} length={type.length} engines={type.engines === 3 ? 3 : 2} className={SILHOUETTE} />;
  return <AirlinerTop mode="silhouette" span={type.span} length={type.length} engines={type.engines === 4 ? 4 : 2} engineAt={type.engineAt} className={SILHOUETTE} />;
}

type PlateTextProps = { x: number; y: number; anchor?: "start" | "middle" | "end"; className?: string; children: string };

const CHAR_W = 6.6; // JetBrains Mono advance (0.6 em) + 0.06 em tracking at 10 px
const KNOCKOUT_PAD = 4;

/**
 * Plate lettering: mono, uppercase, tabular. `textLength` pins the rendered width so a paper
 * knock-out of known size can break the dimension line cleanly beneath the label in any font.
 */
function PlateText({ x, y, anchor = "middle", className, children }: PlateTextProps) {
  const width = r2(children.length * CHAR_W);
  const left = anchor === "middle" ? x - width / 2 : anchor === "start" ? x : x - width;
  return (
    <g className={className}>
      <rect x={r2(left - KNOCKOUT_PAD)} y={y - 7} width={r2(width + 2 * KNOCKOUT_PAD)} height={14} fill="#ffffff" />
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="central"
        className="font-mono"
        fontSize={10}
        letterSpacing="0.06em"
        textLength={width}
        lengthAdjust="spacing"
        fill="currentColor"
        style={{ textTransform: "uppercase", fontVariantNumeric: "tabular-nums" }}
      >
        {children}
      </text>
    </g>
  );
}

function Lineup({ segKey }: { segKey: Segment["key"] }) {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const { pxPerM, types } = LINEUP[segKey];
  const fmt = useMemo(() => new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), [lang]);

  /* Lay the types out left to right with their wing tips (or rotor discs) 48 units apart, centred on the plate. */
  const total = types.reduce((sum, ty) => sum + ty.span * pxPerM, 0) + GAP * (types.length - 1);
  const placed: { type: LineupType; x: number; w: number }[] = [];
  let cursor = (PLATE_W - total) / 2;
  for (const type of types) {
    const w = type.span * pxPerM;
    placed.push({ type, x: cursor, w });
    cursor += w + GAP;
  }
  const measure = types[0]?.kind === "helicopter" ? t.aircraft.lineup.rotor : t.aircraft.lineup.span;

  return (
    <div className="mt-7 rounded-2xl border border-graphite-200 bg-white p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <p className="text-sm font-semibold text-graphite-800">{t.aircraft.lineup.title}</p>
        <p className="dim-label text-graphite-400 md:max-w-md md:text-right">{t.aircraft.lineup.note}</p>
      </div>
      {/* The plate keeps a legible minimum width and scrolls sideways on narrow screens. */}
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${PLATE_W} ${PLATE_H}`} className="w-full min-w-[720px]" aria-hidden>
          <PlateText x={24} y={24} anchor="start" className="text-graphite-400">
            {measure}
          </PlateText>
          <line x1={0} y1={DATUM_Y} x2={PLATE_W} y2={DATUM_Y} className="stroke-graphite-200" strokeWidth={1} />
          {placed.map(({ type, x, w }, i) => {
            const { k, cx, aft } = placement(type, pxPerM);
            return (
              <motion.g
                key={type.icao}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.1 + i * 0.06 }}
              >
                <g transform={`translate(${r2(x + w / 2 - cx)} ${r2(DATUM_Y - aft)}) scale(${r2(k)})`}>
                  <Silhouette type={type} />
                </g>
                <DimLine x1={r2(x)} y1={DIM_Y} x2={r2(x + w)} y2={DIM_Y} label="" className="text-graphite-500" />
                <PlateText x={r2(x + w / 2)} y={DIM_Y} className="text-graphite-500">
                  {`${fmt.format(type.span)} m · ${type.name} · ${type.icao}`}
                </PlateText>
              </motion.g>
            );
          })}
          <DimLine x1={24} y1={SCALE_Y} x2={24 + 10 * pxPerM} y2={SCALE_Y} label="" className="text-graphite-400" />
          <PlateText x={24 + 5 * pxPerM} y={SCALE_Y} className="text-graphite-400">
            {t.aircraft.lineup.scale}
          </PlateText>
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Section
 * ---------------------------------------------------------------------------------------------- */

export function AircraftPlatforms() {
  const { t } = useLang();
  const [active, setActive] = useState<Segment["key"]>("commercial");
  const seg = t.aircraft.segments.find((s) => s.key === active) ?? t.aircraft.segments[0];

  return (
    <section id="aircraft" className="border-y border-graphite-200 bg-graphite-50">
      <div className="container-x py-24 md:py-32">
        <SectionHeading kicker={t.aircraft.kicker} title={t.aircraft.title} lead={t.aircraft.lead} />

        <Reveal delay={0.1} className="mt-12">
          {/* Full-bleed scroll strip on phones so the three labelled tabs never push the page sideways. */}
          <div className="-mx-6 -mb-4 overflow-x-auto px-6 pb-4 md:mx-0 md:mb-0 md:overflow-visible md:px-0 md:pb-0">
            <div role="tablist" aria-label={t.aircraft.kicker} className="inline-flex whitespace-nowrap rounded-full border border-graphite-200 bg-white p-1 shadow-card">
              {t.aircraft.segments.map((s) => {
                const on = s.key === active;
                return (
                  <button
                    key={s.key}
                    role="tab"
                    aria-selected={on}
                    type="button"
                    onClick={() => setActive(s.key)}
                    className="relative rounded-full px-4 py-2.5 text-[13px] font-semibold outline-none sm:px-5 sm:text-[14px]"
                  >
                    {on ? <motion.span layoutId="segment-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute inset-0 rounded-full bg-graphite-800" /> : null}
                    <span className={cn("relative z-10 transition-colors", on ? "text-white" : "text-graphite-500 hover:text-graphite-900")}>
                      <PlatformGlyph kind={GLYPH[s.key]} size={16} className="mr-2 -mt-0.5 inline-block align-middle" />
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={seg.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Lineup segKey={seg.key} />
            <p className="mt-7 max-w-2xl text-graphite-500">{seg.blurb}</p>
            <div className={cn("mt-8 grid gap-5", seg.families.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
              {seg.families.map((f, fi) => (
                <motion.div
                  key={f.maker}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 + fi * 0.08, ease: EASE }}
                  className="rounded-2xl border border-graphite-200 bg-white p-6 shadow-card"
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <p className="kicker" lang="en">
                      {f.maker}
                    </p>
                    <span className="dim-label ml-auto whitespace-nowrap text-graphite-400">
                      {String(f.models.length).padStart(2, "0")} {t.aircraft.typesLabel}
                    </span>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {f.models.map((m, mi) => (
                      <motion.li
                        key={m}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 + fi * 0.08 + mi * 0.03, ease: EASE }}
                        className="rounded-md border border-graphite-200 bg-graphite-50 px-2.5 py-1.5 font-mono text-[12px] text-graphite-700"
                      >
                        {m}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl border-l-2 border-emerald-500 pl-5 text-sm text-graphite-500">{t.aircraft.more}</p>
        </Reveal>
      </div>
    </section>
  );
}
