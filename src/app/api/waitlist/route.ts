import { NextResponse } from "next/server";

import { perthSuburbs } from "@/lib/site";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUBURBS = new Set<string>(perthSuburbs);

/**
 * Australian mobiles are 04XX XXX XXX nationally, +61 4XX XXX XXX in E.164.
 * Accept either shape and normalise to +61 4XXXXXXXX.
 */
function normaliseAuMobile(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");

  let national: string | null = null;
  if (digits.length === 9 && digits.startsWith("4")) national = digits;
  else if (digits.length === 10 && digits.startsWith("04")) national = digits.slice(1);
  else if (digits.length === 11 && digits.startsWith("614")) national = digits.slice(2);

  return national ? `+61${national}` : null;
}

export async function POST(request: Request) {
  let body: {
    email?: string;
    mobile?: string;
    suburb?: string;
    preference?: string;
    company?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill every field. Return success so they don't learn otherwise.
  if (body.company) {
    return NextResponse.json({ message: "You're on the list." });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address.", field: "email" },
      { status: 400 },
    );
  }

  const mobile = normaliseAuMobile(body.mobile ?? "");
  if (!mobile) {
    return NextResponse.json(
      { error: "Enter a valid Australian mobile, e.g. 412 345 678.", field: "mobile" },
      { status: 400 },
    );
  }

  const preference = body.preference;
  if (preference !== "veg" && preference !== "non-veg") {
    return NextResponse.json(
      { error: "Choose veg or non-veg.", field: "preference" },
      { status: 400 },
    );
  }

  // Suburb is optional, but if given it has to be one we offered.
  const suburb = body.suburb?.trim();
  if (suburb && !SUBURBS.has(suburb)) {
    return NextResponse.json(
      { error: "Choose a suburb from the list.", field: "suburb" },
      { status: 400 },
    );
  }

  // TODO: persist the signup. Storage is deliberately not wired yet — drop the
  // Supabase / Airtable / CRM call in here and nothing else changes.
  // Until then this data is intentionally NOT written anywhere.
  console.info(
    `[waitlist] ${email} · ${mobile} · ${suburb || "no suburb"} · ${preference}`,
  );

  return NextResponse.json({ message: "You're on the list." });
}
