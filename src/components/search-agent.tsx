"use client";

import { Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { MatchingConsole } from "./matching-console";
import { Reveal } from "./ui/reveal";

/* The Live Search Agent panel gets its own band so the hero can give the airframe the stage. */
export function SearchAgent() {
  const { t } = useLang();
  return (
    <section id="agent" className="relative isolate overflow-hidden bg-graphite-950 text-white">
      <div aria-hidden className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_50%,black_10%,transparent_70%)]" />
      <div aria-hidden className="absolute -right-32 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="container-x relative grid items-center gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-5">
          <Reveal>
            <p className="kicker text-emerald-400">{t.agent.kicker}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">{t.agent.title}</h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 text-lg leading-relaxed text-graphite-300">{t.agent.lead}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <ul className="mt-8 space-y-3">
              {t.agent.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-graphite-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <Reveal delay={0.1}>
            <MatchingConsole />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
