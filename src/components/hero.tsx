"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ButtonLink } from "./ui/button";
import { AirlinerTop, ANCHORS_737, Callout, DimLine } from "./aviation/drawings";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-graphite-950 text-white">
      <Backdrop />
      <div className="container-x relative grid min-h-[100svh] items-center gap-14 pb-24 pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-36">
        <div className="min-w-0 lg:col-span-7">
          <motion.p {...fade(0.05)} className="kicker text-emerald-400">
            {t.hero.kicker}
          </motion.p>
          <Headline text={t.hero.title} em={t.hero.em} />
          <motion.p {...fade(0.6)} className="mt-7 max-w-xl text-lg leading-relaxed text-graphite-300 md:text-xl">
            {t.hero.lead}
          </motion.p>
          <motion.div {...fade(0.75)} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#contact" variant="primary">
              {t.hero.primary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="#contact" variant="ghost-light">
              {t.hero.secondary}
            </ButtonLink>
          </motion.div>
          <motion.div {...fade(0.9)} className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite-400">
            {t.hero.flow.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                <span className="text-graphite-200">{s}</span>
                {i < t.hero.flow.length - 1 ? (
                  /* miniature runway centreline: 30 m stripe / 20 m gap */
                  <span aria-hidden className="h-px w-[30px] bg-[repeating-linear-gradient(90deg,var(--color-graphite-500)_0_6px,transparent_6px_10px)]" />
                ) : null}
              </span>
            ))}
            <span className="text-graphite-500">— {t.hero.flowNote}</span>
          </motion.div>
          {/* Figure key for the five callout balloons on the drawing (product-group order). */}
          <motion.div {...fade(1.2)} className="mt-10 hidden max-w-2xl lg:block">
            <p className="dim-label flex items-center gap-3 text-graphite-500">
              <span lang="en">{t.hero.drawing.type}</span>
              <span aria-hidden>·</span>
              <span>{t.hero.drawing.view}</span>
            </p>
            <ol className="dim-label mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-graphite-400">
              {t.hero.drawing.callouts.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span aria-hidden className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-400/80 text-[9px] font-semibold leading-none text-emerald-400">
                    {i + 1}
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
        {/* Right column is the airframe's stage: the dimensioned 737-800 is drawn in the backdrop. */}
        <div aria-hidden className="hidden min-h-[520px] lg:col-span-5 lg:block" />
      </div>

      <motion.a
        href="#how"
        {...fade(1.4)}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-graphite-400 transition-colors hover:text-white md:flex"
      >
        {t.hero.scroll}
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </motion.a>
    </section>
  );
}

function Headline({ text, em }: { text: string; em: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <h1 className="mt-6 max-w-4xl text-[2.9rem] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-[5.6rem]">
      {words.map((word, i) => {
        const isEm = word.toLowerCase().replace(/[.,!?]/g, "") === em;
        return (
          <span key={`${word}-${i}`}>
            <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
              <motion.span
                className={cn("inline-block", isEm && "text-emerald-400")}
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.15 + i * 0.08, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </h1>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Backdrop geometry (viewBox 1440 × 900, xMidYMid slice)
 *
 * The frame is cropped to rows 45–855 on 16:9 screens and to columns ~28–1412 on 16:10 laptops, and
 * the fixed nav owns the top 72 px. Everything that must stay legible (station labels, dimension
 * lines, callout balloons) is kept inside that safe area.
 * ---------------------------------------------------------------------------------------------- */

const CX = 1080;
const CY = 500;
/** 737-800 base drawing (380 × 420, 1 unit = 0.1 m) → viewBox units. Span 600 units keeps the nose and
 *  its span dimension below the nav band on 16:9 and 16:10, and the right wingtip + length dimension
 *  inside the 16:10 crop. */
const S = 1.5;
const BASE_CX = 190;
const BASE_CY = 210;
/** Base drawing coordinates → viewBox coordinates. The wing box (base 190, 210) lands on (CX, CY),
 *  exactly where the routes converge. */
const P = (bx: number, by: number): [number, number] => [CX + (bx - BASE_CX) * S, CY + (by - BASE_CY) * S];

/** Mobile drawing: centred under the headline, never competing with type. */
const S_MOBILE = 1.25;
const MOBILE_CX = 720;
const MOBILE_CY = 470;

/** Route origins and where their IATA label sits (labels are nudged off the path's first tangent; the
 *  right-hand labels sit outboard of the console glass, which reaches x ≈ 1371 at 1280 px wide). */
const ROUTES: { x: number; y: number; lx: number; ly: number; anchor: "start" | "end" }[] = [
  { x: 40, y: 150, lx: 40, ly: 142, anchor: "start" },
  { x: 180, y: 112, lx: 192, ly: 112, anchor: "start" },
  { x: 430, y: 112, lx: 442, ly: 112, anchor: "start" },
  { x: 700, y: 112, lx: 712, ly: 112, anchor: "start" },
  { x: 1412, y: 80, lx: 1402, ly: 72, anchor: "end" },
  { x: 1420, y: 360, lx: 1402, ly: 372, anchor: "end" },
  { x: 1412, y: 760, lx: 1402, ly: 768, anchor: "end" },
  { x: 1120, y: 850, lx: 1110, ly: 838, anchor: "end" },
  { x: 800, y: 850, lx: 790, ly: 846, anchor: "end" },
  { x: 320, y: 852, lx: 330, ly: 840, anchor: "start" },
  { x: 30, y: 600, lx: 30, ly: 592, anchor: "start" },
  { x: 40, y: 360, lx: 40, ly: 352, anchor: "start" },
];

/* Drawing anchors (base coordinates) that stay visible around the console glass. */
const NOSE_GEAR = ANCHORS_737.noseGear;
/** Left nacelle inlet lip: nacelle centre from ANCHORS_737, lip 16 units ahead of it. */
const NACELLE_LIP_L: [number, number] = [ANCHORS_737.nacelleL[0], ANCHORS_737.nacelleL[1] - 16];
/** Outer wing box, left wing (u = 160 of 179, inside the integral fuel tank), clear of the console glass. */
const WING_BOX_L: [number, number] = [30, 245];
/** Fuselage skin, right side, just aft of the nose-section joint. */
const SKIN_R: [number, number] = [ANCHORS_737.lapJointR[0], 62];
/** Tow bar: 3 m (30 base units) from the nose gear forward, ending in the tractor hitch. */
const TOW_BAR_LEN = 30;

/* Engineering grid + a dimensioned 737-800 under the console + "routes" from twelve stations that
   converge on the console — every station and every part on the aircraft routes to the center. */
function Backdrop() {
  const { t } = useLang();
  const reduce = useReducedMotion();

  const [tipLx] = P(...ANCHORS_737.wingtipL);
  const [tipRx] = P(...ANCHORS_737.wingtipR);
  const [, noseY] = P(190, 10);
  const [, tailY] = P(190, 405);
  const noseGear = P(...NOSE_GEAR);
  const hitchY = noseGear[1] - TOW_BAR_LEN * S;
  const towBarMid: [number, number] = [noseGear[0], (noseGear[1] + hitchY) / 2 + 4];

  /** Span dimension above the nose (below the nav band on both 16:9 and 16:10), length dimension outboard
   *  of the right wingtip. Both are drawn as bare dimension lines whose arrowheads sit exactly over the
   *  wingtips / nose and tail; full extension lines would run through the headline. */
  const SPAN_DIM_Y = 178;
  const LENGTH_DIM_X = 1400;
  const lengthMidY = (noseY + tailY) / 2;

  /** Callout balloons, numbered in product-group order (rotables, engine, chemicals, expendables, gse). */
  const callouts: { x: number; y: number; target: [number, number] }[] = [
    { x: 1190, y: 340, target: noseGear },
    { x: 905, y: 310, target: P(...NACELLE_LIP_L) },
    { x: 770, y: 630, target: P(...WING_BOX_L) },
    { x: 1210, y: 250, target: P(...SKIN_R) },
    { x: 985, y: 222, target: towBarMid },
  ];

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="blueprint-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_60%_45%,black_20%,transparent_72%)]" />
      {/* hangar light through the door, behind the console */}
      <div className="absolute right-[4%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-emerald-500/10 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {/* Airframe — desktop: hairline 737-800 drawn on, wing box under the console */}
        <g className="hidden lg:block">
          <g transform={`translate(${CX - BASE_CX * S} ${CY - BASE_CY * S}) scale(${S})`}>
            <AirlinerTop mode="line" strokeWidth={2 / S} draw={!reduce} drawDelay={0.3} className="text-white/[0.6]" />
          </g>
        </g>
        {/* Airframe — mobile: static, faint, under the headline */}
        <g className="lg:hidden">
          <g transform={`translate(${MOBILE_CX - BASE_CX * S_MOBILE} ${MOBILE_CY - BASE_CY * S_MOBILE}) scale(${S_MOBILE})`}>
            <AirlinerTop mode="line" strokeWidth={1.4 / S_MOBILE} draw={false} className="text-white/[0.2]" />
          </g>
        </g>

        {/* Routes: twelve stations converge on the center; the airframe draws first, then the routes */}
        {ROUTES.map((r, i) => {
          const mx = (r.x + CX) / 2 + (r.y - CY) * 0.28;
          const my = (r.y + CY) / 2 - (r.x - CX) * 0.28;
          const d = `M ${r.x} ${r.y} Q ${mx} ${my} ${CX} ${CY}`;
          const delay = 1.0 + i * 0.12;
          const contrailDelay = 1.5 + i * 0.7;
          return (
            <g key={i}>
              <path d={d} pathLength={1} className="route-path" stroke="#10b981" strokeOpacity="0.28" strokeWidth="1" style={{ animationDelay: `${delay}s` }} />
              {!reduce ? (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: contrailDelay }}>
                  <path
                    d={d}
                    pathLength={1}
                    className="contrail"
                    stroke="#6ee7b7"
                    strokeOpacity="0.9"
                    strokeWidth="1.5"
                    style={{ ["--dur" as string]: `${8 + (i % 5) * 1.2}s`, animationDelay: `${contrailDelay}s` }}
                  />
                </motion.g>
              ) : null}
              <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay, ease: EASE }}>
                <text
                  className="hidden font-mono lg:block"
                  x={r.lx}
                  y={r.ly}
                  fontSize={10}
                  letterSpacing="0.14em"
                  fill="#8a97a8"
                  textAnchor={r.anchor}
                  dominantBaseline="central"
                  lang="en"
                >
                  <title>{t.hero.stationsTitle}</title>
                  {t.hero.stations[i]}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* Live pen — dimensions, tow bar and callouts. From xl up: below that the console glass covers the
            nose gear and the lead paragraph reaches the outer wing. */}
        <g className="hidden xl:block">
          <motion.g className="text-emerald-400/80" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.6, ease: EASE }}>
            <DimLine x1={tipLx} y1={SPAN_DIM_Y} x2={tipRx} y2={SPAN_DIM_Y} offset={0} label={t.hero.drawing.span} />
            {/* Length: the line itself, with its label set aligned (read from the right), as on a drawing sheet.
                Needs the 40 units between the console glass and the frame edge, which exist from 1360 px up. */}
            <g className="hidden min-[1360px]:block">
              <DimLine x1={LENGTH_DIM_X} y1={noseY} x2={LENGTH_DIM_X} y2={tailY} offset={0} label="" fontSize={0} />
              <text
                className="font-mono"
                transform={`rotate(-90 ${LENGTH_DIM_X - 9} ${lengthMidY})`}
                x={LENGTH_DIM_X - 9}
                y={lengthMidY}
                fontSize={10}
                letterSpacing="0.1em"
                fill="currentColor"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ textTransform: "uppercase", fontVariantNumeric: "tabular-nums" }}
              >
                {t.hero.drawing.length}
              </text>
            </g>
            {/* tow bar from the nose gear forward, tractor hitch at the far end */}
            <path d={`M${noseGear[0]} ${noseGear[1]} V${hitchY}`} stroke="currentColor" strokeWidth={2} />
            <rect x={noseGear[0] - 3} y={hitchY - 6} width={6} height={6} fill="currentColor" />
          </motion.g>

          {/* IPC callout balloons 1–5, one per product group */}
          <g className="text-emerald-400">
            {callouts.map((c, i) => (
              <motion.g
                key={i}
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.9 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
                style={{ originX: `${c.x}px`, originY: `${c.y}px`, transformBox: "view-box" }}
              >
                <Callout n={i + 1} x={c.x} y={c.y} tx={c.target[0]} ty={c.target[1]} r={9} tone="dark" strokeWidth={1} />
              </motion.g>
            ))}
          </g>
        </g>

        {/* the center */}
        <circle cx={CX} cy={CY} r="3" fill="#10b981" />
        <circle cx={CX} cy={CY} r="14" stroke="#10b981" strokeOpacity="0.35" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/30 via-transparent to-graphite-950" />
    </div>
  );
}
