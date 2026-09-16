"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { SectionHeading } from "./ui/section-heading";
import { Reveal } from "./ui/reveal";
import { ButtonLink } from "./ui/button";
import { MainGear, PlatformGlyph } from "./aviation/drawings";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Audiences() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const cards = [{ ...t.audiences.buyers }, { ...t.audiences.suppliers }];

  return (
    <section id="audiences" className="bg-white">
      <div className="container-x py-24 md:py-32">
        <SectionHeading kicker={t.audiences.kicker} title={t.audiences.title} />
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.12}>
              {/* `isolate` makes the article a stacking context so the -z-10 figure sits behind the text, above the card ground. */}
              <article className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-graphite-200 bg-graphite-50 p-8 md:p-10">
                {/* Figure — buyers: 737-class main landing gear (ATA 32); suppliers: the three platform silhouettes. Decorative, behind type. */}
                {i === 0 ? (
                  <div aria-hidden className="pointer-events-none absolute right-8 top-8 -z-10 hidden h-[96px] text-graphite-300 opacity-70 md:block">
                    <MainGear className="h-full w-auto" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div aria-hidden className="pointer-events-none absolute right-8 top-8 -z-10 hidden items-end gap-3 text-graphite-300 md:flex">
                    <PlatformGlyph kind="airliner" size={28} />
                    <PlatformGlyph kind="helicopter" size={22} />
                    <PlatformGlyph kind="bizjet" size={22} />
                  </div>
                )}

                {/* Header row: index + code strip (priority classes / condition codes). Right padding keeps the tag clear of the figure on md+. */}
                <div className="flex items-center justify-between md:pr-32">
                  <p className="kicker">0{i + 1}</p>
                  <span className="code-tag border-graphite-200 text-graphite-500">{c.strip}</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-graphite-900">{c.title}</h3>
                <p className="mt-3 leading-relaxed text-graphite-500">{c.body}</p>

                {/* Task-card rows: item number, text, dotted leader, sign-off check. */}
                <ul className="mt-7 space-y-3">
                  {c.points.map((p, j) => (
                    <motion.li
                      key={p}
                      initial={reduce ? false : { opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + j * 0.08, duration: 0.5, ease: EASE }}
                      className="flex items-end gap-3 text-[15px] text-graphite-800"
                    >
                      <span className="pb-0.5 font-mono text-[10px] tracking-[0.1em] text-graphite-400">0{j + 1}</span>
                      <span className="pb-0.5">{p}</span>
                      <span aria-hidden className="mx-1 mb-2 min-w-6 flex-1 border-b border-dotted border-graphite-300" />
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-9">
                  <ButtonLink href="#contact" variant="dark">
                    {c.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
