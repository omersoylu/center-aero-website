"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { UrgencyKey } from "@/lib/content";
import { SectionHeading } from "./ui/section-heading";
import { Reveal } from "./ui/reveal";
import { Mark } from "./logo";
import { PlatformGlyph } from "./aviation/drawings";
import { cn } from "@/lib/utils";

const field = "w-full rounded-lg border border-graphite-200 bg-white px-3.5 py-3 text-[15px] text-graphite-900 placeholder:text-graphite-400 transition-colors focus:border-emerald-500 focus:outline-none";
const fieldLabel = "mb-1.5 block text-[13px] font-medium text-graphite-700";

/** RFQ priority classes, in the order they appear on the form (AOG = aircraft on ground). */
const PRIORITIES: readonly UrgencyKey[] = ["aog", "critical", "routine"];

// Geographic fact — nearest airport to the HQ address; confirm wording with the client before launch.
const SHOW_STATION = true;

export function Contact() {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [priority, setPriority] = useState<UrgencyKey>("routine");
  const [cond, setCond] = useState<Set<string>>(() => new Set());

  // TODO: connect to an email/CRM endpoint before launch. Currently a client-side confirmation only.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    window.setTimeout(() => setState("sent"), 700);
  }

  function toggleCond(code: string) {
    setCond((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  return (
    <section id="contact" className="border-t border-graphite-200 bg-graphite-50">
      <div className="container-x grid gap-14 py-24 lg:grid-cols-12 md:py-32">
        <div className="lg:col-span-5">
          <SectionHeading kicker={t.contact.kicker} title={t.contact.title} lead={t.contact.lead} />
          <Reveal delay={0.2}>
            <dl className="mt-12 space-y-8">
              <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-card">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-400">{t.contact.addressLabel}</dt>
                  <dd className="mt-1 text-[15px] font-semibold text-graphite-900">{t.contact.company}</dd>
                  {t.contact.address.map((l) => (
                    <dd key={l} className="text-[15px] text-graphite-500">{l}</dd>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-card">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-400">{t.contact.hoursLabel}</dt>
                  <dd className="mt-1 text-[15px] text-graphite-500">{t.contact.hours}</dd>
                </div>
              </div>
              {SHOW_STATION ? (
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-card">
                    <PlatformGlyph kind="airliner" size={20} />
                  </span>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-400">{t.contact.stationLabel}</dt>
                    <dd lang="en" className="mt-1 font-mono text-[14px] text-graphite-900">{t.contact.station}</dd>
                  </div>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <form onSubmit={onSubmit} className="relative rounded-2xl border border-graphite-200 bg-white p-6 shadow-card md:p-8">
            {/* RFQ header: title + the mark in emerald. */}
            <div className="mb-5 flex items-center justify-between border-b border-graphite-100 pb-4">
              <p className="text-sm font-semibold text-graphite-800">{t.contact.formTitle}</p>
              <Mark className="h-4 w-4" color="#10b981" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={fieldLabel}>{t.contact.fields.name}</span>
                <input required name="name" autoComplete="name" placeholder={t.contact.placeholders.name} className={field} />
              </label>
              <label className="block">
                <span className={fieldLabel}>{t.contact.fields.company}</span>
                <input required name="company" autoComplete="organization" placeholder={t.contact.placeholders.company} className={field} />
              </label>
              <label className="block md:col-span-2">
                <span className={fieldLabel}>{t.contact.fields.email}</span>
                <input required type="email" name="email" autoComplete="email" placeholder={t.contact.placeholders.email} className={field} />
              </label>

              {/* Part number — P/N prefix like an RFQ line. */}
              <label className="block md:col-span-2">
                <span className={fieldLabel}>{t.contact.fields.need}</span>
                <div className="flex">
                  <span lang="en" className="flex items-center rounded-l-lg border border-r-0 border-graphite-200 bg-graphite-50 px-3 font-mono text-[12px] text-graphite-400">
                    {t.contact.pn}
                  </span>
                  <input name="need" placeholder={t.contact.placeholders.need} className={cn(field, "rounded-l-none font-mono text-[14px]")} />
                </div>
              </label>

              {/* Priority — AOG / Critical / Routine. Radios stay in the tab order; the visible pill mirrors focus. */}
              <fieldset className="md:col-span-2">
                <legend className={fieldLabel}>{t.contact.fields.priority}</legend>
                <div className="inline-flex rounded-full border border-graphite-200 bg-white p-0.5">
                  {PRIORITIES.map((value) => (
                    <label key={value} className="relative">
                      <input
                        type="radio"
                        name="priority"
                        value={value}
                        className="peer sr-only"
                        checked={priority === value}
                        onChange={() => setPriority(value)}
                      />
                      <span
                        title={t.console.urgencyTitle[value]}
                        className={cn(
                          "block cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-500",
                          priority === value
                            ? value === "aog"
                              ? "bg-emerald-500 text-graphite-950"
                              : "bg-graphite-800 text-white"
                            : "text-graphite-500 hover:text-graphite-900",
                        )}
                      >
                        {t.console.urgency[value]}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Acceptable condition — NE / NS / OH / SV / AR, multi-select. */}
              <fieldset className="md:col-span-2">
                <legend className={fieldLabel}>{t.contact.fields.cond}</legend>
                <div className="flex flex-wrap gap-2">
                  {t.contact.condOptions.map((code) => (
                    <button
                      type="button"
                      key={code}
                      aria-pressed={cond.has(code)}
                      title={t.console.condTitles[code]}
                      onClick={() => toggleCond(code)}
                      lang="en"
                      className={cn(
                        "code-tag h-8 px-3 text-[11px] transition-colors",
                        cond.has(code) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-graphite-200 text-graphite-500 hover:border-graphite-400",
                      )}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="cond" value={Array.from(cond).join(",")} />
              </fieldset>

              <label className="block md:col-span-2">
                <span className={fieldLabel}>{t.contact.fields.message}</span>
                <textarea name="message" rows={4} placeholder={t.contact.placeholders.message} className={field} />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={state !== "idle"}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-graphite-800 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-graphite-700 disabled:opacity-60"
              >
                {state === "sending" ? t.contact.sending : t.contact.submit}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <AnimatePresence>
              {state === "sent" ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-800"
                >
                  {t.contact.sent}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
