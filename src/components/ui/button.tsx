import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "ghost" | "ghost-light";

const styles: Record<Variant, string> = {
  primary: "bg-emerald-500 text-graphite-950 hover:bg-emerald-400",
  dark: "bg-graphite-800 text-white hover:bg-graphite-700",
  ghost: "border border-graphite-300 text-graphite-800 hover:border-graphite-800",
  "ghost-light": "border border-white/25 text-white hover:border-white/60 hover:bg-white/5",
};

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode };

export function ButtonLink({ variant = "primary", className, children, ...props }: Props) {
  return (
    <a
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-[background-color,border-color,color,transform] duration-300 ease-out active:scale-[0.98]",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
