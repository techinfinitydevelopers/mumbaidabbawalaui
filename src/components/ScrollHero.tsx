"use client";

import ScrollFrames from "@/components/ScrollFrames";
import { scrollBeats, site } from "@/lib/site";

/** Index of the beat that owns the current progress value. */
function activeBeat(progress: number) {
  let index = 0;
  for (let i = 0; i < scrollBeats.length; i += 1) {
    if (progress >= scrollBeats[i].at) index = i;
  }
  return index;
}

export default function ScrollHero() {
  return (
    <ScrollFrames
      scrollHeight="420vh"
      overlay={(progress) => {
        const active = activeBeat(progress);
        const atEnd = progress > 0.9;

        return (
          <div className="pointer-events-none absolute inset-0">
            <div className="container-page relative flex h-full flex-col justify-center">
              {/* Beats are stacked and cross-faded so height never jumps. */}
              <div className="relative max-w-3xl">
                {scrollBeats.map((beat, index) => (
                  <div
                    key={beat.kicker}
                    aria-hidden={index !== active}
                    className={`transition-all duration-500 ease-out ${
                      index === active
                        ? "relative translate-y-0 opacity-100"
                        : "pointer-events-none absolute inset-x-0 top-0 translate-y-3 opacity-0"
                    }`}
                  >
                    <p className="eyebrow">{beat.kicker}</p>
                    <h1 className="mt-5 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.01em]">
                      {beat.heading}
                    </h1>
                  </div>
                ))}
              </div>

              <p className="mt-7 max-w-md text-base leading-relaxed text-heading/75 sm:text-lg">
                {site.launchDate}. {site.launchNote}
              </p>

              <div
                className={`pointer-events-auto mt-9 transition-all duration-500 ${
                  atEnd ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <a
                  href="#waitlist"
                  tabIndex={atEnd ? 0 : -1}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5
                    font-medium text-on-accent transition-all duration-200
                    hover:brightness-110 active:translate-y-px"
                >
                  Join the waitlist
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>

            {/* Scroll cue — only while the sequence has room left to run. */}
            <div
              aria-hidden
              className={`absolute inset-x-0 bottom-8 flex justify-center transition-opacity duration-500 ${
                progress > 0.08 ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="eyebrow">Scroll</span>
            </div>
          </div>
        );
      }}
    />
  );
}
