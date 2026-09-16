"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
};

/** Fade + rise + un-blur into view when scrolled onscreen. */
export function Reveal({ children, className, delay = 0, y = 24, once = true, amount = 0.25 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
