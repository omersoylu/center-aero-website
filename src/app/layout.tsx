import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.centeraero.com"),
  alternates: { canonical: "/" },
  title: "Center Aero — The center of aviation supply",
  description:
    "Center Aero lists the live stock of aviation suppliers and matches every request with the right part and the right end user in seconds. Rotables, engine, chemicals, expendables and ground equipment for commercial, rotary and business aviation.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Center Aero — The center of aviation supply",
    description: "Automated quoting, procurement, buying and selling for aviation spare parts. One center for every product group and platform.",
    type: "website",
    url: "https://www.centeraero.com",
    siteName: "Center Aero",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
