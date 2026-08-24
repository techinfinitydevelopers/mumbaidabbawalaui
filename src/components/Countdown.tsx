"use client";

import { useSyncExternalStore } from "react";

/**
 * Ticks once a second. The snapshot is rounded to whole seconds so React sees a
 * stable value between ticks — returning a raw Date.now() would re-render forever.
 */
function subscribeToSecond(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

const getSecondSnapshot = () => Math.floor(Date.now() / 1000);
/** 0 marks "not yet on the client" — SSR and hydration render the placeholder. */
const getServerSnapshot = () => 0;

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function split(msRemaining: number): Remaining {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Secs" },
] as const;

export default function Countdown({ targetIso }: { targetIso: string }) {
  const nowSec = useSyncExternalStore(
    subscribeToSecond,
    getSecondSnapshot,
    getServerSnapshot,
  );

  const target = new Date(targetIso).getTime();
  const live = nowSec > 0;
  const remaining = live ? split(target - nowSec * 1000) : null;
  const launched = live && target - nowSec * 1000 <= 0;

  return (
    <div>
      {/* 2×2 on phones — flex-wrap left "Secs" orphaned on its own row. */}
      <div className="grid grid-cols-2 items-start gap-x-4 gap-y-8 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-6">
        {UNITS.map(({ key, label }) => (
          <div key={key} className="sm:min-w-24">
            {/*
              aria-hidden on the digits, with one static status line below.
              A live region per unit would announce a bare number every second.
            */}
            <p
              aria-hidden
              className="text-[clamp(3rem,9vw,7rem)] leading-[0.85] tabular-nums text-heading"
              style={{ fontFamily: "var(--font-asar), Georgia, serif" }}
            >
              {remaining ? String(remaining[key]).padStart(2, "0") : "––"}
            </p>
            <p aria-hidden className="eyebrow mt-3">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/*
        One atomic status message. The text only changes when the day count
        changes, so screen readers aren't re-announced every second.
      */}
      <p role="status" aria-atomic="true" className="sr-only">
        {launched
          ? "Mumbai Dabbawala is now open in Perth."
          : remaining
            ? `${remaining.days} days until the Perth launch on 14 September 2026.`
            : "Launching in Perth on 14 September 2026."}
      </p>
    </div>
  );
}
