"use client";

import { useSyncExternalStore } from "react";

import { site } from "@/lib/site";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has scrolled far enough that content runs under the bar. */
function useScrolled() {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 24,
    () => false,
  );
}

export default function SiteHeader() {
  const scrolled = useScrolled();

  return (
    <header
      /* At the very top the bar floats over the dark hero, so it borrows the
         dark tokens. Once scrolling starts it becomes a solid off-white bar,
         which reads correctly over both the hero and the light sections below. */
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-md"
          : "theme-dark border-b border-transparent"
      }`}
    >
      <div className="container-page flex items-center justify-between gap-4 py-4">
        <a href="#top" className="group flex min-w-0 items-baseline gap-2.5">
          <span className="truncate text-lg leading-none text-heading sm:text-xl">
            {site.wordmark}
          </span>
          <span
            aria-hidden
            className="shrink-0 rounded-sm bg-accent px-1.5 py-0.5 text-[10px]
              font-semibold leading-tight tracking-wide text-on-accent"
          >
            2.0
          </span>
        </a>

        <nav aria-label="Primary" className="flex shrink-0 items-center gap-6 sm:gap-8">
          <span className="eyebrow hidden md:block">{site.city}</span>
          <a
            href="#waitlist"
            className="rounded-md border border-line-strong px-4 py-2 text-sm text-heading
              transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Join waitlist
          </a>
        </nav>
      </div>
    </header>
  );
}
