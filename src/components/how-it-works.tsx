"use client";

/* Scroll-driven steps adapted from "Scroll Reveal Content A" by abui on 21st.dev:
   a sticky viewport, per-step progress bars fed by useScroll, and a synced visual panel. */

import { Fragment, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Check, Send } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Dictionary, Step } from "@/lib/content";
import { SectionHeading } from "./ui/section-heading";
import { Mark } from "./logo";
import { AirlinerTop, ANCHORS_737, Callout } from "./aviation/drawings";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function barHeight(progress: number, start: number, end: number) {
  if (progress <= start) return 0;
  if (progress >= end) return 100;
  return ((progress - start) / (end - start)) * 100;
}

export function HowItWorks() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  const steps = t.how.steps;
  const n = steps.length;
  const active = Math.min(n - 1, Math.max(0, Math.floor(progress * n)));

  return (
    <section id="how" className="bg-graphite-50">
      <div className="container-x pt-24 md:pt-32">
        <SectionHeading kicker={t.how.kicker} title={t.how.title} lead={t.how.lead} />
      </div>

      {/* Desktop: sticky, scroll-driven */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${n * 85}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="container-x grid grid-cols-12 items-center gap-12">
            <ol className="col-span-5 flex flex-col gap-2">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <StepItem index={i} step={s} fill={barHeight(progress, i / n, (i + 1) / n)} active={active === i} />
                </li>
              ))}
            </ol>
            <div className="col-span-7">
              {/* 4:3 of the column, but never shorter than the tallest panel (eight stock rows ≈ 456 px):
                  at lg the column is ≈ 531 px wide, so the ratio alone would clip the last rows. */}
              <div className="relative aspect-[4/3] min-h-[480px] w-full">
                <AnimatePresence mode="wait">
                  <StepVisual key={active} index={active} v={t.how.visuals} />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: stacked */}
      <ol className="container-x flex flex-col gap-14 py-16 lg:hidden">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-6">
            <StepItem index={i} step={s} fill={100} active />
            <div className="relative h-[460px] w-full sm:aspect-[4/3] sm:h-auto sm:min-h-[470px]">
              <StepVisual index={i} v={t.how.visuals} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepItem({ index, step, fill, active }: { index: number; step: Step; fill: number; active: boolean }) {
  return (
    <div className="flex gap-6">
      <div className="relative flex w-8 shrink-0 flex-col items-center">
        {/* IPC-style callout balloon: the active step is the one the "pen" is on */}
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] tracking-[0.08em] transition-colors duration-500",
            active ? "border-emerald-500 bg-emerald-500 text-graphite-950" : "border-graphite-300 bg-transparent text-graphite-400",
          )}
        >
          0{index + 1}
        </span>
        <div className="relative mt-2 w-px flex-1 bg-graphite-200">
          <div className="absolute inset-x-0 top-0 bg-emerald-500 transition-[height] duration-150 ease-linear" style={{ height: `${fill}%` }} />
        </div>
      </div>
      <div className={cn("pb-8 transition-opacity duration-500", active ? "opacity-100" : "opacity-45")}>
        <h3 className="text-xl font-bold tracking-tight text-graphite-900 md:text-2xl">{step.title}</h3>
        <p className="mt-2 max-w-md leading-relaxed text-graphite-500">{step.body}</p>
      </div>
    </div>
  );
}

/* ---------- visuals ---------- */

type Visuals = Dictionary["how"]["visuals"];
type CondCode = keyof Dictionary["console"]["condTitles"];

function Panel({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-graphite-200 bg-white shadow-card"
    >
      <div className="flex items-center justify-between border-b border-graphite-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Mark className="h-4 w-4" color="#10b981" />
          <p className="text-sm font-semibold text-graphite-800">{title}</p>
        </div>
        {badge}
      </div>
      <div className="relative flex-1 p-5">{children}</div>
    </motion.div>
  );
}

/* Illustrative sample rows only — not live inventory, not real suppliers.
   Columns: part number, platform, station (IATA), ATA 100 chapter, condition code, quantity. */
type StockRow = readonly [pn: string, platform: string, stn: string, ata: string, cond: CondCode, qty: string];
const STOCK: readonly StockRow[] = [
  ["2612-0043-01", "Boeing 737 NG", "IST", "32", "OH", "6"],
  ["A329-1062-01", "Airbus A320neo", "FRA", "29", "NE", "12"],
  ["5320-V0035-1", "Leonardo AW139", "ESB", "62", "NS", "3"],
  ["F7X-2210-05", "Falcon 7X", "DXB", "27", "SV", "2"],
  ["MS21042L3", "Standard part", "AMS", "20", "NE", "2 400"],
  ["EC145-8100-3", "Airbus H145", "VIE", "32", "OH", "4"],
  ["PH300-3300-01", "Embraer Phenom 300", "JFK", "34", "NE", "1"],
  ["CH350-0871-02", "Challenger 350", "DOH", "27", "SV", "2"],
];

/* Below `sm` the STN and ATA columns collapse, so the grid drops to four tracks. */
const STOCK_GRID = "grid-cols-[1.3fr_1.3fr_0.5fr_0.6fr] sm:grid-cols-[1.25fr_1.2fr_0.45fr_0.45fr_0.5fr_0.55fr]";

function StepVisual({ index, v }: { index: number; v: Visuals }) {
  const { t } = useLang();
  const { condTitles, urgencyTitle, stnTitle, ataTitle } = t.console;

  if (index === 0) {
    return (
      <Panel title={v.stockTitle} badge={<LiveBadge />}>
        <div className={cn("grid gap-3 border-b border-graphite-100 pb-2 dim-label text-graphite-400", STOCK_GRID)}>
          {v.stockColumns.map((c, i) => {
            const code = i === 2 || i === 3;
            const cls = cn(code && "hidden sm:inline", i === 5 && "text-right");
            return code ? (
              <abbr key={c} title={i === 2 ? stnTitle : ataTitle} className={cn("no-underline", cls)}>
                {c}
              </abbr>
            ) : (
              <span key={c} className={cls}>
                {c}
              </span>
            );
          })}
        </div>
        <ul className="divide-y divide-graphite-100 font-mono text-[12px]">
          {STOCK.map(([pn, platform, stn, ata, cond, qty], i) => (
            <motion.li
              key={pn}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.09, duration: 0.5, ease: EASE }}
              className={cn("grid items-center gap-3 py-3", STOCK_GRID, i >= 6 && "hidden sm:grid")}
            >
              <span className="text-graphite-900">{pn}</span>
              <span className="truncate text-graphite-500">{platform}</span>
              <span lang="en" className="hidden font-mono text-[11px] text-graphite-500 sm:inline">
                {stn}
              </span>
              <span lang="en" className="hidden font-mono text-[11px] text-graphite-500 sm:inline">
                {ata}
              </span>
              <abbr lang="en" title={condTitles[cond]} className="rounded bg-graphite-100 px-1.5 py-0.5 text-center text-[10px] text-graphite-700 no-underline">
                {cond}
              </abbr>
              <span className="text-right text-graphite-700">{qty}</span>
            </motion.li>
          ))}
        </ul>
      </Panel>
    );
  }

  if (index === 1) {
    return (
      <Panel title={v.rfqTitle}>
        <div className="flex h-full flex-col justify-between">
          <dl className="space-y-3">
            {v.requestFields.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: EASE }}
                className="grid grid-cols-[120px_1fr] items-center gap-4 rounded-lg border border-graphite-200 px-4 py-3"
              >
                <dt className="text-[12px] text-graphite-500">{f}</dt>
                <RequestValue index={i} value={v.requestValues[i]} aogTitle={urgencyTitle.aog} />
              </motion.div>
            ))}
          </dl>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-400">→ {v.networkNote}</span>
              <span className="dim-label normal-case tracking-[0.04em] text-graphite-400">
                <CondLegend legend={v.condLegend} />
              </span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-graphite-800 px-3.5 py-1.5 text-[12px] font-semibold text-white">
              <Send className="h-3.5 w-3.5" /> {v.send}
            </span>
          </motion.div>
        </div>
      </Panel>
    );
  }

  if (index === 2) {
    const offers = [
      { s: `${v.supplier} A`, stn: "FRA", t: "1.2s", c: "OH" },
      { s: `${v.supplier} B`, stn: "DXB", t: "1.6s", c: "NE" },
      { s: `${v.supplier} C`, stn: "LHR", t: "1.9s", c: "OH" },
    ];
    const [gearX, gearY] = ANCHORS_737.mainGearL;
    return (
      <Panel title={v.matchTitle} badge={<LiveBadge />}>
        {/* Below `sm` the three columns stack (request → leaders → offers) and the mini plate is dropped:
            a 375 px viewport leaves ≈ 100 px per column, too narrow for a 13 px mono P/N beside a drawing. */}
        <div className="grid h-full grid-cols-1 content-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-graphite-200 bg-graphite-50 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-graphite-400">{v.request}</p>
            <div>
              <p className="font-mono text-[13px] text-graphite-900">2612-0043-01</p>
              <p className="text-[12px] text-graphite-500">
                <span lang="en">Boeing 737 NG · ATA 32 · Qty 2 · NE/OH</span>
              </p>
            </div>
            {/* Mini IPC plate: the 737 wing box with the ATA 32 balloon on the left main gear.
                The vertical translate crops the nose so the wing box fills the frame. */}
            <svg viewBox="0 0 380 300" className="mt-1 hidden h-auto max-h-[160px] w-full text-graphite-300 sm:block" aria-hidden>
              <g transform="translate(0 -110)">
                <AirlinerTop mode="line" details={false} centerline={false} strokeWidth={1.5} />
              </g>
              <g transform="translate(0 -110)">
                <Callout n="32" x={gearX - 70} y={gearY + 40} tx={gearX} ty={gearY} r={12} active strokeWidth={1.5} />
              </g>
            </svg>
            <DrawingNote note={v.drawingNote} className="hidden sm:block" />
          </div>
          <Leaders className="hidden sm:block" />
          <Leaders vertical className="justify-self-center sm:hidden" />
          <ul className="space-y-2.5">
            {offers.map((o, i) => (
              <motion.li
                key={o.s}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.15, duration: 0.5, ease: EASE }}
                className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
              >
                <span className="text-[12px] font-semibold text-graphite-800">
                  {o.s}{" "}
                  <span lang="en" className="ml-1 font-mono text-[10px] font-normal tracking-[0.1em] text-graphite-500">
                    {o.stn}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-emerald-700">
                  {o.c} · {o.t}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={v.trackTitle}>
      <ol className="flex h-full flex-col justify-center gap-1">
        {v.trackSteps.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.18, duration: 0.5, ease: EASE }}
            className="flex items-center gap-4"
          >
            <div className="flex flex-col items-center">
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25 + i * 0.18, type: "spring", stiffness: 260, damping: 18 }}
                className={cn("flex h-7 w-7 items-center justify-center rounded-full", i < 3 ? "bg-emerald-500 text-graphite-950" : "border border-graphite-300 bg-white text-graphite-400")}
              >
                {i < 3 ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-graphite-300 blink" />}
              </motion.span>
              {i < v.trackSteps.length - 1 ? <span className="my-1 h-6 w-px bg-graphite-200" /> : null}
            </div>
            <p className={cn("flex items-baseline gap-2 text-[14px] font-medium", i < 3 ? "text-graphite-900" : "text-graphite-500")}>
              {s}
              {i === 2 ? (
                <span className="dim-label text-emerald-700">
                  <CodeLead text={v.awb} />
                </span>
              ) : null}
            </p>
          </motion.li>
        ))}
      </ol>
    </Panel>
  );
}

/* One RFQ value cell. The urgency class is a tagged code with its expansion; the ATA value keeps
   only the chapter number in `lang="en"` so the localised chapter name still hyphenates natively. */
function RequestValue({ index, value, aogTitle }: { index: number; value: string; aogTitle: string }) {
  if (index === 3) {
    return (
      <dd>
        <abbr lang="en" title={aogTitle} className="code-tag border-emerald-200 bg-emerald-50 text-emerald-700 no-underline">
          {value}
        </abbr>
      </dd>
    );
  }
  if (index === 4) {
    const [chapter, ...rest] = value.split(" · ");
    return (
      <dd className="font-mono text-[13px] text-graphite-900">
        <span lang="en">{chapter}</span>
        {rest.length ? ` · ${rest.join(" · ")}` : null}
      </dd>
    );
  }
  return (
    <dd lang={index === 0 || index === 2 ? "en" : undefined} className="font-mono text-[13px] text-graphite-900">
      {value}
    </dd>
  );
}

/* Three emerald leaders fanning from the request to the offers, each drawn on with an inline
   arrowhead (no <marker>). Horizontal beside the request box; vertical when the panel stacks. */
function Leaders({ vertical = false, className }: { vertical?: boolean; className?: string }) {
  const ends = [25, 75, 125];
  const w = vertical ? 150 : 56;
  const h = vertical ? 40 : 150;
  const path = (e: number) => (vertical ? `M 75 0 C 75 20, ${e} 20, ${e} 40` : `M 0 75 C 28 75, 28 ${e}, 56 ${e}`);
  const head = (e: number) => (vertical ? `${e - 3},34 ${e},40 ${e + 3},34` : `50,${e - 3} 56,${e} 50,${e + 3}`);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className={className} aria-hidden>
      {ends.map((e, i) => (
        <g key={e}>
          <motion.path
            d={path(e)}
            stroke="#10b981"
            strokeWidth="1.5"
            pathLength={1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.7, ease: EASE }}
          />
          <motion.polygon points={head(e)} fill="#10b981" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 + i * 0.15, duration: 0.3 }} />
        </g>
      ))}
    </svg>
  );
}

/* "Boeing 737-800 · main landing gear · ATA 32": only the type designation and the ATA reference
   are English codes; the description in between stays in the page language so `uppercase`
   applies the right casing (TR "İ", not "I"). */
function DrawingNote({ note, className }: { note: string; className?: string }) {
  const parts = note.split(" · ");
  return (
    <p className={cn("dim-label text-graphite-400", className)}>
      {parts.map((part, i) => (
        <Fragment key={part}>
          {i > 0 ? " · " : null}
          {i === 0 || i === parts.length - 1 ? <span lang="en">{part}</span> : part}
        </Fragment>
      ))}
    </p>
  );
}

/* "NE new · NS new surplus · …": each condition code is English, its expansion is localised. */
function CondLegend({ legend }: { legend: string }) {
  return (
    <>
      {legend.split(" · ").map((item, i) => {
        const [code, ...name] = item.split(" ");
        return (
          <Fragment key={item}>
            {i > 0 ? " · " : null}
            <span lang="en">{code}</span> {name.join(" ")}
          </Fragment>
        );
      })}
    </>
  );
}

/* "AWB issued" / "AWB kesildi": the leading code is English, the rest is localised. */
function CodeLead({ text }: { text: string }) {
  const [code, ...rest] = text.split(" ");
  return (
    <>
      <span lang="en">{code}</span>
      {rest.length ? ` ${rest.join(" ")}` : null}
    </>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 blink" /> LIVE
    </span>
  );
}
