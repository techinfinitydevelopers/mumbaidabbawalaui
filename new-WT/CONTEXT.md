# Project Context — new-WT

Standalone HTML + CSS Mumbai Dabbawala Perth waitlist page. **Not** part of the Next.js app in the parent folder — shares no tokens, fonts, or components with `../src/`, and nothing imports it.

## What it is
- Built 2026-08-19: a hero pixel-traced from a shared reference screenshot (`~/Downloads/hero-section.jpeg`, an "Elevate" real-estate landing hero), plus a Since-1890 section and a waitlist panel written from the brief.
- Hero *layout* is the reference's; all content is Mumbai Dabbawala's.
- Countdown to 14 Sep 2026 12:00 AWST sits in the hero's nav row on desktop, where the reference's CTA button was. **Below 900 it moves into the copy column** above the headline, with the `Launches in` label the nav row never had space for — the markup is duplicated and one copy is always `display: none`, which works because the ticker writes every `[data-unit]` on the page off one target.
- A launch-day band was built then removed on request — markup/CSS backed up under the session scratchpad's `removed-launch-band/`.
- No nav menu items: logo left, one button right, by request.
- Two-step signup (email → modal: +61 mobile / Perth suburb / veg-non-veg) posts nowhere — no backend.

## Assets
- `assets/logo.png` — user-supplied logo, used unaltered on a white chip (a recoloured variant was rejected).
- `public/img/perth-arrival.jpg` — hero photo, user's pick over generated alternatives, cropped to hero ratio.
- Six-dish card rail sourced from `public/food/` and centre-cropped to 3/4. Three were regenerated later on client feedback (**idli** replaced masala dosa outright, plus chole-bhature and gulab-jamun); the others are the originals. Every consumer crops to 3/4, so generate at 3:4 — the two dishes that were not (4:3 and 1:1) each lost most of a frame to the crop.
- `scripts/generate-assets.mjs` calls `fal-ai/flux-pro/v1.1-ultra` over raw REST (no `@fal-ai/client` dependency, keeps the folder self-contained). It once also used `fal-ai/gpt-image-2` for a dabba lid close-up, because FLUX garbles lettering and that asset's whole point was a legible painted code; that asset is deleted and the entry with it. If gpt-image-2 is ever used again: `sips -s format jpeg` is mandatory, since it returns PNG regardless of the extension asked for.
- **Deleting a generated asset means deleting its entry in the same commit.** An entry left behind recreates its file on the next run. This has been learnt three times — the run's two bookend photos, the five `legacy-*` stills, and masala-dosa.
- The dish prompts share a `LOOK` suffix that contains *"steam rising"*. Right for the savoury dishes, wrong for anything else — it is what put smoke over the gulab jamun. `LOOK_STILL` is the no-steam variant; reach for it rather than arguing with the suffix inside one prompt.

## Brand
On-brand as of 2026-08-19: Asar heads / Palanquin body, `#ED3237` / `#373435` / `#FEFEFE` / `#FFFFFF`, via `--font-head` / `--font-body` / `--brand-*` tokens.

**Type re-fit for the traced layout:** Asar cap-height 0.658em / Palanquin x-height 0.449em vs. the reference's Poppins 0.702 / 0.558 — same px renders visibly smaller, so sizes were re-solved from measured ink widths, not carried over: headline 65→70, body 20.5→23.5, CTA label 16→19.5. Asar's taller 1.76em content box also shifts baseline inside the fixed 100px line box. Asar ships one weight only — no bold headings; card titles over photos need `text-shadow`, not weight.

## Verification habits (reusable beyond this page)
1. After any structural edit, re-run the geometry probes (pixel-position checks) — a string-index slice once silently deleted the hero's `<svg class="defs">` clipPath; the probe signature (`cut_x@400` jumping, card runs merging) caught it where eyes wouldn't.
2. To inspect a mid-animation frame: pause it with a negative `animation-delay` + `animation-play-state: paused` in a temporary probe rule, then screenshot.
3. Headless Chrome ignores `--window-size` below macOS's ~500px minimum — a `--window-size=390` shot is laid out at ~500 then cropped, which looks like overflow that isn't real. Use an **iframe harness**: a page at any width holding `<iframe width="W+15">`, which lays the page out at exactly W once the iframe's own scrollbar is accounted for. Do not "fix" the scrollbar by injecting `scrollbar-width: none` after load — that changes the width *after* the page's own `ResizeObserver` has run, and any measurement keyed to layout then disagrees with what shipped. Size the iframe 15px wide instead.
4. **The Browser pane is a real browser but not a running one:** `document.hidden` is permanently `true` there, so `requestAnimationFrame`, `IntersectionObserver` and `ResizeObserver` callbacks do not fire, and scroll-driven animation cannot be driven at all. Headless can run rAF under `--virtual-time-budget` but stalls on scroll. Anything scroll-driven has to be verified arithmetically from the page's own formula plus measured geometry — and say so, rather than implying an end-to-end check happened.
5. **To measure text contrast over a photograph, render twice.** Once as-is, once with the text `visibility: hidden`, then difference the two: the changed pixels are exactly the ink, and sampling the second render at those coordinates gives the true background behind every glyph. Sampling "near the text" (a descender band) reported 5.50:1 where the honest figure was 4.64:1; sampling the x-height band reported 1.00:1, which is white text measured against white text. Only the differencing figure is worth quoting.
6. **A probe that re-implements the page's own formula cannot catch a bug in that formula** — it agrees with the page about a number they are both getting wrong. Four geometry probes passed a scroll-progress bug that a single runtime read caught.
7. Fit type sizes from **ink widths** against real font advances, not cap heights (cap height at these sizes is ±7% error, a long ink run ±1%). Expect a crisp render to measure ~1.5px narrower per edge than a JPEG reference on small text — don't chase that gap.

## Running it
`node new-WT/scripts/serve.mjs 4173` (also registered as `new-WT` in `../.claude/launch.json`, port 4173, alongside `md-waitlist` for the Next app). `serve.mjs` exists because `python3 -m http.server` once failed here with a `PermissionError` on `os.getcwd()`; **it works now** — verified, a fresh one answers 200 — so either is fine, and the probe harnesses in this log use the Python one. Note it binds `::1`, so probe URLs must say `localhost`, not `127.0.0.1`.

## Full writeup
The trace → render → diff loop that built this page is documented in [../BUILD_LOG.md](../BUILD_LOG.md) and is reusable for any "replicate this screenshot" task. Persistent memory: `~/.claude/projects/-Users-apple-Downloads-MD-waitlist/memory/new-wt-hero-replica.md`.
