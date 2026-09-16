"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useLang } from "@/lib/i18n";
import { StandLeadIn } from "./aviation/drawings";
import { Mark } from "./logo";
import { Reveal } from "./ui/reveal";

export function Vision() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  // Stand centreline lights switch on as the section scrolls into view, leading up to the Mark.
  const lit = useTransform(scrollYProgress, [0.12, 0.55], [0, 1]);

  const emphasis = t.hero.em; // "center" / "merkezi" — highlighted wherever it appears
  const titleWords = t.vision.title.split(" ");

  return (
    <section id="vision" ref={ref} className="relative isolate overflow-hidden bg-graphite-950 text-white">
      <div aria-hidden className="blueprint-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_50%,black_10%,transparent_70%)]" />
      {/*
       * Stand lead-in backdrop (lg and up). The 1440 × 900 canvas is sliced to cover the section;
       * x = 1010 puts the stand axis under the Mark's horizontal centre, the stop bar at y = 470 sits
       * at its vertical centre. Under reduced motion the lit overlay is fully drawn and static.
       */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full text-white lg:block"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <StandLeadIn
          x={1010}
          fromY={900}
          stopY={470}
          toY={140}
          lights={14}
          progress={reduce ? undefined : lit}
          label={t.vision.stand}
          labelSide="right"
          className="text-white/[0.14]"
        />
      </svg>
      <motion.div aria-hidden style={{ y, rotate }} className="pointer-events-none absolute -right-[6%] top-1/2 w-[62vw] max-w-[860px] -translate-y-1/2 opacity-[0.08]">
        <Mark className="w-full" color="#10b981" />
      </motion.div>

      <div className="container-x relative py-28 md:py-40">
        <Reveal>
          <p className="kicker text-emerald-400">{t.vision.kicker}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] md:text-6xl lg:text-7xl">
            {titleWords.map((w, i) => {
              const clean = w.toLowerCase().replace(/[.,!?]/g, "");
              const em = clean === emphasis || clean === "center" || clean === "merkezi";
              return (
                <span key={`${w}-${i}`} className={em ? "text-emerald-400" : undefined}>
                  {w}{i < titleWords.length - 1 ? " " : ""}
                </span>
              );
            })}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <Reveal delay={0.16} className="lg:col-span-7">
            <p className="text-lg leading-relaxed text-graphite-300 md:text-xl">{t.vision.body}</p>
            <p className="mt-6 text-lg font-semibold text-white md:text-xl">{t.vision.closing}</p>
          </Reveal>
        </div>
        <Reveal delay={0.22}>
          <div className="mt-20 flex items-center gap-4">
            <span className="h-px w-10 bg-emerald-500" aria-hidden />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-400">{t.vision.tagline}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
