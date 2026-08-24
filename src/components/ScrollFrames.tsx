"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Manifest = {
  count: number;
  width: number;
  height: number | null;
  pattern: string;
};

function frameUrl(pattern: string, index: number) {
  return pattern.replace(/%(\d+)d/, (_, digits: string) =>
    String(index).padStart(Number(digits), "0"),
  );
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false, // SSR: assume motion is fine, correct on hydration
  );
}

/**
 * Apple-style scroll-driven frame sequence.
 *
 * The section is `scrollHeight` tall and the canvas is pinned for its duration;
 * frame index tracks how far the viewport has travelled through it.
 *
 * Frames stream in with a bounded pool so the hero paints after the *first*
 * frame rather than waiting on all ~150. Any frame not yet decoded falls back
 * to the nearest one that is, so scrubbing never shows a blank canvas.
 *
 * Reduced-motion users get a single static frame and no pinned scroll section.
 */
export default function ScrollFrames({
  scrollHeight = "400vh",
  overlay,
}: {
  scrollHeight?: string;
  overlay?: (progress: number) => React.ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const rafRef = useRef<number | null>(null);
  const drawnFrame = useRef(-1);

  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [firstReady, setFirstReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  const reducedMotion = usePrefersReducedMotion();

  // ---- load manifest + stream frames ------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/frames/manifest.json");
        if (!response.ok) throw new Error("manifest missing");
        const manifest: Manifest = await response.json();
        if (cancelled) return;

        setTotal(manifest.count);
        framesRef.current = new Array(manifest.count);

        const loadOne = (index: number) =>
          new Promise<void>((resolve) => {
            const image = new Image();
            image.src = frameUrl(manifest.pattern, index + 1);
            image.decoding = "async";
            image
              .decode()
              .then(() => {
                if (cancelled) return;
                framesRef.current[index] = image;
                setLoaded((n) => n + 1);
                if (index === 0) setFirstReady(true);
              })
              .catch(() => undefined)
              .finally(resolve);
          });

        // In-order pool: early frames land first so the hero paints immediately.
        const pool = 12;
        let cursor = 0;
        await Promise.all(
          Array.from({ length: pool }, async () => {
            while (cursor < manifest.count && !cancelled) {
              await loadOne(cursor++);
            }
          }),
        );
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Nearest decoded frame to `index`, searching outward. */
  const resolveFrame = useCallback((index: number) => {
    const frames = framesRef.current;
    if (frames[index]) return frames[index];
    for (let offset = 1; offset < frames.length; offset += 1) {
      if (frames[index - offset]) return frames[index - offset];
      if (frames[index + offset]) return frames[index + offset];
    }
    return undefined;
  }, []);

  const draw = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const image = resolveFrame(index);
      if (!canvas || !image?.naturalWidth) return;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
      }

      // object-fit: cover
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      context.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    },
    [resolveFrame],
  );

  // ---- scroll → frame ----------------------------------------------------
  useEffect(() => {
    if (!firstReady || reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      rafRef.current = null;

      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const travelled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 0));
      const ratio = scrollable > 0 ? travelled / scrollable : 0;

      const count = framesRef.current.length;
      const index = Math.min(count - 1, Math.round(ratio * (count - 1)));

      if (index !== drawnFrame.current) {
        drawnFrame.current = index;
        draw(index);
      }

      // Rounded so overlay re-renders are bounded to ~100 across the sequence.
      setProgress((prev) => {
        const next = Math.round(ratio * 100) / 100;
        return next === prev ? prev : next;
      });
    };

    const schedule = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(update);
    };

    const redraw = () => {
      drawnFrame.current = -1;
      schedule();
    };

    redraw();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", redraw);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", redraw);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [firstReady, reducedMotion, draw]);

  // Repaint as later frames arrive, so an early scrub sharpens up in place.
  useEffect(() => {
    if (!firstReady || reducedMotion) return;
    draw(drawnFrame.current < 0 ? 0 : drawnFrame.current);
  }, [loaded, firstReady, reducedMotion, draw]);

  // Static poster for reduced-motion users.
  useEffect(() => {
    if (!firstReady || !reducedMotion) return;
    draw(Math.floor(framesRef.current.length * 0.6));
    const onResize = () => draw(Math.floor(framesRef.current.length * 0.6));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [firstReady, reducedMotion, draw]);

  if (failed) return null;

  const loadRatio = total > 0 ? loaded / total : 0;

  return (
    <section
      ref={sectionRef}
      style={{ height: reducedMotion ? undefined : scrollHeight }}
      /* theme-dark: the hero is a charcoal band, so tokens flip for everything inside. */
      className="theme-dark relative"
      aria-label="Introduction"
    >
      <div
        className={`${
          reducedMotion ? "relative h-[70vh]" : "sticky top-0 h-screen"
        } w-full overflow-hidden bg-bg`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="A miniature world map with landmarks as a plane crosses it"
        />

        {/* Scrims, tuned to the FAL footage. These were much heavier when the
            source was the bright desk clip; the generated diorama is already
            dark (deep ocean, dark timber), so the same weights crushed it to
            near-black. Just enough left-hand wedge to hold the copy. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-bg/55 via-transparent to-bg/95"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-bg/85 from-5% via-bg/35 via-50% to-transparent to-80%"
        />

        {!firstReady && (
          <div className="absolute inset-0 grid place-items-center bg-bg">
            <div className="w-44">
              <div className="h-px w-full bg-line">
                <div
                  className="h-px bg-accent transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.round(loadRatio * 100)}%` }}
                />
              </div>
              <p className="eyebrow mt-4 text-center">Loading</p>
            </div>
          </div>
        )}

        {firstReady && overlay?.(reducedMotion ? 0.06 : progress)}
      </div>
    </section>
  );
}
