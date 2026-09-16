"use client";

import { useLang } from "@/lib/i18n";
import { Callout } from "@/components/aviation/drawings";
import { Reveal } from "./ui/reveal";

/**
 * Three claims set as numbered IPC callouts: a balloon on the left rail with a
 * hairline leader dropping from it, the caption/value/label to the right.
 */
export function Claims() {
  const { t } = useLang();
  return (
    <section className="bg-white">
      <div className="container-x grid gap-10 py-16 md:grid-cols-3 md:gap-8 md:py-20">
        {t.claims.map((c, i) => (
          <Reveal key={c.value} delay={i * 0.1}>
            <div className="flex h-full md:min-h-[9rem]">
              {/* callout rail: balloon + leader drop line */}
              <div className="flex flex-col items-center" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0 text-emerald-500" focusable="false">
                  <Callout n={i + 1} x={12} y={12} r={10} tone="light" strokeWidth={1.25} className="text-emerald-600" />
                </svg>
                <span className="mt-2 w-px flex-1 bg-graphite-200" />
              </div>
              <div className="pl-5">
                <p className="dim-label leading-6 text-graphite-400">{c.caption}</p>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-graphite-900 md:text-5xl">{c.value}</p>
                <p className="mt-3 max-w-xs text-graphite-500">{c.label}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      {/* runway-centreline rule hands off to How it works */}
      <div aria-hidden className="container-x">
        <div className="rule-centreline" />
      </div>
    </section>
  );
}
