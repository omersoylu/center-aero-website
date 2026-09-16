import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

type Props = {
  kicker: string;
  title: string;
  lead?: string;
  /** Optional reference tag rendered inline after the kicker (e.g. "ATA 100"). Always English, so it is wrapped in lang="en". */
  meta?: string;
  dark?: boolean;
  className?: string;
};

export function SectionHeading({ kicker, title, lead, meta, dark = false, className }: Props) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Reveal>
        <p className={cn("kicker flex items-center gap-3", dark && "text-emerald-400")}>
          <span>{kicker}</span>
          {meta ? (
            <span lang="en" className={cn("code-tag font-medium", dark ? "border-white/15 text-graphite-400" : "border-graphite-200 text-graphite-400")}>
              {meta}
            </span>
          ) : null}
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className={cn("mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight md:text-5xl", dark ? "text-white" : "text-graphite-900")}>{title}</h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.16}>
          <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-graphite-300" : "text-graphite-500")}>{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
