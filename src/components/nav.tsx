"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { LangToggle } from "./ui/lang-toggle";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Nav() {
  const { t } = useLang();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const hero = document.getElementById("hero");
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
    setScrolled(y > 16);
    setOnDark(y < heroBottom - 80);
  });

  const links = [
    { href: "#agent", label: t.nav.agent },
    { href: "#how", label: t.nav.how },
    { href: "#groups", label: t.nav.groups },
    { href: "#aircraft", label: t.nav.aircraft },
    { href: "#vision", label: t.nav.vision },
    { href: "#contact", label: t.nav.contact },
  ];

  const dark = onDark || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color,backdrop-filter] duration-500",
        dark ? "text-white" : "text-graphite-800",
        scrolled || open
          ? dark
            ? "border-white/10 bg-graphite-950/70 backdrop-blur-xl"
            : "border-graphite-200/80 bg-white/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <a href="#hero" aria-label="Center Aero — home" className="shrink-0">
          <Logo className="h-[26px] w-auto" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn("text-[14px] font-medium transition-colors", dark ? "text-graphite-300 hover:text-white" : "text-graphite-500 hover:text-graphite-900")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LangToggle tone={dark ? "dark" : "light"} />
          <a
            href="#contact"
            className={cn(
              "group inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors",
              dark ? "bg-white text-graphite-950 hover:bg-emerald-300" : "bg-graphite-800 text-white hover:bg-graphite-700",
            )}
          >
            {t.nav.cta}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          type="button"
          aria-label={t.nav.menu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/20 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-graphite-950 text-white lg:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-lg font-medium text-graphite-200 hover:bg-white/5">
                  {l.label}
                </a>
              ))}
              <div className="mt-3 flex items-center justify-between px-2 pb-2">
                <LangToggle tone="dark" />
                <a href="#contact" onClick={() => setOpen(false)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-graphite-950">
                  {t.nav.cta} <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
