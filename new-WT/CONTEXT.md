# Project Context — new-WT

Standalone HTML + CSS Mumbai Dabbawala Perth waitlist page. **Not** part of the Next.js app in the parent folder — shares no tokens, fonts, or components with `../src/`, and nothing imports it.

## What it is
- Built 2026-08-19: a hero pixel-traced from a shared reference screenshot (`~/Downloads/hero-section.jpeg`, an "Elevate" real-estate landing hero), plus a Since-1890 section and a waitlist panel written from the brief.
- Hero *layout* is the reference's; all content is Mumbai Dabbawala's.
- Countdown to 14 Sep 2026 12:00 AWST sits in the hero's nav row, where the reference's CTA button was.
- A launch-day band was built then removed on request — markup/CSS backed up under the session scratchpad's `removed-launch-band/`.
- No nav menu items: logo left, one button right, by request.
- Two-step signup (email → modal: +61 mobile / Perth suburb / veg-non-veg) posts nowhere — no backend.

## Assets
- `assets/logo.png` — user-supplied logo, used unaltered on a white chip (a recoloured variant was rejected).
- `public/img/perth-arrival.jpg` — hero photo, user's pick over generated alternatives, cropped to hero ratio.
- Six-dish card rail sourced from `public/food/`, not regenerated.
- `scripts/generate-assets.mjs` calls `fal-ai/flux-pro/v1.1-ultra` over raw REST (no `@fal-ai/client` dependency, keeps folder self-contained) for hero/Perth shots, and `fal-ai/gpt-image-2` for the dabba lid code (FLUX garbles lettering). `sips` handles cropping/downscaling — must pass `-s format jpeg` for gpt-image-2 output (always PNG regardless of extension).

## Brand
On-brand as of 2026-08-19: Asar heads / Palanquin body, `#ED3237` / `#373435` / `#FEFEFE` / `#FFFFFF`, via `--font-head` / `--font-body` / `--brand-*` tokens.

**Type re-fit for the traced layout:** Asar cap-height 0.658em / Palanquin x-height 0.449em vs. the reference's Poppins 0.702 / 0.558 — same px renders visibly smaller, so sizes were re-solved from measured ink widths, not carried over: headline 65→70, body 20.5→23.5, CTA label 16→19.5. Asar's taller 1.76em content box also shifts baseline inside the fixed 100px line box. Asar ships one weight only — no bold headings; card titles over photos need `text-shadow`, not weight.

## Verification habits (reusable beyond this page)
1. After any structural edit, re-run the geometry probes (pixel-position checks) — a string-index slice once silently deleted the hero's `<svg class="defs">` clipPath; the probe signature (`cut_x@400` jumping, card runs merging) caught it where eyes wouldn't.
2. To inspect a mid-animation frame: pause it with a negative `animation-delay` + `animation-play-state: paused` in a temporary probe rule, then screenshot.
3. Headless Chrome ignores `--window-size` below macOS's ~500px minimum — a `--window-size=390` shot is laid out at ~500 then cropped, which looks like overflow that isn't real. Verify narrow widths in a real browser pane; trust `document.documentElement.scrollWidth`, not the capture.
4. Fit type sizes from **ink widths** against real font advances, not cap heights (cap height at these sizes is ±7% error, a long ink run ±1%). Expect a crisp render to measure ~1.5px narrower per edge than a JPEG reference on small text — don't chase that gap.

## Running it
`node new-WT/scripts/serve.mjs 4173` (also registered as `new-WT` in `../.claude/launch.json`, port 4173). Plain `python3 -m http.server` fails in this sandbox (`PermissionError` on `os.getcwd()`) — hence the small Node server.

## Full writeup
The trace → render → diff loop that built this page is documented in [../BUILD_LOG.md](../BUILD_LOG.md) and is reusable for any "replicate this screenshot" task. Persistent memory: `~/.claude/projects/-Users-apple-Downloads-MD-waitlist/memory/new-wt-hero-replica.md`.
