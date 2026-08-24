/**
 * Single source of truth for brand + content.
 *
 * This page is a pre-launch teaser. Deliberately absent, per brief:
 * no pricing, no menu, no description of how the Perth service will operate.
 * The Mumbai history is the credibility; Perth is the news.
 */

export const site = {
  wordmark: "Mumbai Dabbawala",
  wordmarkShort: "MD",
  name: "Mumbai Dabbawala 2.0",
  city: "Perth",
  region: "Western Australia",
  positioning: "Mumbai’s legend comes to Perth.",
  launchDate: "14 September 2026",
  /** Midnight, launch day, Perth time (AWST / UTC+8). Drives the countdown. */
  launchIso: "2026-09-14T00:00:00+08:00",
  launchNote: "Perth metro first. Suburbs open in order of demand.",
  contact: "support@mumbaidabbawala.com.au",
} as const;

/** Scroll-sequence beats. `at` is the progress point (0–1) each headline owns. */
export const scrollBeats = [
  {
    at: 0.06,
    kicker: "Since 1890",
    heading: "Mumbai’s legend comes to Perth.",
  },
  {
    at: 0.42,
    kicker: "135 years of it",
    heading: "A hundred and thirty-five years in the making.",
  },
  {
    at: 0.78,
    kicker: "14 September 2026",
    heading: "Perth, it’s your turn.",
  },
] as const;

/**
 * The hook, as ticker phrases. Numbers are the Mumbai operation, not Perth's.
 * Kept short because they scroll past — full sentences don't read at speed.
 */
export const legacyTicker = [
  "Since 1890",
  "135 years unbroken",
  "5,000+ carriers",
  "200,000+ lunches a day",
  "Through every monsoon",
  "Collected warm, delivered warm",
] as const;

export type Dish = {
  slug: string;
  name: string;
  city: string;
  note: string;
  /** Matches the aspect the still was generated at — keeps the grid from cropping. */
  aspect: "3/4" | "4/3" | "1/1";
};

/**
 * Heritage gallery. Framed as what Mumbai kitchens have always packed into a
 * dabba — not an orderable menu, and deliberately carrying no prices.
 */
export const dishes: Dish[] = [
  {
    slug: "butter-chicken",
    name: "Butter Chicken",
    city: "Delhi",
    note: "Tomato, cream, kasuri methi.",
    aspect: "3/4",
  },
  {
    slug: "hyderabadi-biryani",
    name: "Hyderabadi Biryani",
    city: "Hyderabad",
    note: "Sealed under dough, opened at the table.",
    aspect: "3/4",
  },
  {
    slug: "paneer-tikka",
    name: "Paneer Tikka",
    city: "Amritsar",
    note: "Charred hot, finished with chaat masala.",
    aspect: "3/4",
  },
  {
    slug: "masala-dosa",
    name: "Masala Dosa",
    city: "Bengaluru",
    note: "Fermented overnight, crisp for ninety seconds.",
    aspect: "4/3",
  },
  {
    slug: "chole-bhature",
    name: "Chole Bhature",
    city: "Punjab",
    note: "A breakfast that argues with lunch.",
    aspect: "3/4",
  },
  {
    slug: "gulab-jamun",
    name: "Gulab Jamun",
    city: "Kolkata",
    note: "Warm, soaked, rose-scented.",
    aspect: "1/1",
  },
];

/** Perth metro suburbs offered in the sign-up modal. Fixed list, optional field. */
export const perthSuburbs = [
  "Perth CBD",
  "Northbridge",
  "East Perth",
  "West Perth",
  "Subiaco",
  "Leederville",
  "Mount Lawley",
  "Victoria Park",
  "South Perth",
  "Como",
  "Nedlands",
  "Claremont",
  "Cottesloe",
  "Fremantle",
  "Scarborough",
  "Joondalup",
  "Morley",
  "Cannington",
  "Canning Vale",
  "Midland",
  "Ellenbrook",
  "Rockingham",
  "Armadale",
  "Other / not listed",
] as const;
