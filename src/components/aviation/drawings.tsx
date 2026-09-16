"use client";

/*
 * Center Aero — aviation line drawings (illustrated-parts-catalogue style).
 *
 * Every export renders inline SVG only: no images, no external assets, no ids, no <marker>.
 * Colour comes from `currentColor`, so callers tint a drawing with a Tailwind `text-*` class.
 * Airframe drawings return a <g> by default so they compose inside the caller's viewBox; pass
 * `asSvg` to get a standalone <svg viewBox="…"> with no fixed width/height.
 *
 * Draw-on animation: `draw` renders the outline paths as motion.path with pathLength 0 → 1.
 * Those paths deliberately carry no vector-effect (pathLength and non-scaling-stroke conflict);
 * callers compensate strokeWidth when they scale a group (strokeWidth = 1 / scale).
 *
 * Reference dimensions used here (top views only):
 *   Boeing 737-800 — span 35.8 m, length 39.5 m, fuselage Ø 3.76 m, stabiliser span 14.35 m.
 *   Leonardo AW139 — rotor Ø 13.8 m, length 16.66 m.   TODO verify against the Leonardo spec before launch.
 *   Dassault Falcon 7X — span 26.2 m, length 23.4 m.    TODO verify against the Dassault spec before launch.
 */

import type { CSSProperties, ReactNode } from "react";
import { motion, type MotionValue } from "motion/react";

/* ------------------------------------------------------------------------------------------------
 * Shared primitives
 * ---------------------------------------------------------------------------------------------- */

export type DrawingMode = "line" | "silhouette";

const EASE = [0.16, 1, 0.3, 1] as const;
const DRAW_DURATION = 2.2;
const DRAW_STAGGER = 0.15;

/** Dash-dot pattern of a drafting centreline; shared with rotor discs. */
export const CENTERLINE_DASH = "12 4 2 4";

const round = (v: number) => Math.round(v * 100) / 100;

/** Closed circle as path data (so circles can be drawn on with pathLength too). */
function circlePath(cx: number, cy: number, r: number) {
  return `M${round(cx - r)} ${round(cy)} a${r} ${r} 0 1 0 ${round(2 * r)} 0 a${r} ${r} 0 1 0 ${round(-2 * r)} 0 Z`;
}

/** Rounded-rectangle path data centred on (cx, cy). */
function roundedRectPath(cx: number, cy: number, w: number, h: number, rx: number) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = Math.min(rx, w / 2, h / 2);
  return [
    `M${round(x + r)} ${round(y)}`,
    `H${round(x + w - r)}`,
    `A${r} ${r} 0 0 1 ${round(x + w)} ${round(y + r)}`,
    `V${round(y + h - r)}`,
    `A${r} ${r} 0 0 1 ${round(x + w - r)} ${round(y + h)}`,
    `H${round(x + r)}`,
    `A${r} ${r} 0 0 1 ${round(x)} ${round(y + h - r)}`,
    `V${round(y + r)}`,
    `A${r} ${r} 0 0 1 ${round(x + r)} ${round(y)}`,
    "Z",
  ].join(" ");
}

/** A 2-unit-wide bar between two points as a closed quad (for torque links, rotor blades). */
function barPath(x1: number, y1: number, x2: number, y2: number, width: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (width / 2);
  const ny = (dx / len) * (width / 2);
  return `M${round(x1 + nx)} ${round(y1 + ny)} L${round(x2 + nx)} ${round(y2 + ny)} L${round(x2 - nx)} ${round(y2 - ny)} L${round(x1 - nx)} ${round(y1 - ny)} Z`;
}

type DrawPathProps = {
  d: string;
  /** animate pathLength 0 → 1 */
  draw?: boolean;
  /** base delay in seconds */
  delay?: number;
  /** stagger index (× 0.15 s) */
  index?: number;
  fill?: string;
  strokeOpacity?: number;
  strokeDasharray?: string;
};

/** An outline path that optionally draws on like a pen. */
function DrawPath({ d, draw = false, delay = 0, index = 0, fill = "none", strokeOpacity, strokeDasharray }: DrawPathProps) {
  if (!draw) return <path d={d} fill={fill} strokeOpacity={strokeOpacity} strokeDasharray={strokeDasharray} />;
  return (
    <motion.path
      d={d}
      fill={fill}
      strokeOpacity={strokeOpacity}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: DRAW_DURATION, ease: EASE, delay: delay + index * DRAW_STAGGER }}
    />
  );
}

/** Secondary details (doors, windows, gear, centreline) fade in once the outline has been drawn. */
function Reveal({ draw, delay = 0, children }: { draw: boolean; delay?: number; children: ReactNode }) {
  if (!draw) return <g>{children}</g>;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: EASE, delay: delay + 1.5 }}>
      {children}
    </motion.g>
  );
}

type FrameProps = {
  asSvg: boolean;
  viewBox: string;
  className?: string;
  title?: string;
  transform?: string;
  mode: DrawingMode;
  strokeWidth: number;
  children: ReactNode;
};

/** Wraps a drawing either as a composable <g> or as a standalone <svg>. */
function Frame({ asSvg, viewBox, className, title, transform, mode, strokeWidth, children }: FrameProps) {
  const paint =
    mode === "silhouette"
      ? { fill: "currentColor", stroke: "none" as const }
      : { fill: "none", stroke: "currentColor", strokeWidth, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (asSvg) {
    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className={className}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        focusable="false"
        {...paint}
      >
        {title ? <title>{title}</title> : null}
        <g transform={transform}>{children}</g>
      </svg>
    );
  }
  return (
    <g className={className} transform={transform} aria-hidden={title ? undefined : true} {...paint}>
      {title ? <title>{title}</title> : null}
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Centerline
 * ---------------------------------------------------------------------------------------------- */

export type CenterlineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth?: number;
  className?: string;
};

/** Dash-dot drafting centreline. */
export function Centerline({ x1, y1, x2, y2, strokeWidth = 1, className }: CenterlineProps) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeOpacity={0.7}
      strokeDasharray={CENTERLINE_DASH}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------------------------------------
 * AirlinerTop — Boeing 737-800-class narrowbody, top view, nose up
 * Base space 380 × 420, 1 unit = 0.1 m, centreline x = 190.
 * ---------------------------------------------------------------------------------------------- */

export const AIRLINER_VIEWBOX = "0 0 380 420";
const A_CX = 190;
const A_BASE_SPAN = 35.8;
const A_BASE_LENGTH = 39.5;
const A_HALF = 18.8; // fuselage half-width (Ø 3.76 m)
const A_SEMI = 179; // semi-span incl. winglet
const LE_SLOPE = 82 / 157.2; // leading-edge sweep ≈ 27.5°

/** Anchor points (base coordinates) for callouts and dimension lines. */
export const ANCHORS_737 = {
  noseGear: [190, 64],
  mainGearL: [161, 246],
  mainGearR: [219, 246],
  nacelleL: [142, 164],
  nacelleR: [238, 164],
  wingBoxR: [268, 212],
  lapJointR: [209, 118],
  radome: [190, 14],
  apu: [190, 398],
  wingletR: [369, 250],
  wingtipL: [11, 250],
  wingtipR: [369, 250],
} as const satisfies Record<string, readonly [number, number]>;

/** Non-uniform scale factors that map the 737-800 base geometry onto another airframe. */
export function airlinerScale(span = A_BASE_SPAN, length = A_BASE_LENGTH) {
  return { sx: span / A_BASE_SPAN, sy: length / A_BASE_LENGTH };
}

export type AirlinerTopProps = {
  mode?: DrawingMode;
  /** wingspan in metres (default 35.8) */
  span?: number;
  /** overall length in metres (default 39.5) */
  length?: number;
  engines?: 2 | 4;
  /** nacelle positions as fractions of semi-span */
  engineAt?: number[];
  /** doors, windows, cockpit, gear (line mode) */
  details?: boolean;
  centerline?: boolean;
  strokeWidth?: number;
  draw?: boolean;
  drawDelay?: number;
  asSvg?: boolean;
  className?: string;
  transform?: string;
  title?: string;
};

export function AirlinerTop({
  mode = "line",
  span = A_BASE_SPAN,
  length = A_BASE_LENGTH,
  engines = 2,
  engineAt,
  details = true,
  centerline = true,
  strokeWidth = 1,
  draw = false,
  drawDelay = 0,
  asSvg = false,
  className,
  transform,
  title,
}: AirlinerTopProps) {
  const { sx, sy } = airlinerScale(span, length);
  const line = mode === "line";
  const X = (u: number) => round(u * sx);
  const Y = (v: number) => round(v * sy);
  const L = (u: number) => X(A_CX - u); // left-side x from centreline offset
  const R = (u: number) => X(A_CX + u); // right-side x from centreline offset
  const C = X(A_CX);

  /* Fuselage: ogival nose, constant section, tapered tail cone. One closed path. */
  const fuselage = [
    `M${C} ${Y(10)}`,
    `C${L(12)} ${Y(13)}, ${L(18)} ${Y(28)}, ${L(A_HALF)} ${Y(60)}`,
    `L${L(A_HALF)} ${Y(330)}`,
    `C${L(A_HALF)} ${Y(360)}, ${L(10)} ${Y(390)}, ${L(2)} ${Y(400)}`,
    `L${C} ${Y(405)}`,
    `L${R(2)} ${Y(400)}`,
    `C${R(10)} ${Y(390)}, ${R(A_HALF)} ${Y(360)}, ${R(A_HALF)} ${Y(330)}`,
    `L${R(A_HALF)} ${Y(60)}`,
    `C${R(18)} ${Y(28)}, ${R(12)} ${Y(13)}, ${C} ${Y(10)}`,
    "Z",
  ].join(" ");

  /* Wing: LE sweep ≈ 27°, Yehudi kink on the TE, blended winglet tab. */
  const wing = (side: (u: number) => number) =>
    [
      `M${side(A_HALF)} ${Y(160)}`,
      `L${side(176)} ${Y(242)}`,
      `L${side(179)} ${Y(246)}`,
      `L${side(179)} ${Y(260)}`,
      `L${side(176)} ${Y(258)}`,
      `L${side(75)} ${Y(246)}`,
      `L${side(A_HALF)} ${Y(235)}`,
      "Z",
    ].join(" ");

  /* Horizontal stabiliser. Line mode starts at the fuselage skin; silhouette runs to the centreline. */
  const stabLine = [
    `M${L(17.4)} ${Y(351)} L${L(71.75)} ${Y(376)} L${L(71.75)} ${Y(394)} L${L(10.4)} ${Y(386)}`,
    `M${R(17.4)} ${Y(351)} L${R(71.75)} ${Y(376)} L${R(71.75)} ${Y(394)} L${R(10.4)} ${Y(386)}`,
  ].join(" ");
  const stabSilhouette = [
    `M${L(4)} ${Y(345)} L${L(71.75)} ${Y(376)} L${L(71.75)} ${Y(394)} L${L(4)} ${Y(385)}`,
    `L${R(4)} ${Y(385)} L${R(71.75)} ${Y(394)} L${R(71.75)} ${Y(376)} L${R(4)} ${Y(345)} Z`,
  ].join(" ");

  /* Vertical fin seen from above: a sliver on the centreline with a dorsal-fin taper. */
  const fin = `M${C} ${Y(285)} L${R(1.5)} ${Y(300)} L${R(1.5)} ${Y(400)} L${L(1.5)} ${Y(400)} L${L(1.5)} ${Y(300)} Z`;

  /* Engines: nacelles hang mostly ahead of the local leading edge. */
  const fractions = engineAt ?? (engines === 4 ? [0.32, 0.64] : [0.266]);
  const nacelles: { body: string; pylon: string; lip: string }[] = [];
  for (const f of fractions) {
    const off = f * A_SEMI;
    const leY = 160 + Math.max(0, off - A_HALF) * LE_SLOPE;
    const aft = leY + 9;
    const front = aft - 43;
    for (const side of [L, R]) {
      const cx = side(off);
      nacelles.push({
        body: roundedRectPath(cx, Y((front + aft) / 2), 21 * sx, 43 * sy, 6 * Math.min(sx, sy)),
        pylon: `M${cx} ${Y(aft)} L${cx} ${Y(aft + 16)}`,
        lip: `M${round(cx - 8.5 * sx)} ${Y(front + 7)} L${round(cx + 8.5 * sx)} ${Y(front + 7)}`,
      });
    }
  }

  const outlines = [fuselage, wing(L), wing(R), line ? stabLine : stabSilhouette, ...nacelles.map((n) => n.body)];

  return (
    <Frame asSvg={asSvg} viewBox={asSvg ? `0 0 ${round(380 * sx)} ${round(420 * sy)}` : AIRLINER_VIEWBOX} className={className} title={title} transform={transform} mode={mode} strokeWidth={strokeWidth}>
      {!line ? (
        <>
          {outlines.map((d, i) => (
            <path key={i} d={d} />
          ))}
          <path d={fin} />
          {nacelles.map((n, i) => (
            <path key={`p${i}`} d={n.pylon} stroke="currentColor" strokeWidth={3 * sx} />
          ))}
        </>
      ) : (
        <>
          {centerline ? (
            <Reveal draw={draw} delay={drawDelay}>
              <Centerline x1={C} y1={Y(2)} x2={C} y2={Y(414)} strokeWidth={strokeWidth} />
            </Reveal>
          ) : null}
          {outlines.map((d, i) => (
            <DrawPath key={i} d={d} draw={draw} delay={drawDelay} index={i} />
          ))}
          <Reveal draw={draw} delay={drawDelay}>
            {/* fin sliver and pylons */}
            <path d={fin} fill="currentColor" stroke="none" />
            {nacelles.map((n, i) => (
              <path key={`p${i}`} d={n.pylon} />
            ))}
            {details ? (
              <>
                {/* inlet lips */}
                {nacelles.map((n, i) => (
                  <path key={`l${i}`} d={n.lip} strokeOpacity={0.7} />
                ))}
                {/* cockpit windows */}
                <path d={`M${L(16.4)} ${Y(38.5)} L${L(9)} ${Y(42.5)} M${L(16.8)} ${Y(45)} L${L(9.4)} ${Y(47)}`} />
                <path d={`M${R(16.4)} ${Y(38.5)} L${R(9)} ${Y(42.5)} M${R(16.8)} ${Y(45)} L${R(9.4)} ${Y(47)}`} />
                {/* passenger-window rows */}
                <path d={`M${L(12)} ${Y(70)} L${L(12)} ${Y(320)} M${R(12)} ${Y(70)} L${R(12)} ${Y(320)}`} strokeDasharray="1.2 2.6" strokeOpacity={0.55} />
                {/* doors L1/R1, L2/R2 and over-wing exits */}
                <path d={`M${L(21.8)} ${Y(55)} L${L(15.8)} ${Y(55)} M${R(21.8)} ${Y(55)} L${R(15.8)} ${Y(55)}`} />
                <path d={`M${L(21.8)} ${Y(322)} L${L(15.8)} ${Y(322)} M${R(21.8)} ${Y(322)} L${R(15.8)} ${Y(322)}`} />
                <path d={`M${L(20.8)} ${Y(196)} L${L(16.8)} ${Y(196)} M${R(20.8)} ${Y(196)} L${R(16.8)} ${Y(196)}`} />
                <path d={`M${L(20.8)} ${Y(206)} L${L(16.8)} ${Y(206)} M${R(20.8)} ${Y(206)} L${R(16.8)} ${Y(206)}`} />
                {/* landing gear, top view */}
                <path d={roundedRectPath(C, Y(64), 8 * sx, 6 * sy, 2)} />
                <path d={roundedRectPath(L(28.6), Y(246), 10 * sx, 8 * sy, 2)} />
                <path d={roundedRectPath(R(28.6), Y(246), 10 * sx, 8 * sy, 2)} />
              </>
            ) : null}
          </Reveal>
        </>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------------------------------------
 * HelicopterTop — AW139-class medium twin, top view, nose up
 * Base space 300 × 360, 20 units = 1 m, rotor centred (150, 150).
 * ---------------------------------------------------------------------------------------------- */

export const HELICOPTER_VIEWBOX = "0 0 300 360";
const H_CX = 150;
const H_CY = 150;
const H_BASE_ROTOR = 13.8;
const H_BASE_LENGTH = 16.66;

export type HelicopterTopProps = {
  mode?: DrawingMode;
  /** main-rotor diameter in metres (default 13.8) */
  rotor?: number;
  /** overall length in metres (default 16.66) */
  length?: number;
  strokeWidth?: number;
  draw?: boolean;
  drawDelay?: number;
  asSvg?: boolean;
  className?: string;
  transform?: string;
  title?: string;
};

const H_BLADE = "M-4 -12 L-3 -136 A3 3 0 0 1 3 -136 L4 -12 Z";

export function HelicopterTop({
  mode = "line",
  rotor = H_BASE_ROTOR,
  length = H_BASE_LENGTH,
  strokeWidth = 1,
  draw = false,
  drawDelay = 0,
  asSvg = false,
  className,
  transform,
  title,
}: HelicopterTopProps) {
  const line = mode === "line";
  const k = rotor / H_BASE_ROTOR;
  const sy = length / H_BASE_LENGTH;
  const rotorTransform = `translate(${H_CX} ${H_CY}) scale(${round(k)}) translate(${-H_CX} ${-H_CY})`;
  const fuselageTransform = `translate(0 ${H_CY}) scale(1 ${round(sy)}) translate(0 ${-H_CY})`;

  const fuselage = [
    "M150 62",
    "C137 62, 128 76, 128 100",
    "L127 150 L127 200",
    "C128 222, 136 236, 144 242",
    "L144 330 L156 330 L156 242",
    "C164 236, 172 222, 173 200",
    "L173 150 L172 100",
    "C172 76, 163 62, 150 62 Z",
  ].join(" ");
  const sponsonL = "M127 166 C119 170, 119 196, 127 200 Z";
  const sponsonR = "M173 166 C181 170, 181 196, 173 200 Z";
  const glazing = "M150 67 C142 67, 136 76, 134 94 L166 94 C164 76, 158 67, 150 67 Z";
  const stab = "M120 311 L180 311 L180 317 L120 317 Z";
  const endPlates = `${roundedRectPath(120, 314, 6, 8, 1)} ${roundedRectPath(180, 314, 6, 8, 1)}`;
  const finSliver = "M150 296 L151.5 306 L151.5 335 L148.5 335 L148.5 306 Z";
  const intakes = `${roundedRectPath(138, 131, 14, 26, 4)} ${roundedRectPath(162, 131, 14, 26, 4)}`;
  const exhausts = "M133 148 L133 156 M167 148 L167 156";
  // tail rotor Ø 2.7 m on the port side of the fin (x = 128 in a nose-up view)
  const tailRotorBlades = "M128 305 L128 355 M103 330 L153 330";
  const gear = [
    roundedRectPath(145, 96, 6, 10, 1.5),
    roundedRectPath(155, 96, 6, 10, 1.5),
    roundedRectPath(124, 186, 8, 14, 2),
    roundedRectPath(176, 186, 8, 14, 2),
  ].join(" ");

  const bladeAngles = [0, 72, 144, 216, 288];

  return (
    <Frame asSvg={asSvg} viewBox={HELICOPTER_VIEWBOX} className={className} title={title} transform={transform} mode={mode} strokeWidth={strokeWidth}>
      {!line ? (
        <>
          <g transform={fuselageTransform}>
            <path d={fuselage} />
            <path d={sponsonL} />
            <path d={sponsonR} />
            <path d={stab} />
            <path d={endPlates} />
            <path d={finSliver} />
            {/* tail rotor edge-on: a single bar along the boom, offset to port */}
            <path d={barPath(128, 303, 128, 357, 2.5)} />
            <path d={barPath(128, 330, 150, 330, 3)} />
          </g>
          <g transform={rotorTransform}>
            <path d={`${circlePath(H_CX, H_CY, 138)} ${circlePath(H_CX, H_CY, 136)}`} fillRule="evenodd" />
            {bladeAngles.map((a) => (
              <path key={a} d={H_BLADE} transform={`translate(${H_CX} ${H_CY}) rotate(${a})`} />
            ))}
            <circle cx={H_CX} cy={H_CY} r={10} />
          </g>
        </>
      ) : (
        <>
          <g transform={fuselageTransform}>
            <DrawPath d={fuselage} draw={draw} delay={drawDelay} index={0} />
            <DrawPath d={sponsonL} draw={draw} delay={drawDelay} index={1} />
            <DrawPath d={sponsonR} draw={draw} delay={drawDelay} index={1} />
            <DrawPath d={stab} draw={draw} delay={drawDelay} index={2} />
            <Reveal draw={draw} delay={drawDelay}>
              <path d={glazing} strokeOpacity={0.7} />
              <path d={endPlates} />
              <path d={finSliver} fill="currentColor" stroke="none" />
              <path d={intakes} />
              <path d={exhausts} />
              <path d={gear} />
              {/* tail rotor: Ø 2.7 m, offset to the left side of the boom */}
              <path d={circlePath(128, 330, 27)} strokeDasharray="6 4" strokeOpacity={0.8} />
              <path d={tailRotorBlades} />
              <circle cx={128} cy={330} r={3} />
            </Reveal>
          </g>
          <g transform={rotorTransform} strokeWidth={strokeWidth / k}>
            <Reveal draw={draw} delay={drawDelay}>
              <path d={circlePath(H_CX, H_CY, 138)} strokeDasharray={CENTERLINE_DASH} strokeOpacity={0.7} />
              <circle cx={H_CX} cy={H_CY} r={10} />
            </Reveal>
            {bladeAngles.map((a, i) => (
              <g key={a} transform={`translate(${H_CX} ${H_CY}) rotate(${a})`}>
                <DrawPath d={H_BLADE} draw={draw} delay={drawDelay} index={3 + i} />
              </g>
            ))}
          </g>
        </>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------------------------------------
 * BizjetTop — Falcon 7X-class large-cabin trijet, top view, nose up
 * Base space 280 × 260, 10 units = 1 m, centreline x = 140.
 * ---------------------------------------------------------------------------------------------- */

export const BIZJET_VIEWBOX = "0 0 280 260";
const B_CX = 140;
const B_BASE_SPAN = 26.2;
const B_BASE_LENGTH = 23.4;
const B_HALF = 12.5;

export type BizjetTopProps = {
  mode?: DrawingMode;
  /** wingspan in metres (default 26.2) */
  span?: number;
  /** overall length in metres (default 23.4) */
  length?: number;
  /** 3 = trijet with centre S-duct engine; 2 = twin (Phenom / Global / Challenger-type) */
  engines?: 2 | 3;
  strokeWidth?: number;
  draw?: boolean;
  drawDelay?: number;
  asSvg?: boolean;
  className?: string;
  transform?: string;
  title?: string;
};

export function BizjetTop({
  mode = "line",
  span = B_BASE_SPAN,
  length = B_BASE_LENGTH,
  engines = 3,
  strokeWidth = 1,
  draw = false,
  drawDelay = 0,
  asSvg = false,
  className,
  transform,
  title,
}: BizjetTopProps) {
  const line = mode === "line";
  const sx = span / B_BASE_SPAN;
  const sy = length / B_BASE_LENGTH;
  const X = (u: number) => round(u * sx);
  const Y = (v: number) => round(v * sy);
  const L = (u: number) => X(B_CX - u);
  const R = (u: number) => X(B_CX + u);
  const C = X(B_CX);

  const fuselage = [
    `M${C} ${Y(8)}`,
    `C${L(7)} ${Y(10)}, ${L(12)} ${Y(24)}, ${L(B_HALF)} ${Y(40)}`,
    `L${L(B_HALF)} ${Y(165)}`,
    `C${L(12)} ${Y(195)}, ${L(8)} ${Y(225)}, ${L(2.5)} ${Y(236)}`,
    `L${C} ${Y(242)}`,
    `L${R(2.5)} ${Y(236)}`,
    `C${R(8)} ${Y(225)}, ${R(12)} ${Y(195)}, ${R(B_HALF)} ${Y(165)}`,
    `L${R(B_HALF)} ${Y(40)}`,
    `C${R(12)} ${Y(24)}, ${R(7)} ${Y(10)}, ${C} ${Y(8)}`,
    "Z",
  ].join(" ");

  /* Wing: LE sweep ≈ 30°, straight TE with a flap-track fairing, small winglet. */
  const wing = (side: (u: number) => number) =>
    [
      `M${side(B_HALF)} ${Y(95)}`,
      `L${side(131)} ${Y(171)}`,
      `L${side(134)} ${Y(175)}`,
      `L${side(134)} ${Y(185)}`,
      `L${side(131)} ${Y(185)}`,
      `L${side(49.5)} ${Y(167.8)}`,
      `L${side(46)} ${Y(173)}`,
      `L${side(42.5)} ${Y(166.3)}`,
      `L${side(B_HALF)} ${Y(160)}`,
      "Z",
    ].join(" ");

  /* T-tail stabiliser (sits above everything, so it may cross the engines). */
  const stab = [
    `M${L(3)} ${Y(206)} L${L(49)} ${Y(232)} L${L(49)} ${Y(244)} L${L(3)} ${Y(234)}`,
    `L${R(3)} ${Y(234)} L${R(49)} ${Y(244)} L${R(49)} ${Y(232)} L${R(3)} ${Y(206)} Z`,
  ].join(" ");
  const fin = `M${L(1.5)} ${Y(176)} L${R(1.5)} ${Y(176)} L${R(1.5)} ${Y(240)} L${L(1.5)} ${Y(240)} Z`;

  const sideNacelle = (side: (u: number) => number) => roundedRectPath(side(23), Y(193), 16 * sx, 46 * sy, 5 * Math.min(sx, sy));
  const sidePylon = (side: (u: number) => number) => `M${side(11.5)} ${Y(186)} L${side(15)} ${Y(186)} M${side(10.5)} ${Y(200)} L${side(15)} ${Y(200)}`;
  // buried S-duct centre engine: only its intake scoop and a faint casing show from above
  const centreNacelle = roundedRectPath(C, Y(216), 14 * sx, 36 * sy, 4 * Math.min(sx, sy));
  const scoop = `M${L(9)} ${Y(196)} A${round(9 * sx)} ${round(9 * sy)} 0 0 1 ${R(9)} ${Y(196)}`;

  const outlines = [fuselage, wing(L), wing(R), stab, sideNacelle(L), sideNacelle(R)];

  return (
    <Frame asSvg={asSvg} viewBox={asSvg ? `0 0 ${round(280 * sx)} ${round(260 * sy)}` : BIZJET_VIEWBOX} className={className} title={title} transform={transform} mode={mode} strokeWidth={strokeWidth}>
      {!line ? (
        <>
          {outlines.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {engines === 3 ? <path d={centreNacelle} /> : null}
          <path d={fin} />
        </>
      ) : (
        <>
          {outlines.map((d, i) => (
            <DrawPath key={i} d={d} draw={draw} delay={drawDelay} index={i} />
          ))}
          <Reveal draw={draw} delay={drawDelay}>
            <path d={fin} fill="currentColor" stroke="none" />
            <path d={sidePylon(L)} />
            <path d={sidePylon(R)} />
            {engines === 3 ? (
              <>
                <path d={scoop} />
                <path d={centreNacelle} strokeOpacity={0.45} />
              </>
            ) : null}
            {/* cockpit windows */}
            <path d={`M${L(11)} ${Y(26)} L${L(4)} ${Y(29)} M${L(10.5)} ${Y(31)} L${L(3.5)} ${Y(33)}`} />
            <path d={`M${R(11)} ${Y(26)} L${R(4)} ${Y(29)} M${R(10.5)} ${Y(31)} L${R(3.5)} ${Y(33)}`} />
            {/* cabin windows */}
            <path d={`M${L(9)} ${Y(55)} L${L(9)} ${Y(160)} M${R(9)} ${Y(55)} L${R(9)} ${Y(160)}`} strokeDasharray="1.2 2.6" strokeOpacity={0.55} />
            {/* main door, left */}
            <path d={`M${L(15.5)} ${Y(48)} L${L(9.5)} ${Y(48)}`} />
            {/* gear */}
            <path d={roundedRectPath(C, Y(40), 6 * sx, 6 * sy, 1.5)} />
            <path d={roundedRectPath(L(14), Y(150), 8 * sx, 7 * sy, 2)} />
            <path d={roundedRectPath(R(14), Y(150), 8 * sx, 7 * sy, 2)} />
          </Reveal>
        </>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------------------------------------
 * MainGear — 737-class main landing gear, rear view. Line mode only.
 * ---------------------------------------------------------------------------------------------- */

export const MAIN_GEAR_VIEWBOX = "0 0 160 220";

export type MainGearProps = {
  strokeWidth?: number;
  centerline?: boolean;
  draw?: boolean;
  drawDelay?: number;
  asSvg?: boolean;
  className?: string;
  title?: string;
};

export function MainGear({ strokeWidth = 1.5, centerline = false, draw = false, drawDelay = 0, asSvg = true, className, title }: MainGearProps) {
  const trunnion = roundedRectPath(80, 12, 26, 10, 3);
  const strut = roundedRectPath(80, 71, 18, 106, 4); // x 71–89, y 18–124
  const piston = roundedRectPath(80, 150, 8, 52, 2); // x 76–84, y 124–176
  const torqueUpper = barPath(89, 112, 104, 140, 2);
  const torqueLower = barPath(104, 140, 89, 168, 2);
  // side brace: two parallel lines 3 apart from (80, 24) to (146, 8)
  const brace = "M80.35 25.46 L146.35 9.46 M79.65 22.54 L145.65 6.54";
  const axle = "M56 176 H58 M70 176 H90 M102 176 H104 M56 184 H58 M70 184 H90 M102 184 H104";
  const wheelL = roundedRectPath(44, 180, 24, 64, 7);
  const wheelR = roundedRectPath(116, 180, 24, 64, 7);
  const treads = "M32 164 H56 M32 180 H56 M32 196 H56 M104 164 H128 M104 180 H128 M104 196 H128";
  const brakes = `${roundedRectPath(64, 180, 12, 36, 1.5)} ${roundedRectPath(96, 180, 12, 36, 1.5)}`;

  return (
    <Frame asSvg={asSvg} viewBox={MAIN_GEAR_VIEWBOX} className={className} title={title} mode="line" strokeWidth={strokeWidth}>
      {centerline ? <Centerline x1={80} y1={0} x2={80} y2={220} strokeWidth={strokeWidth * 0.75} /> : null}
      <DrawPath d={strut} draw={draw} delay={drawDelay} index={0} />
      <DrawPath d={piston} draw={draw} delay={drawDelay} index={1} />
      <DrawPath d={wheelL} draw={draw} delay={drawDelay} index={2} />
      <DrawPath d={wheelR} draw={draw} delay={drawDelay} index={2} />
      <Reveal draw={draw} delay={drawDelay}>
        <path d={trunnion} />
        <path d={brace} />
        <circle cx={80} cy={24} r={3} />
        <circle cx={146} cy={8} r={3} />
        <path d={torqueUpper} />
        <path d={torqueLower} />
        <circle cx={104} cy={140} r={2.5} />
        <path d={axle} />
        <path d={brakes} />
        <circle cx={64} cy={172} r={1.2} fill="currentColor" stroke="none" />
        <circle cx={64} cy={188} r={1.2} fill="currentColor" stroke="none" />
        <circle cx={96} cy={172} r={1.2} fill="currentColor" stroke="none" />
        <circle cx={96} cy={188} r={1.2} fill="currentColor" stroke="none" />
        <path d={treads} strokeOpacity={0.5} />
        <circle cx={44} cy={180} r={6} />
        <circle cx={116} cy={180} r={6} />
      </Reveal>
    </Frame>
  );
}

/* ------------------------------------------------------------------------------------------------
 * FanFront — turbofan seen from the front, 18-blade fan, spins via the `spin-slow` utility.
 * ---------------------------------------------------------------------------------------------- */

export const FAN_VIEWBOX = "0 0 220 160";
const F_CX = 110;
const F_CY = 80;

export type FanFrontProps = {
  blades?: number;
  spin?: boolean;
  bladeClassName?: string;
  spinnerClassName?: string;
  strokeWidth?: number;
  className?: string;
  title?: string;
};

export function FanFront({
  blades = 18,
  spin = true,
  bladeClassName = "fill-emerald-500",
  spinnerClassName = "fill-graphite-800",
  strokeWidth = 1.25,
  className,
  title,
}: FanFrontProps) {
  const count = Math.max(3, Math.round(blades));
  const vanes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${round(F_CX + 62 * c)} ${round(F_CY + 62 * s)} L${round(F_CX + 66 * c)} ${round(F_CY + 66 * s)}`;
  }).join(" ");
  const pylon = `M${F_CX - 7} ${F_CY - 72} L${F_CX - 7} 3 Q${F_CX - 7} 0 ${F_CX - 4} 0 L${F_CX + 4} 0 Q${F_CX + 7} 0 ${F_CX + 7} 3 L${F_CX + 7} ${F_CY - 72}`;

  return (
    <svg
      viewBox={FAN_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    >
      {title ? <title>{title}</title> : null}
      {/* nacelle cowl and inlet lip */}
      <circle cx={F_CX} cy={F_CY} r={74} />
      <circle cx={F_CX} cy={F_CY} r={68} />
      <path d={pylon} />
      {/* fan case and outlet guide vanes */}
      <circle cx={F_CX} cy={F_CY} r={62} strokeOpacity={0.8} />
      <path d={vanes} strokeOpacity={0.6} />
      {/* fan: the only filled element apart from the spinner */}
      <g className={spin ? "spin-slow" : undefined} style={{ transformOrigin: `${F_CX}px ${F_CY}px` }} stroke="none">
        {Array.from({ length: count }, (_, i) => (
          <path
            key={i}
            d="M0 -14 L0 -60 Q11 -42 0 -14 Z"
            className={bladeClassName}
            fillOpacity={0.55}
            transform={`translate(${F_CX} ${F_CY}) rotate(${(360 / count) * i})`}
          />
        ))}
      </g>
      <circle cx={F_CX} cy={F_CY} r={12} className={spinnerClassName} stroke="none" />
    </svg>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Callout — IPC balloon with optional leader, elbow and side label.
 * ---------------------------------------------------------------------------------------------- */

const EMERALD = "#10b981";
const INK = "#0e141b";

export type CalloutProps = {
  n: string | number;
  x: number;
  y: number;
  tx?: number;
  ty?: number;
  /** horizontal run from the balloon before the diagonal to the target */
  elbow?: number;
  r?: number;
  tone?: "dark" | "light";
  active?: boolean;
  label?: string;
  labelSide?: "left" | "right";
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
};

export function Callout({ n, x, y, tx, ty, elbow, r = 9, tone = "light", active = false, label, labelSide = "right", strokeWidth = 1, className, style }: CalloutProps) {
  const hasLeader = tx !== undefined && ty !== undefined;
  let leader: string | null = null;
  if (hasLeader) {
    const dir = tx >= x ? 1 : -1;
    if (elbow !== undefined && elbow > 0) {
      const ex = x + dir * (r + elbow);
      leader = `M${round(x + dir * r)} ${y} L${round(ex)} ${y} L${tx} ${ty}`;
    } else {
      const dx = tx - x;
      const dy = ty - y;
      const len = Math.hypot(dx, dy) || 1;
      leader = `M${round(x + (dx / len) * r)} ${round(y + (dy / len) * r)} L${tx} ${ty}`;
    }
  }
  const balloonFill = active ? EMERALD : tone === "dark" ? INK : "#ffffff";
  const balloonStroke = active ? EMERALD : "currentColor";
  const textFill = active ? INK : "currentColor";
  const leaderStroke = active ? EMERALD : "currentColor";
  const labelX = labelSide === "right" ? x + r + 8 : x - r - 8;

  return (
    <g className={className} style={style}>
      {leader ? (
        <>
          <path d={leader} fill="none" stroke={leaderStroke} strokeWidth={active ? strokeWidth * 1.5 : strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={tx} cy={ty} r={1.5 * strokeWidth + 1.5} fill={leaderStroke} />
        </>
      ) : null}
      <circle cx={x} cy={y} r={r} fill={balloonFill} stroke={balloonStroke} strokeWidth={strokeWidth} />
      <text
        x={x}
        y={y}
        className="font-mono"
        fontSize={r * 1.1}
        fontWeight={600}
        fill={textFill}
        textAnchor="middle"
        dominantBaseline="central"
        letterSpacing={0}
        stroke="none"
      >
        {n}
      </text>
      {label ? (
        <text
          x={labelX}
          y={y}
          className="font-mono"
          fontSize={10}
          letterSpacing="0.1em"
          fill="currentColor"
          textAnchor={labelSide === "right" ? "start" : "end"}
          dominantBaseline="central"
          stroke="none"
          style={{ textTransform: "uppercase" }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

/* ------------------------------------------------------------------------------------------------
 * DimLine — engineering dimension line (horizontal or vertical).
 * ---------------------------------------------------------------------------------------------- */

export type DimLineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** distance of the dimension line from the measured points (positive = below / right) */
  offset?: number;
  label: string;
  fontSize?: number;
  strokeWidth?: number;
  /** 'in' = arrowheads inside the extension lines pointing outward (default) */
  arrows?: "in" | "out";
  className?: string;
};

const ARROW_LEN = 7;
const ARROW_HALF = 3.5;

function arrowhead(tipX: number, tipY: number, dirX: number, dirY: number) {
  // dir points from the base towards the tip
  const bx = tipX - dirX * ARROW_LEN;
  const by = tipY - dirY * ARROW_LEN;
  const nx = -dirY * ARROW_HALF;
  const ny = dirX * ARROW_HALF;
  return `${round(tipX)},${round(tipY)} ${round(bx + nx)},${round(by + ny)} ${round(bx - nx)},${round(by - ny)}`;
}

export function DimLine({ x1, y1, x2, y2, offset = 0, label, fontSize = 10, strokeWidth = 1, arrows = "in", className }: DimLineProps) {
  const horizontal = y1 === y2;
  const sign = offset < 0 ? -1 : 1;
  const gapWidth = label.length * 6.2 * (fontSize / 10);
  const tail = arrows === "out" ? ARROW_LEN + 6 : 0;
  const ext = 4;
  const gapFromPoint = 3;

  const labelStyle: CSSProperties = { textTransform: "uppercase", fontVariantNumeric: "tabular-nums" };
  const textProps = {
    className: "font-mono",
    fontSize,
    letterSpacing: "0.1em",
    fill: "currentColor",
    stroke: "none",
    dominantBaseline: "central" as const,
    style: labelStyle,
  };

  if (horizontal) {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const dimY = y1 + offset;
    const midX = (left + right) / 2;
    const gapL = Math.max(left, midX - gapWidth / 2);
    const gapR = Math.min(right, midX + gapWidth / 2);
    const extension = `M${left} ${round(y1 + sign * gapFromPoint)} L${left} ${round(dimY + sign * ext)} M${right} ${round(y1 + sign * gapFromPoint)} L${right} ${round(dimY + sign * ext)}`;
    const dim =
      arrows === "out"
        ? `M${round(left - tail)} ${dimY} L${left} ${dimY} M${left} ${dimY} L${round(gapL)} ${dimY} M${round(gapR)} ${dimY} L${right} ${dimY} M${right} ${dimY} L${round(right + tail)} ${dimY}`
        : `M${left} ${dimY} L${round(gapL)} ${dimY} M${round(gapR)} ${dimY} L${right} ${dimY}`;
    const headL = arrows === "in" ? arrowhead(left, dimY, -1, 0) : arrowhead(left, dimY, 1, 0);
    const headR = arrows === "in" ? arrowhead(right, dimY, 1, 0) : arrowhead(right, dimY, -1, 0);
    return (
      <g className={className} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeLinecap="round">
        <path d={extension} strokeOpacity={0.6} />
        <path d={dim} />
        <polygon points={headL} fill="currentColor" stroke="none" />
        <polygon points={headR} fill="currentColor" stroke="none" />
        <text x={midX} y={dimY} textAnchor="middle" {...textProps}>
          {label}
        </text>
      </g>
    );
  }

  // vertical
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const dimX = x1 + offset;
  const midY = (top + bottom) / 2;
  const gapH = fontSize * 1.4;
  const gapT = Math.max(top, midY - gapH / 2);
  const gapB = Math.min(bottom, midY + gapH / 2);
  const extension = `M${round(x1 + sign * gapFromPoint)} ${top} L${round(dimX + sign * ext)} ${top} M${round(x1 + sign * gapFromPoint)} ${bottom} L${round(dimX + sign * ext)} ${bottom}`;
  const dim =
    arrows === "out"
      ? `M${dimX} ${round(top - tail)} L${dimX} ${top} M${dimX} ${top} L${dimX} ${round(gapT)} M${dimX} ${round(gapB)} L${dimX} ${bottom} M${dimX} ${bottom} L${dimX} ${round(bottom + tail)}`
      : `M${dimX} ${top} L${dimX} ${round(gapT)} M${dimX} ${round(gapB)} L${dimX} ${bottom}`;
  const headT = arrows === "in" ? arrowhead(dimX, top, 0, -1) : arrowhead(dimX, top, 0, 1);
  const headB = arrows === "in" ? arrowhead(dimX, bottom, 0, 1) : arrowhead(dimX, bottom, 0, -1);
  return (
    <g className={className} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeLinecap="round">
      <path d={extension} strokeOpacity={0.6} />
      <path d={dim} />
      <polygon points={headT} fill="currentColor" stroke="none" />
      <polygon points={headB} fill="currentColor" stroke="none" />
      <text x={dimX + 6} y={midY} textAnchor="start" {...textProps}>
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------------------------------------
 * PlatformGlyph — 16–28 px filled top-view silhouettes.
 * ---------------------------------------------------------------------------------------------- */

export type PlatformKind = "airliner" | "helicopter" | "bizjet" | "ramp";

const GLYPH_AIRLINER = [
  // fuselage
  "M12 1 C13 1.5 13.5 3 13.5 5 L13.5 20 C13.5 21.2 13 22.2 12 22.8 C11 22.2 10.5 21.2 10.5 20 L10.5 5 C10.5 3 11 1.5 12 1 Z",
  // wings
  "M10.5 8.5 L1 15 L1 16.6 L10.5 13.6 Z",
  "M13.5 8.5 L23 15 L23 16.6 L13.5 13.6 Z",
  // nacelles
  roundedRectPath(7, 12, 2, 3.5, 1),
  roundedRectPath(17, 12, 2, 3.5, 1),
  // stabiliser
  "M10.5 18.6 L7.5 21.4 L7.5 22.8 L10.5 21.6 Z",
  "M13.5 18.6 L16.5 21.4 L16.5 22.8 L13.5 21.6 Z",
].join(" ");

const GLYPH_HELI_BODY = [
  "M12 4.5 C13.3 4.5 14 5.5 14 7 L14 13 C14 14.5 13.2 15.4 12.8 16 L12.8 20.6 L11.2 20.6 L11.2 16 C10.8 15.4 10 14.5 10 13 L10 7 C10 5.5 10.7 4.5 12 4.5 Z",
  ...[45, 135, 225, 315].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return barPath(12, 10, 12 + 9.5 * Math.cos(a), 10 + 9.5 * Math.sin(a), 1.2);
  }),
  roundedRectPath(12, 21.4, 4, 1.2, 0.6),
].join(" ");
const GLYPH_HELI_RING = `${circlePath(12, 10, 10.3)} ${circlePath(12, 10, 9.7)}`;

const GLYPH_BIZJET = [
  "M12 1 C12.9 1.6 13.2 3 13.2 5 L13.2 20 C13.2 21.2 12.8 22 12 22.5 C11.2 22 10.8 21.2 10.8 20 L10.8 5 C10.8 3 11.1 1.6 12 1 Z",
  "M10.8 8.5 L2 16.6 L2 17.8 L10.8 13 Z",
  "M13.2 8.5 L22 16.6 L22 17.8 L13.2 13 Z",
  roundedRectPath(9.5, 17, 2, 3.5, 1),
  roundedRectPath(14.5, 17, 2, 3.5, 1),
  roundedRectPath(12, 21.5, 8, 1.4, 0.7),
].join(" ");

const GLYPH_RAMP = [
  roundedRectPath(10, 12, 12, 1.6, 0.8),
  roundedRectPath(18, 12, 5, 4, 1),
  roundedRectPath(4, 12, 6, 6, 1.5),
  roundedRectPath(9.2, 9.4, 1.2, 2.2, 0.4),
  roundedRectPath(9.2, 14.6, 1.2, 2.2, 0.4),
].join(" ");

export type PlatformGlyphProps = {
  kind: PlatformKind;
  size?: number;
  className?: string;
  title?: string;
};

export function PlatformGlyph({ kind, size = 16, className, title }: PlatformGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="currentColor"
    >
      {title ? <title>{title}</title> : null}
      {kind === "airliner" ? <path d={GLYPH_AIRLINER} /> : null}
      {kind === "helicopter" ? (
        <>
          <path d={GLYPH_HELI_BODY} />
          <path d={GLYPH_HELI_RING} fillRule="evenodd" />
        </>
      ) : null}
      {kind === "bizjet" ? <path d={GLYPH_BIZJET} /> : null}
      {kind === "ramp" ? <path d={GLYPH_RAMP} /> : null}
    </svg>
  );
}

/* ------------------------------------------------------------------------------------------------
 * StandLeadIn — painted stand markings + green centreline lights for the Vision backdrop.
 * ---------------------------------------------------------------------------------------------- */

const LAMP = "#34d399";

export type StandLeadInProps = {
  /** stand axis x */
  x: number;
  /** bottom edge (where the lead-in enters the frame) */
  fromY: number;
  /** stop bar y */
  stopY: number;
  /** where the painted line continuing past the bar ends */
  toY?: number;
  /** number of centreline lamps (≤ 16) */
  lights?: number;
  /** scroll-linked draw progress for the lit overlay */
  progress?: MotionValue<number>;
  label?: string;
  labelSide?: "left" | "right";
  className?: string;
};

export function StandLeadIn({ x, fromY, stopY, toY, lights = 14, progress, label, labelSide = "right", className }: StandLeadInProps) {
  const leadIn = `M${x} ${fromY} L${x} ${stopY + 14}`;
  const count = Math.max(0, Math.min(16, Math.round(lights)));
  const lampStart = fromY - 20;
  const lampEnd = stopY + 30;
  const lamps = Array.from({ length: count }, (_, i) => lampStart + ((lampEnd - lampStart) * i) / Math.max(1, count - 1));
  const labelX = labelSide === "right" ? x + 32 + 12 : x - 32 - 12;

  return (
    <g className={className} aria-hidden stroke="currentColor" fill="none" strokeLinecap="butt">
      {/* painted lead-in */}
      <path d={leadIn} strokeWidth={2} strokeDasharray="24 12" />
      {/* line continuing into the hangar */}
      {toY !== undefined ? <path d={`M${x} ${stopY - 14} L${x} ${toY}`} strokeWidth={2} strokeDasharray="24 12" strokeOpacity={0.5} /> : null}
      {/* stop bar and wing-tip clearance ticks */}
      <path d={`M${x - 32} ${stopY} L${x + 32} ${stopY}`} strokeWidth={3} />
      <path d={`M${x - 110} ${stopY + 40} L${x - 92} ${stopY + 40} M${x + 92} ${stopY + 40} L${x + 110} ${stopY + 40}`} strokeWidth={2} />
      {/* lit overlay — green like a real taxiway/stand centreline light */}
      {progress ? (
        <motion.path d={leadIn} stroke={EMERALD} strokeOpacity={0.6} strokeWidth={2} style={{ pathLength: progress }} />
      ) : (
        <path d={leadIn} stroke={EMERALD} strokeOpacity={0.6} strokeWidth={2} />
      )}
      {/* centreline lamps */}
      <g stroke="none">
        {lamps.map((y, i) => (
          <g key={i}>
            <circle cx={x} cy={round(y)} r={7} fill={LAMP} fillOpacity={0.16} />
            <circle cx={x} cy={round(y)} r={2} fill={LAMP} />
          </g>
        ))}
      </g>
      {label ? (
        <text
          x={labelX}
          y={stopY}
          className="font-mono"
          fontSize={10}
          letterSpacing="0.14em"
          fill="currentColor"
          stroke="none"
          textAnchor={labelSide === "right" ? "start" : "end"}
          dominantBaseline="central"
          style={{ textTransform: "uppercase" }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Index
 * ---------------------------------------------------------------------------------------------- */

export const DRAWINGS = {
  AirlinerTop,
  HelicopterTop,
  BizjetTop,
  MainGear,
  FanFront,
  Callout,
  DimLine,
  Centerline,
  PlatformGlyph,
  StandLeadIn,
} as const;

export type DrawingName = keyof typeof DRAWINGS;
