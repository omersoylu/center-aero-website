"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { CONSOLE_REQUESTS, type UrgencyKey } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { Mark } from "./logo";
import { cn } from "@/lib/utils";

type Row = { id: number; idx: number; status: "searching" | "matched" };
const VISIBLE = 4;
const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------------------------------------
 * UTC clock — one shared ticker for every subscriber, read through useSyncExternalStore.
 * The snapshot is cached (no Date call during render) and the server snapshot is stable, so the
 * clock hydrates as "--:--:--Z" and starts once the first subscriber mounts.
 * ---------------------------------------------------------------------------------------------- */

const utcListeners = new Set<() => void>();
let utcCached = "";
let utcTimer: number | undefined;

function utcTick() {
  const next = new Date().toISOString().slice(11, 19) + "Z";
  if (next !== utcCached) {
    utcCached = next;
    utcListeners.forEach((l) => l());
  }
}

function utcSubscribe(cb: () => void) {
  utcListeners.add(cb);
  if (utcListeners.size === 1) {
    utcTick();
    utcTimer = window.setInterval(utcTick, 1000);
  }
  return () => {
    utcListeners.delete(cb);
    if (utcListeners.size === 0 && utcTimer !== undefined) {
      window.clearInterval(utcTimer);
      utcTimer = undefined;
    }
  };
}

const utcSnapshot = () => utcCached;
const utcServerSnapshot = () => "";

function UtcClock() {
  const { t } = useLang();
  const v = useSyncExternalStore(utcSubscribe, utcSnapshot, utcServerSnapshot);
  return (
    <time aria-label={t.console.utcLabel} lang="en" className="font-mono text-[11px] tracking-[0.14em] tabular-nums text-emerald-300/90">
      {v || "--:--:--Z"}
    </time>
  );
}

/** Illustrative "live matching" panel: requests stream in and get matched in seconds. */
export function MatchingConsole() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<Row[]>([
    { id: 2, idx: 2, status: "searching" },
    { id: 1, idx: 1, status: "matched" },
    { id: 0, idx: 0, status: "matched" },
  ]);
  const counter = useRef(3);

  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const timeouts: number[] = [];
    const settle = (id: number, delay: number) =>
      timeouts.push(
        window.setTimeout(() => {
          if (alive) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "matched" } : r)));
        }, delay),
      );
    settle(2, 1300);
    const interval = window.setInterval(() => {
      const id = counter.current++;
      const fresh: Row = { id, idx: id % CONSOLE_REQUESTS.length, status: "searching" };
      setRows((prev) => [fresh, ...prev].slice(0, VISIBLE));
      settle(id, 1500);
    }, 3000);
    return () => {
      alive = false;
      window.clearInterval(interval);
      timeouts.forEach((x) => window.clearTimeout(x));
    };
  }, [reduce]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
      className="relative rounded-2xl border border-white/10 bg-graphite-900/70 p-1 shadow-console backdrop-blur-xl"
    >
      <div className="rounded-[14px] bg-gradient-to-b from-white/[0.05] to-transparent">
        <header className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <Mark className="h-6 w-6" color="#10b981" />
            <div>
              <p className="text-sm font-semibold text-white">{t.console.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-400">{t.console.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UtcClock />
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
          </div>
        </header>

        {/* Rows: STN | P/N + priority ... status / platform · ATA · qty · cond. The status chip moves to its
            own line when the panel is narrower than 28rem (phones, lg column). */}
        <ul className="@container px-2 py-2">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row) => {
              const r = CONSOLE_REQUESTS[row.idx];
              const urgency = r.urgency.toLowerCase() as UrgencyKey;
              return (
                <motion.li
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="border-b border-white/6 last:border-b-0"
                >
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 px-3 py-3.5 @md:grid-cols-[auto_1fr_auto]">
                    <span lang="en" title={t.console.stnTitle} className="code-tag col-start-1 row-span-2 row-start-1 self-center border-white/15 text-graphite-300">
                      {r.stn}
                    </span>
                    <p className="col-start-2 row-start-1 flex min-w-0 items-center gap-2 self-center">
                      <span lang="en" className="whitespace-nowrap font-mono text-[13px] tracking-tight text-white">
                        {r.pn}
                      </span>
                      {urgency !== "routine" ? (
                        <span
                          title={t.console.urgencyTitle[urgency]}
                          className={cn("code-tag", urgency === "aog" ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300" : "border-white/15 text-graphite-200")}
                        >
                          {t.console.urgency[urgency]}
                        </span>
                      ) : null}
                    </p>
                    {/* platform · ATA · qty · cond — one line in a wide panel, platform / codes in a narrow one */}
                    <p className="col-start-2 row-start-2 min-w-0 text-xs text-graphite-400 @md:col-end-4 @md:truncate">
                      <span className="block truncate @md:inline">
                        {r.platform}
                        <span className="hidden @md:inline"> · </span>
                      </span>
                      <span className="block truncate @md:inline">
                        <abbr title={t.console.ataTitle} className="no-underline" lang="en">
                          {t.console.ata} {r.ata}
                        </abbr>{" "}
                        · {t.console.qty} {r.qty} ·{" "}
                        <abbr title={t.console.condTitles[r.cond]} className="no-underline">
                          {t.console.cond} {r.cond}
                        </abbr>
                      </span>
                    </p>
                    <div className="col-span-2 row-start-3 mt-1.5 justify-self-start @md:col-start-3 @md:col-end-4 @md:row-start-1 @md:mt-0 @md:self-center @md:justify-self-end">
                      <StatusChip status={row.status} offers={r.offers} time={r.time} />
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <footer className="border-t border-white/8 px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-graphite-400">{t.console.footer}</p>
          <p className="mt-1 font-mono text-[10px] normal-case tracking-[0.04em] text-graphite-500">{t.console.legend}</p>
        </footer>
      </div>
    </motion.div>
  );
}

function StatusChip({ status, offers, time }: { status: Row["status"]; offers: number; time: string }) {
  const { t } = useLang();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "searching" ? (
        <motion.span
          key="searching"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] text-graphite-300"
        >
          <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-graphite-300" />
          {t.console.searching}
        </motion.span>
      ) : (
        <motion.span
          key="matched"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 font-mono text-[11px] text-emerald-300")}
        >
          {t.console.matched} · {offers} {t.console.offers} · {time}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
