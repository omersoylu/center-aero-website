"use client";

/* Marquee physics adapted from "Logo Marquee" by ddoemonn on 21st.dev (hover/focus pause, reduced-motion aware). */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PLATFORM_ROWS } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { PlatformGlyph, type PlatformKind } from "@/components/aviation/drawings";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const RAMP = 0.19;
const SETTLE = 0.16;
const MAX_COPIES = 14;

type Direction = "left" | "right";

// ICAO Doc 8643 type designators — leave a name out of the map rather than guess
const ICAO: Record<string, string> = {
  "Boeing 737": "B738",
  "Boeing 747": "B744",
  "Boeing 757": "B752",
  "Boeing 767": "B763",
  "Boeing 777": "B77W",
  "Boeing 787": "B789",
  "Airbus A220": "BCS3",
  "Airbus A320 family": "A320",
  "Airbus A330": "A333",
  "Airbus A340": "A343",
  "Airbus A350": "A359",
  "Airbus A380": "A388",
  "Leonardo AW139": "A139",
  "Leonardo AW169": "A169",
  "Leonardo AW189": "A189",
  "Airbus H125": "AS50",
  "Airbus H135": "EC35",
  "Airbus H145": "EC45",
  "Airbus H160": "H160",
  "Airbus H175": "EC75",
  "Embraer Phenom 300": "E55P",
  "Embraer Praetor 600": "E550",
  "Bombardier Challenger 350": "CL35",
  "Bombardier Global 7500": "GL7T",
  "Dassault Falcon 7X": "FA7X",
  "Dassault Falcon 8X": "FA8X",
  "Dassault Falcon 6X": "FA6X",
};

/** Which top-view glyph a platform name gets in the marquee. */
function kindOf(label: string): PlatformKind {
  if (label.includes("AW") || label.includes("Airbus H")) return "helicopter";
  if (["Phenom", "Praetor", "Challenger", "Global", "Falcon"].some((s) => label.includes(s))) return "bizjet";
  return "airliner";
}

function fold(x: number, loop: number) {
  const m = x % loop;
  return m > 0 ? m - loop : m;
}
function clamp(x: number, min: number, max: number) {
  return x < min ? min : x > max ? max : x;
}

function useMarquee({ speed = 44, direction = "left" as Direction, gap = 40 }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(4);
  const [held, setHeld] = useState(false);
  const [near, setNear] = useState(false);
  const reduced = useReducedMotion() === true;

  const reducedRef = useRef(reduced);
  const movingRef = useRef(false);
  useEffect(() => {
    reducedRef.current = reduced;
    movingRef.current = !held && !reduced;
  }, [held, reduced]);

  const offset = useRef(0);
  const nudge = useRef(0);
  const rate = useRef(0);
  const span = useRef(0);

  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const x = reducedRef.current ? 0 : offset.current - span.current;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  }, []);

  useIsoLayoutEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;
    const measure = () => {
      const width = group.getBoundingClientRect().width;
      const loop = width > 0 ? width + gap : 0;
      const room = viewport.getBoundingClientRect().width;
      span.current = loop;
      offset.current = loop > 0 ? clamp(offset.current, -loop, loop) : 0;
      paint();
      const next = reduced || loop <= 0 ? 4 : clamp(Math.ceil(room / loop) + 3, 4, MAX_COPIES);
      setCopies((prev) => (prev === next ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    return () => observer.disconnect();
  }, [gap, paint, reduced]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setNear(entry.isIntersecting);
      },
      { rootMargin: "96px" },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !near) return;
    let frame = 0;
    let last = 0;
    const sign = direction === "right" ? 1 : -1;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const loop = span.current;
      if (loop <= 0) return;
      rate.current += ((movingRef.current ? 1 : 0) - rate.current) * (1 - Math.exp(-dt / RAMP));
      const pull = nudge.current * (1 - Math.exp(-dt / SETTLE));
      nudge.current -= pull;
      let x = offset.current + sign * speed * rate.current * dt + pull;
      if (rate.current > 0.002 && Math.abs(nudge.current) < 0.25) {
        nudge.current = 0;
        x = fold(x, loop);
      } else {
        x = clamp(x, -loop, loop);
      }
      offset.current = x;
      paint();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, near, speed, direction, paint]);

  const bind = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") setHeld(true);
    },
    onPointerLeave: () => setHeld(false),
    onPointerCancel: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: () => setHeld(false),
  };

  return { viewportRef, trackRef, groupRef, copies, reduced, bind };
}

function Row({ items, direction, speed, gap = 48 }: { items: string[]; direction: Direction; speed: number; gap?: number }) {
  const { viewportRef, trackRef, groupRef, copies, reduced, bind } = useMarquee({ speed, direction, gap });
  const groups = reduced ? 1 : copies;
  return (
    <div className="relative isolate w-full overflow-hidden" {...bind}>
      <div ref={viewportRef} style={{ overflowX: reduced ? "auto" : "hidden" }} className="overflow-y-hidden py-3">
        <div ref={trackRef} style={{ gap, willChange: "transform" }} className="flex w-max items-center">
          {Array.from({ length: groups }, (_, copy) => (
            <ul key={copy} ref={copy === (reduced ? 0 : 1) ? groupRef : undefined} aria-hidden={copy === (reduced ? 0 : 1) ? undefined : true} style={{ gap }} className="flex w-max items-center">
              {items.map((label) => {
                const code = ICAO[label];
                return (
                  <li key={label} className="flex shrink-0 items-center gap-[48px]">
                    <span className="flex items-center gap-2.5">
                      <PlatformGlyph kind={kindOf(label)} size={16} className="shrink-0 text-graphite-400" />
                      <span lang="en" className="whitespace-nowrap font-mono text-[13px] uppercase tracking-[0.16em] text-graphite-600">{label}</span>
                      {code ? <span lang="en" className="font-mono text-[11px] tracking-[0.12em] text-emerald-600">{code}</span> : null}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-emerald-500/70" aria-hidden />
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-white/0" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-white/0" />
    </div>
  );
}

export function PlatformMarquee() {
  const { t } = useLang();
  return (
    <section aria-label={t.marquee.label} className="bg-white">
      <div className="container-x flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-8">
        <p className="kicker">{t.marquee.label}</p>
        <p className="dim-label text-graphite-400">{t.marquee.note}</p>
      </div>
      <div className="pb-4 pt-2">
        <Row items={PLATFORM_ROWS[0]} direction="left" speed={38} />
        <Row items={PLATFORM_ROWS[1]} direction="right" speed={30} />
      </div>
      {/* runway-centreline rule (30/20 stripe ratio) hands off to Claims */}
      <div aria-hidden className="container-x">
        <div className="rule-centreline" />
      </div>
    </section>
  );
}
