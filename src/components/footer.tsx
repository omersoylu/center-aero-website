"use client";

import { Logo } from "./logo";
import { LangToggle } from "./ui/lang-toggle";
import { useLang } from "@/lib/i18n";

/** `year` comes from the Server Component in page.tsx: reading the clock here would make this
 *  statically prerendered page compare the build year with the visitor's clock on hydration. */
export function Footer({ year }: { year: number }) {
  const { t } = useLang();
  const platformLinks = [
    { href: "#how", label: t.nav.how },
    { href: "#aircraft", label: t.nav.aircraft },
    { href: "#audiences", label: t.audiences.kicker },
  ];
  return (
    <footer className="bg-graphite-950 text-white">
      {/* Threshold lights on the ground line — green, as the real ones are. */}
      <div aria-hidden className="threshold-lights" />
      <div aria-hidden className="h-px w-full bg-white/10" />

      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo className="h-7 w-auto" />
          <p className="mt-5 max-w-sm text-graphite-400">{t.footer.tagline}</p>
          <p className="mt-6 text-[14px] text-graphite-400">
            <span className="font-semibold text-graphite-200">{t.contact.company}</span>
            <br />
            {t.contact.address.join(", ")}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-500">{t.footer.columns.platform}</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {platformLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-graphite-300 transition-colors hover:text-white">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-500">{t.footer.columns.groups}</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {t.groups.items.map((g) => (
              <li key={g.key}>
                <a href="#groups" className="text-graphite-300 transition-colors hover:text-white">{g.title}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-500">{t.footer.columns.company}</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            <li><a href="#vision" className="text-graphite-300 transition-colors hover:text-white">{t.footer.companyLinks[0]}</a></li>
            <li><a href="#contact" className="text-graphite-300 transition-colors hover:text-white">{t.footer.companyLinks[1]}</a></li>
          </ul>
          <div className="mt-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-graphite-500">{t.footer.language}</p>
            <LangToggle tone="dark" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-6 py-6 text-[12px] text-graphite-500 md:flex-row md:items-center md:justify-between">
          <p>© {year} {t.contact.company}. {t.footer.rights}</p>
          {/* Condition-code legend — localized, so no lang override. */}
          <p className="hidden font-mono text-[10px] normal-case tracking-[0.04em] text-graphite-500 lg:block">{t.footer.legend}</p>
          <p className="font-mono uppercase tracking-[0.16em]">
            {t.vision.tagline} <span className="text-graphite-600">· {t.footer.meta}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
