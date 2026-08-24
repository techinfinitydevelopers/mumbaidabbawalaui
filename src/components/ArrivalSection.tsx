import Image from "next/image";

import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import { legacyTicker, site } from "@/lib/site";

/**
 * The anticipation section. Two moving parts only — the countdown and the
 * ticker — because animating more than that in one view reads as noise.
 */
export default function ArrivalSection() {
  return (
    <section
      id="arrival"
      className="theme-dark relative scroll-mt-24 overflow-hidden bg-bg"
      aria-labelledby="arrival-title"
    >
      {/* Warm bloom behind the numerals so the band doesn't read as flat charcoal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[42rem] w-[42rem]
          -translate-x-1/2 rounded-full bg-accent/12 blur-[120px]"
      />

      <div className="container-page relative pt-24 sm:pt-32 lg:pt-40">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">The arrival</p>
              <h2
                id="arrival-title"
                className="mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
              >
                Perth eats in
              </h2>
            </Reveal>

            <Reveal delay={120} className="mt-10">
              <Countdown targetIso={site.launchIso} />
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-10 max-w-md text-base leading-relaxed sm:text-lg">
                {site.launchNote} The waitlist decides which one is first.
              </p>
              <a
                href="#waitlist"
                className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-md
                  bg-accent px-6 py-3.5 font-medium text-on-accent transition-all
                  duration-200 hover:brightness-110 active:translate-y-px"
              >
                Claim your suburb
                <span aria-hidden>→</span>
              </a>
            </Reveal>
          </div>

          <Reveal delay={160} className="lg:col-span-5">
            <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-surface">
              <Image
                src="/img/dabbawala-cycle.jpg"
                alt="A dabbawala steadying a bicycle loaded with a crate of steel tiffin dabbas on a Mumbai street"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Legacy proof as a moving ticker rather than a static stat grid. */}
      <div
        className="relative mt-16 border-y border-line py-5 sm:mt-20"
        aria-label="Mumbai Dabbawala in numbers"
      >
        <div className="marquee">
          <div className="marquee-track">
            {/* Duplicated once so the loop has no visible seam. */}
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-center"
              >
                {legacyTicker.map((phrase) => (
                  <li key={phrase} className="flex items-center whitespace-nowrap">
                    <span className="px-7 text-lg text-heading sm:px-10 sm:text-2xl">
                      {phrase}
                    </span>
                    {/* CSS diamond, not a glyph — keeps the separator off the a11y tree. */}
                    <span
                      aria-hidden
                      className="size-1.5 rotate-45 bg-accent"
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
