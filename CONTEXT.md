# Project Context — MD-waitlist

Mumbai Dabbawala 2.0 — Perth pre-launch waitlist (Next.js). Single job: build anticipation, collect sign-ups before launch.

## Brief
- Launch: 14 Sep 2026, Perth metro first.
- Positioning: "Mumbai's legend comes to Perth" — legacy = credibility, Perth = news.
- Hook: running since 1890, 5,000+ carriers, 200,000+ lunches/day, routing by a painted code (no app/barcode).
- Collects: email up front → modal with email, AU mobile (+61), Perth suburb (optional), veg/non-veg.
- Contact: support@mumbaidabbawala.com.au — email only, no phone numbers on page.
- **Teaser-only constraint: no price, no menu, no process detail.** Six-dish gallery kept but framed as heritage, not a menu.
- Content lives in `src/lib/site.ts` (brand, beats, stats, code parts, suburbs, dishes).

## Brand system
- Headings: Asar (400). Body/UI: Palanquin (300–700). Both Google Fonts, latin + devanagari.
- Colours: `#ED3237` red (accent/CTA), `#373435` charcoal, `#FEFEFE` off-white (page), `#FFFFFF` white (surfaces).
- Tokens in `src/app/globals.css`; `.theme-dark` re-declares the same token names for light/dark flip.
- Gotcha: `.theme-dark` must set `color: var(--body)` on itself — inheritance passes resolved colour, not the var.
- Muted tone fixed at 68%/62% (light/dark) — the contrast floor (4.5:1) for eyebrow labels.

## Scroll-frame hero video
- FAL-generated in two stages via `scripts/generate-hero-video.mjs`: `gpt-image-2` (base still) → `kling-video/v2.5-turbo/pro/image-to-video` (India→Australia flight) → `npm run gen:frames` (WebP sequence, 960px, ~140 frames).
- Replaced an earlier third-party Pinterest-referenced clip that had unconfirmed licensing/branding baked in.
- gpt-image-2 used over FLUX for the still because FLUX garbles map text; Kling supports `negative_prompt`, flux-pro/v1.1-ultra silently ignores it.

## FAL AI integration
- `@fal-ai/client` v1.10.1, key in `.env.local` as `FAL_KEY`, used only via `src/lib/fal.ts` (`server-only`).
- **Key was pasted in plaintext chat on 2026-08-19 — needs rotation at fal.ai.**
- Verified model ids: `fal-ai/flux-pro/v1.1-ultra`, `fal-ai/nano-banana`, `fal-ai/kling-video/v2.5-turbo/pro/image-to-video`.
- Poll `queue.fal.run/<app-id>/requests/<id>/status`, not the full endpoint path (405s otherwise) — prefer the submit response's own `status_url`.

## shadcn/ui
- Added 2026-08-21, `shadcn@4.18`, Base UI preset (`base-nova`) — not Radix.
- `shadcn init`/`add` silently overwrites `--accent`, `--muted`, and `body` colour rules in `globals.css`. **Re-check these three after every `shadcn add`.**
- Correct values: `--accent` = `var(--brand-red)`, `--muted` = `color-mix(in srgb, var(--brand-charcoal) 68%, transparent)`, body keeps `background: var(--bg)` / `color: var(--body)`.
- Repo is not under git — no undo for CLI rewrites; diff `globals.css` manually.

## Subfolder
- `new-WT/` is a standalone, unrelated HTML/CSS build — see [new-WT/CONTEXT.md](new-WT/CONTEXT.md). Shares no tokens/components with `src/`.

## Housekeeping
- Full narrative build history: [BUILD_LOG.md](BUILD_LOG.md).
- Persistent cross-session memory: `~/.claude/projects/-Users-apple-Downloads-MD-waitlist/memory/` (index: `MEMORY.md`).
