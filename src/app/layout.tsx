import type { Metadata } from "next";
import { Asar, Geist_Mono, Palanquin, Geist } from "next/font/google";

import { site } from "@/lib/site";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/** Brand display face — headings only. */
const asar = Asar({
  variable: "--font-asar",
  subsets: ["latin", "devanagari"],
  weight: "400",
  display: "swap",
});

/** Brand text face — body copy, labels, UI. */
const palanquin = Palanquin({
  variable: "--font-palanquin",
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  `Mumbai's dabbawalas have delivered home-cooked lunches since 1890. ` +
  `From ${site.launchDate}, they come to ${site.city}. Join the waitlist.`;

export const metadata: Metadata = {
  title: `${site.name} — ${site.positioning}`,
  description,
  openGraph: {
    title: `${site.name} — ${site.positioning}`,
    description,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", asar.variable, palanquin.variable, geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
