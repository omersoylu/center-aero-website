"use client";

/* Bento layout patterns (spans, in-view stagger, hover lift) adapted from "bento grid 01" by avanishverma4 on 21st.dev. */

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Boxes, Fan, FlaskConical, RefreshCw, Truck, type LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { Group } from "@/lib/content";
import { SectionHeading } from "./ui/section-heading";
import { AirlinerTop, ANCHORS_737, Callout, Centerline, DimLine, FanFront, MainGear, PlatformGlyph } from "./aviation/drawings";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMERALD = "#10b981";
const ICONS: Record<Group["key"], LucideIcon> = { rotables: RefreshCw, engine: Fan, chemicals: FlaskConical, expendables: Boxes, gse: Truck };

type GroupKey = Group["key"];
type Focus = GroupKey | null;
type FocusProps = { focus: Focus; onFocusChange: (key: Focus) => void };

/* IPC plate: where each product group lives on the 737-800 (AirlinerTop base coordinates, 1 unit = 0.1 m). */
const CALLOUT_TARGET: Record<GroupKey, readonly [number, number]> = {
  rotables: ANCHORS_737.mainGearL,
  engine: ANCHORS_737.nacelleL,
  chemicals: ANCHORS_737.wingBoxR,
  expendables: ANCHORS_737.lapJointR,
  gse: ANCHORS_737.noseGear,
};
/* Balloons sit outside the outline; balloon 5 is placed so its leader meets the skin just below door L1. */
const CALLOUT_BALLOON: Record<GroupKey, readonly [number, number]> = {
  rotables: [70, 300],
  engine: [60, 150],
  chemicals: [330, 300],
  expendables: [300, 90],
  gse: [100, 48],
};
/* Base drawing 380 × 420 plus the span dimension above the nose and the length dimension (with its label) to the right. */
const PLATE_VIEWBOX = "-36 -32 580 452";
/* DimLine derives its inline label gap from label.length; leading/trailing spaces never render in SVG text but widen the gap so the letter-spaced label clears the line. */
const padDim = (label: string) => `   ${label}   `;
/* Tow bar: 4 m forward from the nose-gear axle, ending in the tow head. */
const TOW_BAR = { x: ANCHORS_737.noseGear[0], from: ANCHORS_737.noseGear[1], to: ANCHORS_737.noseGear[1] - 40 };

/** "ATA 57 · 28 · Wing box · sealant" → "ATA 57 · 28" — the leading chapter codes of a callout label. */
function ataCodes(label: string) {
  const codes: string[] = [];
  for (const part of label.split(" · ")) {
    if (!/^(ATA\s)?\d{2}$/.test(part)) break;
    codes.push(part);
  }
  return codes.join(" · ");
}

export function ProductGroups() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<Focus>(null);
  const byKey = Object.fromEntries(t.groups.items.map((g) => [g.key, g])) as Record<GroupKey, Group>;

  return (
    <section id="groups" className="bg-white">
      <div className="container-x py-24 md:py-32">
        <SectionHeading kicker={t.groups.kicker} title={t.groups.title} lead={t.groups.lead} meta={t.groups.ataLabel} />
        <div className="mt-14 grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)]">
          <Plate focus={focus} onFocusChange={setFocus} reduce={reduce} />
          {/* Full width at md (a two-row tile beside two figured cards would be ~900 px tall); the tall bento tile from lg. */}
          <Card group={byKey.rotables} index={0} focus={focus} onFocusChange={setFocus} className="md:col-span-6 lg:col-span-3 lg:row-span-2">
            <RotableLoop labels={t.groups.rotableLoop} caption={t.groups.gearCaption} reduce={reduce} />
          </Card>
          <Card group={byKey.engine} index={1} focus={focus} onFocusChange={setFocus} className="md:col-span-3">
            <div className="flex h-full min-h-[132px] flex-col items-center justify-center gap-1">
              <FanFront spin={!reduce} className="h-[120px] w-auto text-graphite-300" bladeClassName="fill-emerald-500" spinnerClassName="fill-graphite-800" />
              <p className="dim-label text-graphite-400">{t.groups.fanCaption}</p>
            </div>
          </Card>
          <Card group={byKey.chemicals} index={2} focus={focus} onFocusChange={setFocus} className="md:col-span-3">
            <Figure legend={t.groups.sealLegend}>
              <SealedLapJoint />
            </Figure>
          </Card>
          <Card group={byKey.expendables} index={3} focus={focus} onFocusChange={setFocus} className="md:col-span-2">
            <Figure legend={t.groups.fastenerLegend}>
              <FastenerStack />
            </Figure>
          </Card>
          <Card group={byKey.gse} index={4} focus={focus} onFocusChange={setFocus} className="md:col-span-2">
            <Figure legend={t.groups.towLegend}>
              <TowBar />
            </Figure>
          </Card>
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="flex flex-col justify-between rounded-2xl bg-graphite-900 p-7 text-white md:col-span-2"
          >
            <div className="flex items-end gap-3 text-emerald-400">
              <PlatformGlyph kind="airliner" size={28} />
              <PlatformGlyph kind="helicopter" size={22} />
              <PlatformGlyph kind="bizjet" size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t.groups.segmentsTitle}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {t.groups.segments.map((s) => (
                  <li key={s} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[12px] tracking-[0.06em] text-graphite-200">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Plate — dimensioned 737-800 top view with five IPC balloons, one per product group.
 * The airframe only mounts (and draws on) once the plate has scrolled into view.
 * ---------------------------------------------------------------------------------------------- */

function Plate({ focus, onFocusChange, reduce }: FocusProps & { reduce: boolean | null }) {
  const { t } = useLang();
  const [inView, setInView] = useState(false);
  const draw = !reduce;
  const towActive = focus === "gse";
  const towStroke = towActive ? EMERALD : "currentColor";

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setInView(true)}
      transition={{ duration: 0.8, ease: EASE }}
      className="grid gap-6 rounded-2xl border border-graphite-200 bg-white p-7 shadow-card md:col-span-6 lg:grid-cols-[1fr_300px]"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-graphite-800">{t.groups.plate.title}</p>
        <p className="mt-1 dim-label text-graphite-400">{t.groups.plate.note}</p>
        <svg viewBox={PLATE_VIEWBOX} preserveAspectRatio="xMidYMid meet" className="mt-4 h-[240px] w-full text-graphite-700 md:h-[320px]" aria-hidden>
          {inView ? (
            <>
              <AirlinerTop mode="line" strokeWidth={1} draw={draw} />
              <Fade reduce={reduce} delay={0.5}>
                {/* span: measured at the wingtips, dimension line above the nose */}
                <DimLine x1={11} y1={250} x2={369} y2={250} offset={-262} label={padDim(t.hero.drawing.span)} fontSize={12} className="text-graphite-400" />
                {/* length: nose to tail cone, dimension line to the right of the airframe */}
                <DimLine x1={190} y1={10} x2={190} y2={405} offset={202} label={t.hero.drawing.length} fontSize={12} className="text-graphite-400" />
              </Fade>
              {t.groups.items.map((g, i) => {
                const [bx, by] = CALLOUT_BALLOON[g.key];
                const [tx, ty] = CALLOUT_TARGET[g.key];
                const active = focus === g.key;
                return (
                  <Fade key={g.key} reduce={reduce} delay={0.6 + i * 0.08}>
                    {g.key === "gse" ? (
                      /* tow bar on the centreline, forward of the nose gear — lit with the leader */
                      <g className="text-graphite-400" stroke={towStroke} strokeWidth={active ? 1.5 : 1} fill="none" strokeLinecap="round">
                        <path d={`M${TOW_BAR.x - 1.5} ${TOW_BAR.from} V${TOW_BAR.to} M${TOW_BAR.x + 1.5} ${TOW_BAR.from} V${TOW_BAR.to}`} />
                        <rect x={TOW_BAR.x - 3} y={TOW_BAR.to - 6} width={6} height={6} fill={active ? EMERALD : "#ffffff"} />
                      </g>
                    ) : null}
                    <Callout n={i + 1} x={bx} y={by} tx={tx} ty={ty} r={12} active={active} strokeWidth={1} className="text-graphite-400 [&_*]:transition-[fill,stroke] [&_*]:duration-200" />
                  </Fade>
                );
              })}
            </>
          ) : null}
        </svg>
      </div>

      <div className="lg:self-center">
        <ol className="flex flex-col divide-y divide-graphite-100">
          {t.groups.items.map((g, i) => {
            const label = t.hero.drawing.callouts[i];
            const active = focus === g.key;
            return (
              <li
                key={g.key}
                title={label}
                onPointerEnter={() => onFocusChange(g.key)}
                onPointerLeave={() => onFocusChange(null)}
                className={cn("flex items-center gap-3 py-3 transition-colors", active && "text-graphite-900")}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors",
                    active ? "border-emerald-500 bg-emerald-500 text-graphite-950" : "border-graphite-300 text-graphite-500",
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-[14px] font-semibold text-graphite-800">{g.title}</span>
                <span lang="en" className="ml-auto font-mono text-[10px] tracking-[0.1em] text-graphite-400">
                  {ataCodes(label)}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 dim-label text-graphite-400">
          <span lang="en">{t.hero.drawing.type}</span> · {t.hero.drawing.view}
        </p>
      </div>
    </motion.article>
  );
}

/** Fades a drawing layer in once it mounts (the plate mounts its drawing when scrolled into view). */
function Fade({ reduce, delay, children }: { reduce: boolean | null; delay: number; children: ReactNode }) {
  return (
    <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE, delay }}>
      {children}
    </motion.g>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Card — one product group. Hover / focus is reported upward so the plate can light its balloon.
 * ---------------------------------------------------------------------------------------------- */

function Card({ group, index, focus, onFocusChange, className, children }: FocusProps & { group: Group; index: number; className?: string; children?: ReactNode }) {
  const { t } = useLang();
  const Icon = ICONS[group.key];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE }}
      whileHover={{ y: -3 }}
      onPointerEnter={() => onFocusChange(group.key)}
      onPointerLeave={() => onFocusChange(null)}
      onFocusCapture={() => onFocusChange(group.key)}
      onBlurCapture={() => onFocusChange(null)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-graphite-200 bg-white p-7 shadow-card transition-colors hover:border-graphite-300",
        focus === group.key && "border-graphite-300",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
        <abbr lang="en" title={t.groups.ataTitles[group.key]} className="font-mono text-[10px] uppercase tracking-[0.14em] text-graphite-400 no-underline">
          {group.ata}
        </abbr>
      </div>
      {children ? <div className="relative my-6 flex-1">{children}</div> : <div className="flex-1" />}
      <div className={cn(!children && "mt-8")}>
        <h3 className="text-xl font-bold tracking-tight text-graphite-900">{group.title}</h3>
        <p className="mt-2 leading-relaxed text-graphite-500">{group.body}</p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-emerald-700">{group.examples}</p>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------------------------------------
 * RotableLoop — on wing → removed → overhaul → serviceable → on wing …, around a 737 main gear.
 * ---------------------------------------------------------------------------------------------- */

function RotableLoop({ labels, caption, reduce }: { labels: string[]; caption: string; reduce: boolean | null }) {
  const R = 80;
  const CX = 210;
  const CY = 112;
  const pts = labels.map((_, i) => {
    const a = (-90 + i * 90) * (Math.PI / 180);
    return [CX + R * Math.cos(a), CY + R * Math.sin(a)] as const;
  });
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center">
      <svg viewBox="0 0 420 224" className="h-full w-full max-w-[500px]" fill="none" aria-hidden>
        <circle cx={CX} cy={CY} r={R} stroke="#d9dee5" strokeWidth="1.5" />
        {/* The travelling arc is continuous motion: it parks at 12 o'clock under reduced motion
            (a JS animation, so the CSS prefers-reduced-motion block cannot reach it). */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R}
          stroke={EMERALD}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.22 0.78"
          initial={{ rotate: 0 }}
          animate={{ rotate: reduce ? 0 : 360 }}
          transition={reduce ? { duration: 0 } : { duration: 14, ease: "linear", repeat: Infinity }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
        {/* 160 × 220 rear view scaled to 88 × 121 and centred on the ring (strut centreline on CX) */}
        <g transform="translate(166 52) scale(0.55)">
          <MainGear asSvg={false} strokeWidth={1.8} className="text-graphite-700" />
        </g>
        {pts.map(([x, y], i) => (
          <g key={labels[i]}>
            <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#1f2a37" strokeWidth="1.5" />
            <text
              x={x + (i === 1 ? 14 : i === 3 ? -14 : 0)}
              y={y + (i === 0 ? -14 : i === 2 ? 26 : 4)}
              textAnchor={i === 1 ? "start" : i === 3 ? "end" : "middle"}
              className="fill-graphite-600 font-mono text-[10px] uppercase"
              style={{ letterSpacing: "0.1em" }}
            >
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center dim-label text-graphite-400">{caption}</p>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Card figures — small IPC-style details for the groups without a bigger drawing.
 * Same line language as the plate: currentColor hairlines, emerald for the item of interest,
 * numbered balloons keyed to a legend line under the figure.
 * ---------------------------------------------------------------------------------------------- */

const FIGURE_SVG = "h-auto w-full max-w-[300px] text-graphite-500";

function Figure({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[132px] flex-col items-center justify-center gap-2">
      {children}
      <p className="text-center text-balance dim-label text-graphite-400">{legend}</p>
    </div>
  );
}

/** 45° section hatching inside a horizontal band, built as one path so no clipPath (and no id) is needed. */
function hatch(x1: number, x2: number, y1: number, y2: number, pitch = 6) {
  const run = y2 - y1;
  const segs: string[] = [];
  for (let x = x1; x + run <= x2; x += pitch) segs.push(`M${x} ${y2} L${x + run} ${y1}`);
  return segs.join(" ");
}

/* Chemicals — wing-skin lap joint in section: outer skin lapped over the tank-side skin,
   countersunk rivets through the overlap, and the three sealant applications of an integral
   fuel tank: fillet seals along the free edges, a faying-surface seal between the sheets and
   cap seals over the shop heads. */
function SealedLapJoint() {
  const rivets = [150, 172];
  const seal = { fill: EMERALD, fillOpacity: 0.3, stroke: EMERALD, strokeWidth: 1.25 };
  return (
    <svg viewBox="0 0 320 128" className={cn(FIGURE_SVG, "max-w-[380px]")} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      {/* skins, hatched as a section */}
      <path d={`${hatch(30, 190, 52, 60)} ${hatch(130, 290, 60, 68)}`} strokeWidth={0.75} strokeOpacity={0.4} />
      <path d="M30 52 H190 V60 H30 Z" />
      <path d="M130 60 H290 V68 H130 Z" />
      {/* 2 — faying-surface seal between the sheets */}
      <rect x={130} y={59} width={60} height={2} fill={EMERALD} stroke="none" />
      {/* 1 — fillet seals along both free edges */}
      <path d="M190 53 C197 53, 208 57, 216 60 L190 60 Z" {...seal} />
      <path d="M130 67 C123 67, 112 63, 104 60 L130 60 Z" {...seal} />
      {/* countersunk rivets, shop heads on the tank side */}
      {rivets.map((x) => (
        <g key={x}>
          <path d={`M${x - 5} 52 H${x + 5} L${x + 2.5} 57 V68 H${x - 2.5} V57 Z`} fill="#ffffff" />
          <rect x={x - 4} y={68} width={8} height={4} rx={1.5} fill="#ffffff" />
          {/* 3 — cap seal over the shop head */}
          <path d={`M${x - 10} 68 C${x - 10} 79, ${x + 10} 79, ${x + 10} 68 Z`} {...seal} />
        </g>
      ))}
      <g className="text-graphite-600">
        <Callout n={1} x={262} y={32} tx={210} ty={57} r={8} />
        <Callout n={2} x={262} y={100} tx={186} ty={61} r={8} />
        <Callout n={3} x={60} y={104} tx={144} ty={74} r={8} />
      </g>
    </svg>
  );
}

/* Expendables — exploded fastener stack on a centreline: close-tolerance bolt (hex head, plain
   shank, threaded end), flat washer and a reduced-hex self-locking nut with its locking collar. */
function FastenerStack() {
  return (
    <svg viewBox="0 0 240 104" className={FIGURE_SVG} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <Centerline x1={8} y1={52} x2={232} y2={52} strokeWidth={1} className="text-graphite-400" />
      {/* 1 — bolt */}
      <rect x={22} y={34} width={16} height={36} rx={1.5} fill="#ffffff" />
      <path d="M22 46 H38 M22 58 H38" strokeOpacity={0.6} />
      <path d="M38 43 H143 L146 46 V58 L143 61 H38 Z" fill="#ffffff" />
      <path d="M104 43 V61" strokeOpacity={0.6} />
      <path d="M104 45.5 H143 M104 58.5 H143" stroke={EMERALD} strokeWidth={1} />
      {/* 2 — washer */}
      <rect x={160} y={32} width={6} height={40} rx={1} fill="#ffffff" />
      <path d="M160 43 H166 M160 61 H166" strokeOpacity={0.6} />
      {/* 3 — self-locking nut, locking collar outboard */}
      <rect x={182} y={36} width={24} height={32} rx={1.5} fill="#ffffff" />
      <path d="M182 47 H206 M182 57 H206" strokeOpacity={0.6} />
      <rect x={206} y={41} width={6} height={22} rx={1} fill={EMERALD} fillOpacity={0.3} stroke={EMERALD} />
      <g className="text-graphite-600">
        <Callout n={1} x={70} y={14} tx={70} ty={43} r={8} />
        <Callout n={2} x={163} y={14} tx={163} ty={32} r={8} />
        <Callout n={3} x={194} y={14} tx={194} ty={36} r={8} />
      </g>
    </svg>
  );
}

/* Ground equipment — tow bar on the stand centreline, plan view, aircraft nose to the right:
   twin nose-gear tyres on the axle, the fork of the tow head on the towing lugs, the shear pin
   in the coupling, the wheel set with its lift housing and the hitch eye at the tractor end. */
function TowBar() {
  return (
    <svg viewBox="0 0 240 104" className={FIGURE_SVG} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <Centerline x1={8} y1={52} x2={232} y2={52} strokeWidth={1} className="text-graphite-400" />
      {/* nose gear: axle with towing lugs, twin tyres, strut */}
      <path d="M206 30 V74" />
      <rect x={193} y={37.5} width={26} height={9} rx={3.5} fill="#ffffff" />
      <rect x={193} y={57.5} width={26} height={9} rx={3.5} fill="#ffffff" />
      <circle cx={206} cy={52} r={5} fill="#ffffff" />
      {/* 1 — tow head */}
      <path d="M206 30 L172 46 M206 74 L172 58" />
      <rect x={163} y={44} width={10} height={16} rx={2} fill="#ffffff" />
      {/* bar and coupling, 2 — shear pin */}
      <rect x={44} y={48} width={106} height={8} rx={2} fill="#ffffff" />
      <rect x={150} y={47} width={13} height={10} rx={1.5} fill="#ffffff" />
      <circle cx={156.5} cy={52} r={2.5} fill={EMERALD} stroke="none" />
      {/* 3 — wheel set and lift housing */}
      <path d="M96 34 V70" />
      <rect x={88} y={34.5} width={16} height={7} rx={2.5} fill="#ffffff" />
      <rect x={88} y={62.5} width={16} height={7} rx={2.5} fill="#ffffff" />
      <rect x={89} y={45} width={14} height={14} rx={2} fill="#ffffff" />
      {/* tractor end: hitch eye */}
      <rect x={36} y={49} width={8} height={6} rx={1} fill="#ffffff" />
      <circle cx={28} cy={52} r={7} fill="#ffffff" />
      <circle cx={28} cy={52} r={3} />
      <g className="text-graphite-600">
        <Callout n={1} x={186} y={16} tx={168} ty={45} r={8} />
        <Callout n={2} x={140} y={90} tx={156.5} ty={55} r={8} />
        <Callout n={3} x={66} y={90} tx={90} ty={66} r={8} />
      </g>
    </svg>
  );
}
