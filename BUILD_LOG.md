# Build Log

## 2026-08-19 — CTA: the chip now travels, as the reference actually does

With the component's source in hand, the hover turned out to be a bigger move than
the earlier rebuild guessed from the rendered stills:

```
rest   ps-6 pe-14   chip right-1
hover  ps-14 pe-6   chip right-[calc(100%-44px)]   rotate-45   (500ms)
```

So the chip **travels the full width to the left end** while the label's padding
swaps by the same amounts. Because the two paddings trade values, the box never
changes size — that symmetry is the whole trick, and it is why animating `padding`
here costs no layout jump. Implemented at our scale: 56px tall, 46px chip,
`0 68px 0 28px` swapping to `0 28px 0 68px`, chip to `calc(100% - 51px)` (46 + its
5px inset, so it lands with the same air on the left as it had on the right).

**The 45-degree rotation is deliberately not implemented.** It reads as motion on an
arrow; on a lunchbox it reads as a spilled one.

Verified by pinning the hover end state in a probe rule and diffing the two frames:
label and chip trade places, button width identical in both.

The phone variant carries the same mechanic at 50px/42px.

## 2026-08-19 — CTA redesigned as a pill with an icon chip

Replaces the Uiverse animated button, following a 21st.dev reference (shadcnspace
"Button with Icon"): a pill with the label left and a circular icon chip inset on
the right.

**The reference's source is paywalled**, so nothing was lifted from it. The shape
was rebuilt from the rendered component's measured proportions — 192 × 48 pill,
40px chip inset 4px, 14px/500 label — scaled up to carry an 18px Palanquin label,
in brand red with the dabba in the chip.

- `.cta` / `.cta__label` / `.cta__chip`, and `.cta--block` where it replaces a
  block button. In the block form the label stays left and the chip right, which is
  the reference's own arrangement rather than a centred label.
- Hover moves one thing: the chip nudges 4px right, and the button deepens to
  `#d4272c` with a red-tinted shadow. The old component's expanding white circle and
  sliding double icon are gone.
- The signup card's input went to a pill radius too — a 14px input above a fully
  rounded button read as two different components.
- Phone rules carried over: 60% width with `min-width: fit-content`, and a smaller
  50px/42px-chip variant.

Also worth noting: `preview_start` with an external URL replaces the session's
preview and **kills the local dev server** — the geometry probes came back with
`hero_left 0` and `hero_right 844`, which was Chrome's "site can't be reached" page
being measured, not a broken layout. Restarting the server restored the numbers
exactly.

## 2026-08-19 — Phone CTA at 60%, with two guards it needed

`width: 60%` on the hero's button under 700px, as asked. Two things the render
turned up:

- **`min-width: fit-content` alongside it.** At 360px the copy column is 272 wide,
  so 60% is 163 — under the label's own 169, and the component has
  `overflow: hidden`, which would have cut "Join The Waitlist". With the guard it
  is 60% wherever 60% fits (198px at 401, measured) and settles at the label's
  width on the narrowest phones instead of clipping.
- **`min-height: 470px` on the phone hero.** At 360 the 0.82 aspect ratio gives a
  400px hero, and the copy block — headline, a three-line subcopy and the button —
  needs 248 of it. `bottom: 23%` then pushed the headline up into the nav row, which
  the screenshot caught. The floor gives it 49px of clearance at 360 and 62 at 401.

## 2026-08-19 — Primary CTAs swapped for the Uiverse animated button

The supplied component (Uiverse.io by ryota1231) now drives the hero CTA and the
signup submit, with its arrow replaced by the dabba glyph.

### The icon had to become a single fill path

The component styles its icon with `fill` (`#fefefe`, `#373435` on hover), so a
stroked glyph would not follow it. The page's dabba is a stroked handle arc plus
three rounded rects, so for this button it was converted to one fill path:

- Rects → path data with arc corners.
- The handle's 1.5px round-capped stroke → outlined by hand as a half-annulus:
  outer r 4.25, inner r 2.75 about (12, 6.4), with 0.75 round caps at both ends.

Verified by rendering the original and the conversion side by side at 2x and
diffing: 218 of 193,600 pixels differ, all on the arc's antialiased edge, max delta
95 of 255. Same shape.

### Two adaptations, both flagged

- **`font-size: 18px`, not 16.** Palanquin's x-height runs small; at 16 the label
  read a size below everything else on the page.
- **`width: fit-content`.** The hero's CTA is an `<a>`, and `display: flex` makes it
  block-level — without this it stretched to the full width of the copy column.

Left alone deliberately: `:active { box-shadow: 0 0 0 4px greenyellow }`, which is
a template leftover and off-brand, and the modal's buttons — the component's white
ring and expanding white circle are invisible on the modal's white panel, so those
stay on `.btn--accent`.

## 2026-08-19 — Phone hero rebuilt around the carve

A mobile mock asked for the hero's carve to survive on phones, with the paragraph
tucked into it and the dish cards two-up below. Under 700px:

- **Portrait hero at 0.82** with a second clipPath, `#hero-cut-m`. The desktop path
  shears unusably from 1.94 to 0.82, so the phone bite is authored separately — a
  step out of the bottom-right with a concave fillet where the panel's corner lands.
- **`.intro` moved between `.hero` and `.rail` in the DOM** so it can sit in that
  bite, and is pulled up with `margin-top: calc(-22% + 6px)`. Percentage margins
  resolve against the container's *width*, and once the hero's aspect ratio is
  fixed the bite's depth is a fixed share of that width — so no viewport maths.
  On desktop the same element is absolute below the hero and `.stage` reserves the
  173px it stops occupying: verified by diffing the full-page height before and
  after the move (2398px both, and the paragraph's ink bbox identical).
- **Cards fixed at 172 × 200** with their own scoop path. `clip-path: path()` is in
  px, so the card it cuts has to be a known size — a flex fraction would misfit it.
- Full-width CTA, two cards across at 390 with the third peeking, and the rail's
  chevron shown.

### Three bugs, all from rules landing in the wrong breakpoint

1. `position: relative` on the phone rail without clearing the desktop `left:
   42.51%` — the offset still applied and the cards sat 42% across.
2. The portrait-hero group was written into the ≤900 block, so at 900px the hero
   became an 868 × 1059 portrait. Moved to ≤700 — and the *first* move only took
   half the group, because the rail and card rules sat after `.nav` in that block
   and were left behind, which put the cards over the headline at 760 and 900.
3. Hiding the hard `<br>`s on phones fused words — "handin Mumbai", "lunch
   runarrives". The markup now keeps a space around every `<br>`, so hiding them is
   safe at any width.

Verified at 390 and 430 in a real viewport, and at 760 / 900 / 1100 / 1440 headless.
Desktop probes unchanged throughout.

## 2026-08-19 — Countdown highlighted, sticky bar, digit flip

### The countdown now reads as an object

Bare white numbers on a bright photograph were not holding the eye. It is now a
**dark glass capsule** — blur, hairline border, inset highlight, long shadow —
which also balances the logo's white chip across the row. Plus:

- A **red dot pulsing on the second**. Motion rather than more colour, because a
  second red mass would compete with the CTA.
- **Days set larger** (27px against 23px); that is the figure people read.
- **Digits flip only when they change.** `put()` compares before it writes, so the
  seconds flip every tick and the hours flip once an hour. Animating every number
  every second reads as noise.

### Sticky bar

A light-glass bar slides in once the hero's nav row scrolls past, carrying the logo
and the same countdown, so the clock is on screen for the whole page. Light, not
charcoal, because the logo ships as dark artwork — a light bar lets it sit there
unaltered instead of needing a chip of its own. `aria-hidden` with nothing
focusable: it duplicates what is already in the DOM.

### Two implementation notes worth keeping

**The timer's breakpoint rules were positional and broke silently.** Phones hide
minutes and seconds; that rule was `.navtimer__grp:nth-of-type(n+4)`. Adding the
pulse dot as a new first child shifted every index, and the phone view quietly
dropped to "24 DAYS" alone. Now `--lead` and `--fine` classes carry it — position
is not a contract.

**IntersectionObserver and requestAnimationFrame are both suspended while the tab
is hidden**, which is also why neither could be verified through the preview pane
(`document.hidden` stayed true even with the tab fronted). The sticky trigger is
therefore a passive `scroll` listener with the trigger point measured once and
re-measured on resize — the handler is a number compare and a no-op class toggle,
so there is nothing to coalesce. Verified by dispatching a synthetic scroll event:
the class flips at `scrollY > 91`, which is the nav's measured bottom.

Hero geometry unchanged through all of it — probes identical.

## 2026-08-19 — Original logo, two sections removed, waitlist redesigned

### Logo: the supplied artwork, unaltered

The hero was carrying a recoloured light variant. It now carries
`assets/logo.png` — the file as supplied, charcoal and red — on a **white chip**
(8/15px padding, 14px radius, long shadow). A dark-on-transparent lockup cannot
survive on a photograph, so the choice was recolour the artwork or give it a
surface; the surface keeps the logo reading exactly as drawn. `logo-light.png`
deleted.

### Removed on request

- The legacy section's pink lid-code note.
- The whole launch-day band.

Both are backed up under
`scratchpad/removed-launch-band/` (markup + CSS) so restoring either is a paste,
not a rebuild. Their responsive overrides, the `prefers-reduced-motion` block for
the route animation, and the `.sr-only` utility went with them — no dead rules
left behind, verified by grep.

Two things survived the band's removal by design: the countdown, which had already
moved to the nav row, and the launch date, which the footer still carries. The
ticker's `document.getElementById("countdown")?.classList` was already
optional-chained, so nothing broke when `#countdown` disappeared.

### The legacy collage was rebalanced

With the note gone, the copy column got ~200px shorter than the image column and
the section read lopsided. The art is now a proper collage — carrier full height
in a 1.12fr column, stack and routing code stacked in the 0.88fr one — which puts
the two columns within ~40px of each other.

### The waitlist section, redesigned

Was a plain two-column block: copy left, a bordered white card right. Now the
page's one dark panel:

- Charcoal 158° gradient ground, red radial glow top-right and a fainter one
  bottom-left, inset top highlight.
- A white card on a `0 34px 70px rgba(0,0,0,.38)` shadow — the contrast is what
  makes the form read as the action rather than another block.
- Three numbered steps with red chips: leave your email / name your suburb / we
  email you once. The ask really is two-part, and saying so stops the modal
  feeling like a bait-and-switch.
- Field, full-width CTA and a lock-marked privacy line stack; nothing side by
  side, so it stays calm from 1440 down to 390.

### One bug the mobile pass caught

The modal's confirmation state was rendering under the form's own header, so the
panel read "Tell us where to run." above "You are on the list." The header is now
a `#sheet-head` block that hides with the form and comes back on close.

## 2026-08-19 — Hero photo swapped, nav button becomes the countdown

Four requests in one pass. Hero geometry untouched again — probes identical.

### Hero photo

Now the site's own `public/img/perth-arrival.jpg`, cropped to the hero box's
1.9417 ratio, chosen over two generated Perth skylines because it is the frame
that was asked for.

It is bright edge to edge with no dark element to sit the headline on, unlike the
dabbawala street shot it replaced, so the scrim was re-sampled rather than
guessed. Targets came from the reference screenshot's own hero, which is also a
bright golden-hour photo:

| Behind | Reference | Now |
|---|---|---|
| Subcopy | 97 of 255 | 96 |
| Nav ticker | 125 | 116 |
| Headline | 102 | 108 |

The left wedge went 0.34 → 0.78 and reaches 58% across; the top band 0.22 → 0.52.

### The nav button is now the countdown

"Get Early Access" is gone; its slot carries `25 DAYS 15 HOURS 04 MIN 21 SEC`.
Bare type rather than a chip — a chip reads as something to press, and this is a
readout. One `setInterval` now writes **every** `[data-unit]` element on the page,
so the nav readout and the launch-band tiles are the same clock instead of two
that drift. Phones drop the lead label and the minutes/seconds groups; the band
still carries the full four.

The hero keeps its "Join Waitlist" button, so removing the nav CTA costs no path
to the form.

### Launch band photo

Moved to the dabbawala street shot. With the hero now a Perth skyline, the band's
generated Perth skyline made the page repeat itself — and the run reaching Perth
reads better over a picture of the run. Its vignette lightened to suit a dark
photograph (centre 0.60 → 0.44), and `perth.jpg` was deleted rather than left
behind as a dead asset. Chips now fit one row.

### Paragraph sizes down

Body copy had been sized up to reproduce the reference's ink widths in Palanquin,
which reads large. Hero subcopy 23.5 → 20.5, the paragraph under it 23.5 → 19.5,
section ledes 23.5 → 19.5, card body 20 → 18, and the smaller UI text with them.
This is the one deliberate departure from the traced measurements: the boxes are
unchanged, the type inside them is no longer width-matched.

## 2026-08-19 — Launch-day band redesigned

The band was a left-aligned block of text on a photo. It is now the page's one
centred, dark, full-bleed moment — every other section is a left-aligned column on
white, so the change of rhythm is the design.

- **Date as display type.** Day numeral at 108px Palanquin 700 in brand red with a
  red glow; month and year in Asar beside it, the year at 72% white so the eye
  lands on "14 September".
- **A Mumbai → Perth route line.** Dashed rail, white origin dot, red destination
  dot with a halo, and the tiffin glyph travelling it on a 7s loop — the brief's
  135-year journey in one line. `aria-hidden` with an `sr-only` sentence carrying
  the same content, and the animation stops under `prefers-reduced-motion`.
- **Countdown as glass tiles**: blur, an inset top highlight, and a short red keel
  under each — four plain glass boxes read as nothing, the keel is what makes them
  a set. The seconds tile dips opacity once per second so the number reads live.
- **Rollout block** under a hairline: first-suburb chips, a dashed "+ 7 more by
  demand", and a "Claim your suburb" CTA. It gives the "suburbs by demand" line
  something to look at and previews the modal's list.
- **Scrim swapped from a left wedge to a vignette**, since the content is centred:
  0.60 in the middle to 0.94 at the corners, plus a red radial wash behind the date
  so the accent is in the air and not only in the type.

### Gotcha worth remembering

Headless Chrome will not honour `--window-size=390,…` — macOS enforces a minimum
window width (~500px), so the screenshot comes back 390 wide but laid out at ~500
and clipped. Two "mobile overflow" bugs chased here were artefacts of that. Narrow
widths have to be verified in a real 390 viewport; the DOM there reported
`scrollWidth === clientWidth === 390` and the band renders clean.

## 2026-08-19 — `new-WT/` on brand: Asar + Palanquin, red and charcoal

The template's green and Poppins are gone. Guidelines applied: **Asar** for heads,
**Palanquin** for paragraphs, `#ED3237` / `#373435` / `#FEFEFE` / `#FFFFFF`.
Declared once as `--font-head`, `--font-body` and `--brand-*` with `--accent` and
`--ink` layered on, so the next change is a token edit rather than a sweep.

### Every size had to be re-fitted, because the boxes are traced

The hero's positions were measured off a screenshot set in a Poppins-like
grotesque. The brand faces are metrically nothing like it:

| | cap/em | x-height/em |
|---|---|---|
| Poppins (was) | 0.702 | 0.558 |
| Asar | 0.658 | 0.458 |
| Palanquin | 0.662 | 0.449 |

So the same px renders visibly smaller and narrower. Sizes were re-solved against
the measured ink widths and cap heights rather than carried over:

| Element | Was | Now | Anchor |
|---|---|---|---|
| Headline | 65 | **70 Asar** | the reference's 46.4px cap height |
| Hero subcopy + paragraph below | 20.5 | **23.5 Palanquin** | the traced 561px line |
| CTA label | 16 | **19.5 Palanquin** | keeps the button box at its measured 184px |
| Card title | 16.5 | **17 Asar** | cap height |
| Card body | 17 | **20 Palanquin** | the traced 177px line |
| Section h2 | 44 | **47 Asar** | cap height |

Vertical offsets moved with them: Asar's content box is 1.76em against Poppins'
1.40em, which shifts the baseline inside a fixed 100px line box, so the headline's
`top` went 229 → 227 and the subcopy's margin 7 → 6.

**Verified after the swap, not assumed.** The red CTA box measures 108 × 30
reference px against the traced 109 × 30; the headline's two baselines land within
1px of the traced 187.5 and 246.5; hero box, carve and all three card runs are
byte-identical to before.

### Three things the re-skin needed

- **Card titles gained a text-shadow.** Asar ships one weight, so a 400 serif on a
  photograph cannot separate itself the way the reference's 600 grotesque did.
- **The logo's light variant was rebuilt** so its red is exactly `#ED3237` rather
  than the artwork's slightly warmer red.
- **The preference chips were stacking full-width.** `.sheet__form label { display:
  block }` outranks `.pill { display: inline-flex }` on specificity; the chip rule
  is now scoped to `.sheet__form .pill`.

Surfaces split the two whites deliberately: `#FEFEFE` is the page ground, `#FFFFFF`
is for things that sit on it (the signup card, the modal panel), with a hairline
border so the near-identical whites still read as layers.

## 2026-08-19 — `new-WT/` becomes the full waitlist page

Three follow-on requests: supplied logo in place of the drawn mark, no nav menu
items, more sections from the brief — plus a timer. Hero geometry still untouched;
the structural probes come back identical again after all of it.

### Logo

`~/Downloads/logo (3).png` trimmed to its ink and shipped as `assets/logo.png`.
The lockup is charcoal and red, which vanishes on the hero photograph, so
`assets/logo-light.png` is a recolour — luminance-inverted for the dark ink,
brand red preserved. 52px tall in the nav rather than the wordmark's 42: the
lockup carries a vertical "MUMBAI" and a "Since 1890" line that need the height
before they read.

### Sections added

| Section | Carries |
|---|---|
| Since 1890 | 135 years / 5,000+ carriers / 200k+ lunches as stat tiles, the lid-code routing note, three stills |
| Launch day | 14 September 2026 over the Perth skyline, metro-first rollout, and a live countdown to 12 pm AWST |
| The waitlist | Email up front, then a modal for +61 mobile, Perth suburb (fixed list) and veg / non-veg — the brief's two-step signup |
| Footer | Logo and support@mumbaidabbawala.com.au. No phone number anywhere, by design |

These have no reference to trace, so they are built from the hero's own
vocabulary — 40px on big surfaces, 30px on cards, the same green, and the
20.5/31 body size the hero already measured. The signup posts nowhere (no
backend); the modal ends in a confirmation state.

### The lid code needed a different model

The brief's third hook is the code painted on each dabba's lid, so the asset has
to show one. FLUX garbles lettering — `public/img/dabba-lid-code.jpg` reads
"KoR3O" / "Love19" — and cropping around it was going to lose the point.
`fal-ai/gpt-image-2` spells, as the hero-video work found, and returned the code
as written: **K BO / 12 E7**. That model path is now in the generator, which also
force-converts its output (gpt-image-2 hands back a PNG whatever the extension
says — 1.3 MB until the format is forced to JPEG).

### Two content bugs the render caught

- `.hero__sub br { display: none }` on mobile joined the text nodes into
  "delivered by handin Mumbai". Rule removed; the hard break stays at every width.
- "Mumbai Dabbawala" as a text wordmark wrapped to two lines under 560px and shoved
  the nav button off-screen. Moot now the logo is an image, but the phone
  breakpoint that shrinks the lockup and the button stayed.

## 2026-08-19 — `new-WT/` dressed with Mumbai Dabbawala content

Same hero as the entry below, **geometry untouched** — images and copy only. The
structural probes come back identical after the swap: hero box, carve at both
sampled rows, all three card runs, card top and bottom. Verified, not assumed.

### Copy

| Slot | Content |
|---|---|
| Wordmark | Mumbai Dabbawala |
| Nav | Home / The Legacy / Dishes / Contact |
| Nav button | Get Early Access |
| Headline | "Mumbai's Legend / Comes to Perth" — the brief's positioning line, and it happens to fit the reference's two-line shape almost exactly (15 and 14 characters against 15 and 17) |
| Subcopy | "200,000 home-cooked lunches a day, delivered by hand / in Mumbai since 1890." — 52 and 21 characters against the reference's 55 and 22, so the block keeps its measured width |
| CTA | Join Waitlist — 13 characters, so the button box stays 185px wide as measured |
| Cards | The six-dish gallery, mains first and dessert last |
| Below hero | Launch date, suburb rollout, support@mumbaidabbawala.com.au |

Teaser-only per the brief: no price, no delivery process. Card copy is capped at
~45 characters because the 3-line clamp on a 190px column truncates past ~50 —
the first pass shipped "tomato and cream…" and had to be cut back.

### Imagery

- **Hero** regenerated with FAL: a dabbawala beside a crate of tiffins at golden
  hour, left third in deep shadow. Two candidates; the bicycle framing won over
  the carried-crate one, whose crate sat where the headline goes.
- **Cards** are the six existing `public/food/` stills, centre-cropped to 3:4 and
  downscaled — same dishes the main site already generated, so no second spend
  and no visual drift.
- `generate-assets.mjs` now covers both paths (FAL for the hero, local derive for
  the dishes) and does its cropping with `sips`, so `new-WT` still needs no
  packages. Imagery total: 810 KB.

### Two things the swap forced

- `object-position: 50% 100%` on the hero photo. FLUX painted a garbled shop sign
  along the top edge despite the anti-text prompt; bottom-aligning the cover crop
  cuts exactly that band and adds street to the foreground.
- Scrims re-tuned down (left wedge 0.50 to 0.34, flat layer dropped): they were
  fitted to a bright sunset landscape, and this photograph is a dark street.
  Hero mean luminance is 49 of 255 against the reference's 97 — that is the
  photograph, not the treatment, and the moodier read suits the brand.

Still the template's green accent and Poppins, not the site's `#ED3237` and
Asar/Palanquin — the instruction was images and content only, so the brand tokens
were left alone deliberately.

## 2026-08-19 — `new-WT/`: pixel-traced replica of the shared "Elevate" hero

Standalone HTML/CSS in `new-WT/`, deliberately outside `src/` — the reference is a
real-estate template with nothing to do with the dabbawala teaser, so it shares no
tokens, fonts or components with the Next.js app and cannot affect it.

### Method: measure, render, diff, repeat

The reference (`~/Downloads/hero-section.jpeg`, 845x529) is a crop of a 1440x900
viewport, so **k = 1440/845 = 1.7041** converts reference px to design px. Nothing
was eyeballed:

1. Probe the reference with PIL — sub-pixel edge detection on the 128-luminance
   crossing, least-squares circle fits per corner, modal colour sampling.
2. Fit type sizes from **ink widths** against the real font's advance widths
   (canvas `measureText` + `actualBoundingBox*`), not from cap heights: at these
   sizes a cap height is +/-7% but a 39-character ink run is +/-1%.
3. Render headless (`Google Chrome --headless=new --window-size=1440,900`),
   downscale to 845x529, run the same probes on both, diff the table.

Final agreement: **within +/-3 reference px on every probe** — hero box, carve,
nav, both headline lines, subcopy, both buttons, all three cards, footer copy.
`new-WT/comparison.png` is the side-by-side.

### What the measurements overturned

| First read | Actually |
|---|---|
| Corner radius ~20 ref (34 design) | LSQ fit on all four corners: 23.2 ref -> **40** |
| Bottom-right "step" or notch | **54.5 degree chamfer** between two bottom edges, filleted at both ends with the same 40px radius |
| Card-1 corner = subtracted circle | The traced boundary has an **inflection** — two 30px convex fillets flanking a 46px concave arc, so `clip-path: path()`, not a radial-gradient mask |
| Card body ~13px (it looks tiny) | **17px** — "Lorem ipsum dolor sit" measures 177 design px, which only 17px Poppins produces; line 2 confirms it to 1px |
| Footer copy smaller than hero subcopy | **Identical** — 20.5/31 for both; their column-ink profiles match character for character over 135 ref px |
| Nav pill is a dark grey fill | Translucent: it multiplies the sky behind it by 0.79, i.e. `rgba(0,0,0,.24)` |
| Cards sit on/over the hero photo | **24px white gutter** — rows 352-365 ref are pure white across all 468 card columns. The chamfer exists to *clear* the rail, not to sit behind it |
| Cards have a drop shadow | None — the gutter between cards reads 253-255 against a 255 page |
| Card 1 has a green tint | No colour scrim anywhere — the haze inside it stays H203 S16%; card 1's green is the photograph |

### Structure decisions that matter

- The carve is an SVG `clipPath` with `clipPathUnits="objectBoundingBox"`, not
  `clip-path: path()`: the hero has a fixed `aspect-ratio`, so normalized units
  stay exact at every width instead of being pinned to 1392px.
- **The rail is a sibling of `.hero`, not a child.** `clip-path` clips
  descendants — nesting it deletes a third of the page.
- The card-1 scoop sits on `.card__surface`, an inner element, so it does not
  erase the jump button nesting inside the scoop.
- Card scrim stops are custom properties (`--scrim-foot/mid/head`) with
  `.card--lit` / `.card--dim` modifiers: the reference's own card means run
  87/98/75 of 255, so the scrim is tuned per photograph, not per position.

### Typeface

The original is Circular Std / Cera Pro class — single-storey `a` and `g`,
circular `o`, x-height/cap 0.777, and a `t` whose foot kicks right. None are on
Google Fonts. **Poppins** ships; its metrics match to the decimal and the
tail-less `t` is the one visible compromise. Sizes land on halves (24.5 / 20.5 /
16.5) because they were fitted to reproduce the reference's ink extents.

### Photography — `new-WT/scripts/generate-assets.mjs`

`fal-ai/flux-pro/v1.1-ultra` over raw REST (no dependency, so `new-WT` stays
self-contained), reading `FAL_KEY` from `.env.local`. Five images, then `sips`
downscales each to ~2x display size — 9.0 MB of originals to 2.6 MB.

The hero took four passes, all composition rather than subject: too small in
frame, then the tree on the right instead of the left, then no foreground. The
winning prompt states the composition explicitly — dark tree mass into the
upper-left, house carrying the right, lawn across the bottom third. Card 3 took
three: blue hour was too saturated, overcast read as a black slab, soft daylight
is the one that matches the reference's mid-tone facade.

## 2026-08-19 — Hero video regenerated with FAL (replaces third-party clip)

The original instruction was "FAL generate the video first, I will be sending the
video link… make 99% similar video" — the Pinterest link was a **style reference**,
not the asset. It had been used as the asset, importing a third-party template with
"Your Logo" baked into the aircraft livery and unconfirmed licensing. Both issues
are now gone: every frame is generated.

### Pipeline — `scripts/generate-hero-video.mjs`
1. `fal-ai/gpt-image-2` → base diorama still (`public/hero/gpt-2.jpg`)
2. `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` → 10s clip
3. `extract-frames.mjs` → 140 WebP frames at 960px (5.4 MB)

Source is 1924×1076 @ 24fps — well above the 736×414 clip it replaces.

### Why gpt-image-2 for the still, not FLUX
- `flux-pro/v1.1-ultra` accepts **no `negative_prompt`** — silently ignored, so the
  anti-text negative did nothing. One pass put "India" on the fuselage.
- FLUX garbles map labels ("Connalia", "Iseriam India"). gpt-image-2 spells
  correctly, so real INDIA / AUSTRALIA labels read as a genuine map.
- Uses `image_size: "landscape_16_9"` + `quality`; not in typed client v1.10.1,
  so it is called over raw REST.

### Three video passes — both failures were the camera, not the aircraft
| | Single map | Clean labels | Reaches Australia |
|---|---|---|---|
| v1 (no destination named) | ✅ | ✅ | ❌ exits frame upward |
| v2 ("camera pans down/right") | ❌ invented a 2nd map | ❌ "ASURIT", "DLCAT" | wanders off |
| **v3 (locked-off camera)** | ✅ | ✅ | ✅ settles beside Uluru |

Panning gave Kling off-map screen area to fill and it hallucinated new scenery.
v3 fixes the framing so the aircraft does all the travelling — no off-map region to
invent into. As a bonus the static camera encodes far smaller: 11 MB vs v1's 36 MB.

### Queue-polling bug fixed
Status lives under the **base app id**: `queue.fal.run/fal-ai/kling-video/requests/<id>/status`,
never the full versioned path — which returns a **bodyless HTTP 405** and surfaced
as the misleading "Unexpected end of JSON input". The script now uses the
`status_url` fal returns, parses defensively, and prints a `--resume <id>`.
A crashed poller does not cancel the job; v1 was recovered by resuming rather than
paying for a regeneration.

### Scrims retuned
The old scrim weights were set for the bright desk footage. The generated diorama
is already dark (deep ocean, dark timber), so the same weights crushed the hero to
near-black. Reduced to `from-bg/55` vertical and `from-bg/85 → via-bg/35` horizontal.
Worst-case measured contrast behind the headline: **5.45:1** — and because the
camera is locked off, the background is static, so that figure holds for the whole
sequence rather than only one frame.

### Verified
- `tsc --noEmit` clean, `eslint` clean, `next build` succeeds
- Scrub advances: 3 distinct canvas fingerprints at 0 / 0.5 / 0.95 scroll
- All three beats fire in order at the right progress points
- `ffprobe` confirms the clip is intact after cleanup (241 frames, 10.04s)

**Measurement note:** an apparent "scrub is broken" finding was a false alarm twice
over — first from reading the canvas synchronously before the rAF redraw, then from
stale HMR state. Both cleared after a hard reload. No code change was needed; worth
remembering before "fixing" this again.

---

## 2026-08-19 — "The Arrival": countdown section replaces legacy + code

Ran the `ui-ux-pro-max` skill for guidance. Its palette and font recommendations
(orange/blue, Playfair+Karla) were **discarded** — the client brand guidelines win.
Its structural, motion and accessibility rules were applied.

### Changed
- **Removed** `CodeSection.tsx` ("No app. No barcode. The code on the lid.") and
  the phrase from the ticker copy as well.
- **Removed** `LegacySection.tsx` (quiet editorial + static stat grid).
- **Added** `ArrivalSection.tsx` + `Countdown.tsx` — a live countdown to
  14 Sep 2026 (Perth AWST) over a warm bloom, with the legacy proof carried as an
  infinite ticker instead of a stat grid.

### Rules that changed the implementation
- **"One atomic status message"** (High): the countdown digits are `aria-hidden`
  and a single `role="status"` line reports days only. Four live regions
  announcing bare numbers every second would be unusable.
- **"Animate 1–2 elements per view max"** (High): only the countdown and the
  ticker move. No count-up animation on top.
- **Reduced motion**: the global blanket rule would fast-forward the ticker to its
  end position, so `.marquee-track` is explicitly `animation: none` and the
  container becomes manually scrollable.
- **No glyphs as icons**: ticker separators are CSS diamonds, not `✦`.

### Bug found and fixed: dark-band text was invisible
`.theme-dark` redefined `--body`, but `body` had already **computed** its colour
from the light value, and CSS inheritance passes the resolved colour rather than
the variable. Every plain `<p>` inside a dark band inherited charcoal-on-charcoal
(measured 0.78-alpha charcoal on `#373435`). Headings and eyebrows escaped it
because they set `color: var(--…)` on themselves.

Fix: `.theme-dark` now declares `color: var(--body)` itself. This also repaired
the waitlist section, which had been carrying the same latent bug since the
rebrand.

### Verified
- `tsc --noEmit` clean, `eslint` clean, `next build` succeeds
- Countdown live and ticking; 2×2 on phones (flex-wrap orphaned "Secs")
- Contrast measured in-browser, all ≥ AA: arrival body 7.49, eyebrow 5.78,
  heading 12.21, ticker 12.21, gallery body 6.14, muted labels 4.56
- Reduced-motion override confirmed present in the compiled stylesheet
- 375px: zero horizontal overflow, CTA 52px tall (≥44px touch target)

---

## 2026-08-19 — Content pivot: Mumbai Dabbawala 2.0 (Perth)

The page was rebriefed from a generic Indian-food waitlist to **Mumbai Dabbawala 2.0
— Perth**, a pre-launch teaser for a 14 September 2026 launch.

### Page structure now
Hero (scroll frames) → Legacy (1890 / 5,000+ / 200,000+) → The code on the lid →
Heritage gallery → Waitlist → Footer.

### Added
| Area | Files |
|---|---|
| Legacy stats + dabbawala portrait | `src/components/LegacySection.tsx` |
| Painted lid code, four parts | `src/components/CodeSection.tsx` |
| Modal sign-up step | `src/components/WaitlistModal.tsx` |
| Heritage image generation | `scripts/generate-images.mjs` |

### Sign-up flow
Email on the page → modal collects email, AU mobile (+61), Perth suburb
(optional, fixed list of 24), veg/non-veg. Server normalises mobiles to E.164
(`4XXXXXXXX`, `04XXXXXXXX` and `614XXXXXXXX` all accepted) and rejects suburbs
that were not on the offered list.

### Decisions worth remembering
- **Native `<dialog>` + `showModal()`** rather than a hand-rolled modal — focus
  trap, Escape, and an inert background come from the platform.
- **Scroll lock is its own effect.** Folded into the open/close effect it depended
  on `!dialog.open`, so React's dev double-invoke unlocked the body and then
  skipped re-locking. Caught in the browser, not by tests.
- **Modal is remounted via `key` on open** instead of syncing prop→state in an
  effect (React 19 lints the cascading-render pattern).
- **Six-dish gallery kept at the user's request**, but reworded to heritage framing
  with no prices or ordering language, since the brief rules out a menu.
- **`dabbawala-cycle` regenerated** — the first render painted garbled AI lettering
  on the crate. Prompt now demands a bare, unmarked crate.

### Verified
- `tsc --noEmit` clean, `eslint` clean, `next build` succeeds
- Waitlist API across 6 cases: full payload, leading-zero mobile, +61 mobile,
  bad mobile, off-list suburb, missing preference
- Modal in-browser: opens as a true `:modal`, email prefills, focus lands inside,
  body scroll locks, submit closes it and unlocks, success state renders
- Server log confirms `perth@example.com · +61412345678 · Fremantle · veg`

### Still open
Storage remains unwired, the FAL key still needs rotating, and the hero video's
licensing and residual "Your Logo" livery are unchanged from the notes below.

---

## 2026-08-19 — Initial build: scroll-frame hero, food gallery, waitlist

### Scope
Next.js 16 waitlist landing page with a scroll-driven frame sequence, FAL-generated
Indian food photography, and a waitlist form (storage deliberately not wired).

### Stack
- Next.js 16.3.1 (App Router, Turbopack), React 19.2, TypeScript
- Tailwind CSS v4 (`@theme inline` tokens)
- `@fal-ai/client` 1.10.1, `server-only`
- ffmpeg + cwebp (local, build-time only)

### What was built
| Area | Files |
|---|---|
| FAL client + pinned model ids | `src/lib/fal.ts` |
| Generation API routes | `src/app/api/generate/{image,video}/route.ts` |
| Waitlist API (validation + honeypot, no storage) | `src/app/api/waitlist/route.ts` |
| Scroll frame engine | `src/components/ScrollFrames.tsx` |
| Hero composition + beats | `src/components/ScrollHero.tsx` |
| Gallery, form, header, reveal | `src/components/{FoodGallery,WaitlistForm,SiteHeader,Reveal}.tsx` |
| Brand tokens | `src/app/globals.css` |
| Content/brand config | `src/lib/site.ts` |
| Asset scripts | `scripts/{generate-food-images,extract-frames}.mjs` |

### Assets generated
- **6/6 food stills** via `fal-ai/flux-pro/v1.1-ultra` → `public/food/` (~1 MB each)
- **150 scroll frames** at 736×414 WebP q78 → `public/frames/` (5.3 MB, 34 KB avg)

### Decisions worth remembering
- **Model ids verified live** by POSTing `{}` to `queue.fal.run/<id>` — 200 = exists,
  404 = does not. Cheap: empty input fails validation at ~0.24s.
- **Frames extract at source width (736px), not upscaled.** The first pass rendered
  at 1280px for a 13 MB payload; upscaling a 736px source adds bytes, not detail.
  Native + WebP cut it to 5.3 MB.
- **ffmpeg here has no webp encoder** — extraction writes JPEG then pipes through
  `cwebp` with a bounded worker pool.
- **`overflow-x: clip`, not `hidden`, on body.** `hidden` makes body a scroll
  container, which silently breaks the hero's `position: sticky` pinning.
- **Hero cut at 13.0s.** See the licensing/placeholder note below.
- **Muted tone raised to 68%/62%** — lower values put eyebrow labels under 4.5:1.
- **`useSyncExternalStore` for media-query and scroll state**, not `setState` in an
  effect body (React 19 lint flags the cascading-render pattern).

### Verified
- `tsc --noEmit` clean, `eslint` clean, `next build` succeeds (5 routes)
- Scroll scrub advances frames and cross-fades the three beats
- Waitlist API: valid → 200, invalid → 400, honeypot → 200 (silent), malformed → 400
- Form: `aria-invalid` + `role="alert"` on error, `role="status"` on success
- Brand tokens resolve exactly: `#FEFEFE` / `#373435` / `#ED3237` / Asar / Palanquin

### Open items
1. **Rotate the FAL key** — it was shared in plaintext chat.
2. **Confirm rights to the hero video.** It is a third-party travel-agency template
   demo pulled from Pinterest, not original footage.
3. **"Your Logo" placeholder is still faintly visible** on the plane's livery even
   at the 13.0s cut. It is baked into the source, not an overlay.
4. **Waitlist storage is not connected** — `src/app/api/waitlist/route.ts` validates
   and logs but intentionally persists nothing. One function call to swap in.
5. Brand colour `#FFFFF` was given with five F's; read as `#FFFFFF`.

---

## 2026-08-21 — shadcn/ui added, animated CTA component, init-collision repair

Scope: the Next.js app in `src/`. The standalone `new-WT/` page is untouched — its
`.cta` (plain CSS, same motion) is unchanged.

### What was added
- `npx shadcn@latest init` — run by the user, **Base UI** preset (`style: base-nova`),
  writing `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`.
- `src/components/ui/dabba-icon.tsx` — the stacked-tiffin glyph (handle, lid, two
  tiers) as a `currentColor` SVG. Same path already used in `new-WT`.
- `src/components/ui/button-with-icon.tsx` — `ButtonWithIcon` and `LinkWithIcon`,
  the 21st.dev "button with icon" mechanic rebuilt on the Base UI button.

### The button mechanic
Rest `ps-6 pe-14` with the chip at `right-1`; hover `ps-14 pe-6` with the chip at
`right-[calc(100%-2.75rem)]`, both over 500ms `cubic-bezier(.4,0,.2,1)`.
**The two paddings trade values, so the box never changes size** — measured 196.2px
in both states — which is what makes animating `padding` safe here instead of a
reflow hazard. `2.75rem` = the 40px chip plus its 4px inset, so the gap it leaves
on the left equals the one it vacated on the right.

- `p-1` must come **before** `ps-6 pe-14` in the class string. It is what lets
  tailwind-merge drop the base cva's `px-2.5`; `ps-*` alone does not conflict with
  `px-*` strongly enough to remove it, and equal specificity then leaves the winner
  up to stylesheet order.
- Chip is centred with `top-1/2 -translate-y-1/2`, **not** `top-1`. The base cva
  carries `border border-transparent`, so a fixed 4px top inset measures 5px from
  the outer edge and leaves 3px at the bottom — a 2px asymmetry the probe caught.
- The reference's `group-hover:rotate-45` was deliberately **not** carried over.
  It reads as motion on an arrow; on a tiffin it reads as a spilled one.
- Colours are the brand tokens (`bg-accent`, `text-on-accent`, chip
  `bg-surface text-accent`), not shadcn's `--primary`, so it matches every other
  CTA on the site. `#d4272c` is the hover red, matching `new-WT`.
- No `"use client"` — the whole interaction is CSS `:hover`, so it stays a server
  component. `LinkWithIcon` uses Base UI's `render` prop; there is no
  `@radix-ui/react-slot` in this setup and none is needed.

### `shadcn init` collisions — repaired in `src/app/globals.css`
Init merges its token block into the existing `:root`, and three of its writes
landed on load-bearing project values. None of this was visible from the CLI output.

1. **`--accent` overwritten** with `oklch(0.97 0 0)`. This project's `--accent` is
   `var(--brand-red)` and `bg-accent` / `text-accent` is every CTA in
   `WaitlistForm`, `WaitlistModal`, `ArrivalSection`, `ScrollHero`, `SiteHeader`
   (20+ usages) — all of which had become near-white on white. Restored.
2. **`--muted` overwritten** with the same neutral, orphaning the contrast comment
   directly above it. Restored to `color-mix(in srgb, var(--brand-charcoal) 68%,
   transparent)`, the value that comment documents.
3. **`body` gained `@apply bg-background text-foreground`**, which sits after the
   existing `background: var(--bg)` / `color: var(--body)` in the same rule and
   wins — swapping `#FEFEFE` for pure white and the 78% charcoal body colour for
   near-black. Removed.

The names clash because they mean different things in each system: here `--accent`
is the brand red and `--muted` is a body-copy foreground; in shadcn both are
neutral hover **backgrounds**. Ours win. A shadcn component that wants a neutral
ground should use `--secondary`, which does not collide. **Re-check these three
places after every `shadcn add`.**

Also from init, left as-is but worth knowing: `Geist` was added as `--font-sans`
and applied to `html`, and `--font-heading` now maps to it. Body copy is still
explicitly Palanquin and headings still Asar, and nothing uses `font-heading`, so
this is currently inert.

### Verified
- `tsc --noEmit` clean; `eslint src` clean.
- Rest vs. pinned end state, measured headless at 1280px: `padS/padE` 24/56 →
  56/24, chip inset `L 151.2 / R 5` → `L 5 / R 151.2`, **width 196.2 in both**,
  chip 40x40 at `top 4`, `scrollWidth == 1280` (no overflow).
- Renders identically as `<button>` and as `<a>`, and with `w-80 justify-between`.
- `--accent` resolves to `rgb(237, 50, 55)` = `#ED3237` again; the nav's "2.0"
  badge is red in a fresh render.

### Notes on process
- A route named `_probe-cta` never resolves: App Router treats a leading
  underscore as a **private folder** and excludes it from routing. Requests fell
  through to `/` and looked like a redirect.
- The dev server found on :3000 was a stale `next-server v16.2.9` (package.json is
  16.3.1) returning 500 on every route, including `/`. It predated the init and had
  to be restarted before anything could be verified.
- **`lsof -ti:<port>` lists processes with a *connection* on that port, not just
  the listener.** A PID read off it here was Claude's own network-service helper,
  and killing it left the browser pane with a zero-size viewport (`innerWidth 0`),
  which silently stops style recalc — injected `!important` probe rules had no
  effect and rest/hover measured identical. Verification moved to headless Chrome.
  Same class of trap as the stale-tab measurements noted earlier in this log.

---

## 2026-08-21 — Waitlist section redesign (new-WT)

Scope: `new-WT/index.html` + `new-WT/styles.css` only, the `#waitlist` section.
Replaced a generic dark-panel-plus-white-card-plus-01/02/03-steps layout with a
single organising idea: the section is a dabba lid, part-painted — three
routing fields already settled, one bare (the email field).

### Process
Ran a design workflow: four independent full-detail proposals (lid-code,
restrained editorial, hero-geometry continuity, countdown/queue-momentum), each
scored by two adversarial judge lenses (craft/brand, engineering/brief-
constraints), then synthesized into one winner with a named must-fix list from
the judges' findings. Picked **lid-code** — the only direction that fixes the
brief's four stated weaknesses (generic steps, lede/steps duplication, an
inconsequential-feeling email field, decorative-only red glows) with one move
instead of four, and the only one that deletes the white card entirely rather
than leaving the "undifferentiated stack" critique unanswered.

### What shipped, and what the judges' must-fix list changed en route
- **No fabricated routing tokens.** The draft's `MUM`/`PER` 2-3 letter codes,
  set in the same enamel/weight as the real code inches away, were deleted —
  inventing a fake code beside a real, quoted one (`K BO 12 E7`) is exactly the
  kind of dishonesty the brief's "teaser-only, no invented detail" constraint
  rules out. Replaced with truthful values: ORIGIN "Mumbai 1890", CORRIDOR
  "Perth Metro", CARRIER hatched with no value (it's assigned by the network).
- **Ground switched from a light "brushed steel" draft back to the page's
  existing dark panel** (`#2b2827`, flat — no specular gradient, no grain, no
  second gradient). The draft's steel-texture version was flagged twice
  (craft + constraints judges) as texture filler in a new costume, and it lost
  the page's one dark beat.
- **Destination field relabelled "Destination — email address"**, not
  "your suburb" — the actual suburb is optional and deferred to the modal, so
  labelling the email field as if it captured the suburb would be a real
  logic/honesty slip, caught independently by two judges.
- **Contrast recomputed against the final `#2b2827` ground**, not carried
  forward from the draft's steel-ground numbers (one of which was itself
  wrong: the judges' own "eyebrow" figure was off by a full point). Verified
  independently with a small contrast script rather than trusted blind:
  `--brand-white` 14.63:1, `eyebrow--light` 8.69:1, `--accent` 3.56:1 (large
  text only — nothing under 24px on this ground may use full-strength red),
  `--accent-ink` 6.45:1 on white but only 2.27:1 on this dark ground (hence
  it's used for the confirmation mark and typed value, which both sit on the
  white open-field box, never for anything on the charcoal itself).
- **Placeholder deleted, not recoloured** — its grey was outside the palette
  and under 4.5:1. Rather than leave the resulting box looking like an inert
  blank rectangle, added a small decorative envelope glyph inside it
  (`--ink-soft`, `aria-hidden`, not a placeholder) so the field reads as an
  email input at a glance; the accessible name still comes from the `<label>`.
- **`role="alert"` no longer sits on a node toggled via `display: none`.**
  Toggling display is inconsistent across screen readers; the node now stays
  in the DOM (CSS collapses it via `:empty`) and the submit handler
  writes/clears its `textContent` instead, plus toggles `aria-invalid` on the
  input. Added a same-session UX pass beyond the must-fix list: an `input`
  listener that clears the error the moment the address becomes valid again,
  without waiting for resubmit.
- **`:has(#email:valid)` drives the "confirmed" state with no JS** — dashed
  border goes solid, a small mark fades in 3px. Never implies a place is
  reserved, only that the browser accepts the address. Degrades silently
  where `:has()` isn't supported.
- **Day count reuses the hero's own `[data-unit="days"]` ticker and its
  `.tile__num` page-turn**, not a second clock. This resurfaced a real
  cascade-specificity bug: a bare `.route__face { height: 20px }` and the
  pre-existing `.tile__num { height: 21px }` inside `@media (max-width: 900px)`
  have equal specificity, so the later-in-file media rule always wins
  regardless of which one is "more specific in spirit" — it silently
  collapsed the turn stage on every viewport under 900px. Fixed by scoping the
  override as `.route .route__face` (two classes beats one, regardless of
  source order).
- **Responsive: three field layouts, not two.** Above 840px, a 3-column ruled
  grid. Below 840px (iPad portrait through the smallest phone), the three
  settled fields stack into full-width ruled rows via `order: -1` on the
  label — no markup change — because `MUMBAI`/`PERTH` are unbreakable single
  words that would clip rather than wrap in a narrow third-column.

### Two real bugs found by measuring, not by looking
1. **CSS Grid "blowout."** `.route__cells` (`repeat(3, 1fr)`) and `.join`
   itself (`1.05fr 0.95fr`, and its single-column `1fr` override at ≤1040)
   all used bare `fr` tracks. A bare `1fr` track's minimum width defaults to
   its content's min-content — normally invisible, since most text wraps —
   until something inside truly can't shrink. Two independent floors were
   found this way: the word "MUMBAI" (no break opportunity) inside the
   3-column grid, and separately `.cta__label`'s `white-space: nowrap`
   (deliberate — the chip-travel hover animation needs the button box to
   never resize) forcing the whole grid item wide. Both silently overflowed
   the page horizontally at narrow widths — 320px scrolled 14–52px sideways
   with **zero visual sign in a normal-width screenshot**; only a real
   320–390px render surfaced it. Fixed by clamping every track to
   `minmax(0, …)` instead of a bare fraction — the same fix, applied twice at
   two nesting levels.
2. **Word-fusing `<br>` hide, again.** `<h2>The last field<br />on the lid…`
   hid the `<br>` at ≤1040 with no literal space in the source, producing
   "fieldon" — the exact bug this file had already documented once for the
   hero's own `<br>` handling. Recorded again here because it recurred on a
   *different* element despite the existing note; the lesson is now: **any**
   `<br>` that gets `display: none` anywhere needs a literal space adjacent
   to it in the markup, checked by rendering the hidden state, not by reading
   the source.

### Verified
- 13 breakpoints measured headless (1440 down to 320, plus 839/840 either
  side of the new stacking threshold): `scrollWidth === viewport width` and
  zero elements wider than the viewport at every one, including the two that
  were broken (320 pre-fix: `scrollWidth` 372, then 334, both traced to the
  grid-blowout bug above; both now 320).
- All four field-box states rendered and inspected: rest (envelope glyph,
  dashed border), `:focus-within` (white outline at 14.6:1, red glow), valid
  (`:has()`, solid border + fading confirmation mark), and `.signup--bad`
  (solid red border, soft-pink fill, error text present, focus returned to
  the field) — the last two confirmed via a full JS lifecycle check
  (`aria-invalid` set → cleared, error text written → cleared on correction),
  not just visually.
- `tsc`/lint not applicable (plain HTML/CSS/vanilla JS, no build step for
  this folder). Markup tag-balance checked programmatically; no leftover
  temp/debug files.

---

## 2026-08-21 (cont.) — Scroll-triggered animation, waitlist + legacy sections

Scope: `new-WT/index.html` + `new-WT/styles.css` only.

- **Waitlist section (`#waitlist`)**: content fades and rises in, staggered
  top to bottom, the first time the section crosses into view — left column
  (eyebrow → h2 → lede → decode) and right column (day-count line → the three
  routing fields → the open field → the aside → the CTA → the note) each on
  their own `nth-child` delay ladder, 80ms apart.
- **Legacy section (`#legacy`)**: the three collage photos wipe in left to
  right via animated `clip-path: inset()`, staggered lead-photo-first then
  the two stacked ones — a wipe reads as uncovering a specific photo, which
  suits a collage better than a plain fade. `inset()`'s `round <radius>`
  argument keeps the clip edge following the photo's own `--radius-card`
  through the animation, so the corners never look sharp mid-wipe.
- One shared `revealOnScroll(el)` helper (IntersectionObserver, `threshold:
  0.2`, disconnects itself after firing once) drives both. It only runs, and
  only ever adds `reveal-ready`, when `IntersectionObserver` exists and
  `prefers-reduced-motion` is not `reduce` — so a visitor without JS, without
  IntersectionObserver, or who has asked for less motion always gets the
  plain, fully visible layout with no animation, never a permanently-hidden
  section. A second, redundant safety net in the existing
  `@media (prefers-reduced-motion: reduce)` block forces full visibility if
  `reveal-ready` is ever present under that preference regardless.

### A verification detour worth recording
Confirming the reveal fires correctly took three different techniques before
landing on one that actually proved it:
1. **Headless Chrome with `--virtual-time-budget` is not reliable for timing
   IntersectionObserver.** Polling `classList` at fixed intervals after an
   in-page `scrollIntoView()` sometimes showed `is-visible` appearing, and
   sometimes — with an outwardly identical setup — never appearing at all
   across a 3-second window. This is a virtual-clock/rendering-pipeline
   interaction, not a bug in the reveal code: an isolated two-rule test page
   (same selectors, same `clip-path` values, plain `setTimeout`, no
   `--virtual-time-budget` timing dependency) resolved the cascade and
   completed the transition correctly every time.
2. **The interactive Browser pane dropped into the zero-size-viewport state**
   already on file for this project (`innerWidth`/`innerHeight: 0`) partway
   through this check — confirmed by reading `window.innerHeight` directly,
   not inferred from a blank screenshot. Neither closing and reopening the
   tab nor `resize_window` recovered it this time.
3. What actually confirmed correctness: (a) the isolated cascade test above,
   proving the CSS specificity/transition/`clip-path round` mechanism is
   sound in principle, and (b) an earlier, still-healthy pass through the
   *same* pane, before it degraded, where both `#legacy` and `#waitlist`
   correctly gained `is-visible` — with sane `getBoundingClientRect()`
   values — after a real scroll.
- Full 13-breakpoint overflow sweep (1440→320) re-run after these CSS
  additions: unchanged, `scrollWidth === viewport width` at every one. The
  new rules only touch `opacity`/`transform`/`clip-path`, none of which
  affect layout flow, so this was a low-risk check, not a speculative one.

---

## 2026-08-21 (cont.) — Directional collage reveal; waitlist section made animation-led

Scope: `new-WT/index.html` + `new-WT/styles.css` only.

### Directional image reveal (legacy collage)
Replaced the single left-to-right wipe on all three collage photos with three
distinct directions, matching the collage's own layout rather than repeating
one motion three times: the tall lead photo rises **bottom-to-top**, the
second tall photo settles **top-to-bottom**, and the wide photo grows from
its **top-left corner toward its bottom-right** — the closest a pure
`clip-path: inset()` can get to a true diagonal wipe, since `inset()` only
ever describes an axis-aligned rectangle (a real diagonal needs `polygon()`,
which doesn't interpolate cleanly between two different vertex sets in a
plain CSS transition).

### The waitlist section: animation as the organizing idea, not decoration
Per feedback that the section needed something animated rather than a static
layout with a scroll-fade on top, kept the existing lid-code layout (already
judged and refined) and made two structural changes to its motion:

1. **The three routing fields now stamp onto the lid in sequence** — a quick
   overshoot scale-and-fade (`route-stamp`, 0.46s), not a plain fade, so
   watching them land is the section's actual content rather than
   incidental entrance polish. `.route__cells` was pulled out of the generic
   block-level fade so its three `<li>`s could animate individually without
   the `<ul>` doubling the motion. Everything downstream (`.route__open`,
   `.route__aside`, the CTA, `.route__note`) was retimed to follow the last
   stamp rather than race it.
2. **The hairline under "K BO 12 E7" draws itself in** (`scaleX(0)→1`) rather
   than sitting there as a static rule — `border-top` became a
   `.decode::before` pseudo-element for this, since a real border has no
   length property to animate.
3. **The open field's rim now marches continuously** — a small `<svg>`
   overlay (`<rect>` with `stroke-dasharray` + an infinite `stroke-dashoffset`
   keyframe) replaced the static `border: 1.5px dashed`, because a native CSS
   dashed border has no equivalent to SVG's dash-offset and cannot be
   animated at all. It runs for as long as the field is empty and invalid —
   reads as "this one is still waiting" continuously, not just once on
   scroll — then stops and turns solid the moment `:has(#email:valid)`
   matches, or on the existing `.signup--bad` state. Paused (not removed) by
   `prefers-reduced-motion`, matching how the hero's own countdown tile-flip
   is handled.

### A second, unrelated real bug this surfaced
The `<svg class="route__marching">` overlay, sized with `position: absolute;
inset: 0` and no explicit `width`/`height`, rendered at exactly 300×150 —
SVG's UA-default intrinsic size when no `width`/`height`/`viewBox` is
present — and overflowed 300px past its box at every width, but only wide
enough to push `document.documentElement.scrollWidth` past the *viewport* at
320px (everywhere wider, there was enough slack on the page's own right
margin to hide it). Root cause: for an absolutely-positioned **replaced**
element (`<svg>`, `<img>`, `<video>`) whose `width` computes to `auto`, the
CSS2.1 §10.3.8 algorithm uses the element's *intrinsic* size first and only
falls back to solving from `inset`/`left`+`right` if no intrinsic size
exists — unlike a plain `<div>`, where `inset: 0` alone is normally enough to
fill the containing block. Fixed with an explicit `width: 100%; height: 100%`
alongside the `inset: 0`. Caught only by re-running the full breakpoint
sweep after this change — a plain visual check at any width above ~400px
would have missed it entirely, since the overflow was invisible until the
viewport itself ran out of margin to absorb it.

### Verified
- Full 13-breakpoint sweep (1440→320) re-run after every step in this
  entry; the SVG bug above was caught and fixed by this same sweep before
  moving on, not left for later.
- `svg.getBoundingClientRect().width === box.getBoundingClientRect().width`
  after the fix, confirming the marching rect now exactly tracks the field's
  own box at runtime, not a fixed guess.
- `getComputedStyle(rect).animationName === "route-march"` and
  `strokeDasharray === "7px, 6px"` confirmed applied on the live rect.
- Markup tag-balance checked programmatically; no leftover temp files.

---

## 2026-08-21 (cont.) — Waitlist section rebuilt as a bento mosaic

Scope: `new-WT/index.html` + `new-WT/styles.css` only. Full replacement of the
lid-code `#waitlist` design (all `.join`/`.route*`/`.decode*` rules and
markup removed) with a bento-grid layout after a shared reference screenshot
(an AI/3D product landing page). The functional contract is unchanged:
`#waitlist`, `form#signup`, `input#email`, `#route-err`, `#route-note`,
`.signup--bad` — the JS submit handler needed no changes at all.

### Content mapping — every card is real, nothing invented
The reference's "Our creators" slot (three avatar photos) was the one piece
that could not carry over as-is: this brief has no real people to photograph,
and standing in fake faces would be exactly the invented-detail problem the
brief already rules out. Replaced with a genuine, already-established asset:
three dish photos under "Six dishes, one lunch." Everything else maps to real
content — the lead photo is the carrier-with-bicycle shot, the tinted card is
the lid-code close-up, the stat card is the real 5,000+ carrier count, the
dark photo is the stacked-dabba shot, and the reference's circular rotating
badge became a real link ("Join the waitlist · Perth 2026 · Since 1890 ·"
looping text, `<textPath>`) that jumps to the email field — not decoration.

### New building blocks
- `.showcase` — the outer grid (mosaic | main column), background a 5%
  charcoal-into-white mix rather than a new hue, so the white cards read as
  objects sitting on it.
- `.mosaic` — a 2-col, 4-row `grid-template-areas` layout with **explicit**
  `grid-template-rows`, not `min-height` on the tiles. Photos have their own
  aspect ratios; an auto-sized row happily grows to fit whichever tile is
  tallest, which is exactly how the badge circle's column ended up ~140px
  shorter than the photo column beside it on the first pass. Explicit rows
  plus `object-fit: cover` on every photo means every tile is exactly the box
  below it, full stop.
- `.piece--badge` — sized `width: 100%; max-height: 100%; aspect-ratio: 1`,
  not `width: 100%` alone: its grid area is taller than it is wide (it spans
  two rows), so a width-only circle would be taller than its own area.
  Whichever axis is tighter wins, so it never needs the rows above it tuned
  to a precise ratio.
- `.showcase__hero` / `.showcase__feature` / `.showcase__note` — the headline
  card (eyebrow, h2, lede, inline `#signup` form), a secondary highlight
  card, and the privacy line, reusing the page's existing `.eyebrow`/`h2`/
  `.lede` globals rather than redeclaring type sizes.
- The actual email field is a plain rounded input this time (not the
  lid-code section's marching-border box) — a real placeholder is back,
  since on a white background `--ink-soft` clears 4.5:1 (7.01:1 measured),
  unlike the previous dark-ground design where the same idea failed contrast
  and had to be replaced with a decorative icon instead.
- Reveal animation kept the same page-wide mechanism (`revealOnScroll`,
  `reveal-ready`/`is-visible`, gated on `IntersectionObserver` + not
  `prefers-reduced-motion`): the six mosaic tiles pop in on a stagger, the
  hero card's children and the feature/note cards fade and rise.

### A naming collision caught before it shipped
The new mosaic tiles were first written as `.tile`/`.tile--portrait`/etc. —
directly colliding with the **pre-existing** `.tile` class the hero's own
countdown digits use (`.tile`, `.tile__num`, `.tile--lead`, `.tile--fine`).
Both rule sets would have applied to both components simultaneously. Caught
by grepping for `.tile` before treating the first draft as final, not by
visual inspection — renamed the whole new family to `.piece`/`.piece--*`
before it ever rendered incorrectly.

### Two real bugs found by the same measure-first discipline as the rest of
this file's history
1. **The mosaic/badge height mismatch above** — found by screenshot, root-
   caused to auto-row-sizing, fixed with explicit rows + a dual-axis clamp.
2. **A large empty gap between the email input and the button at ≤700px.**
   `.showcase__field { flex: 1 1 240px }` is fine in the desktop row layout,
   but the ≤700 breakpoint switches `.showcase__row` to
   `flex-direction: column` — and `flex-basis` always sizes along the main
   axis, which is now vertical. The same "240px" that was a sane minimum
   *width* became a minimum *height*, stretching the field into a tall empty
   box. Fixed with `.showcase__field { flex: 0 0 auto }` scoped to that
   breakpoint. Caught in a real screenshot at 390px, not by reading the CSS.

### Verified
- Full breakpoint sweep, 1440 down to 320 (including 1180/1040/900/768/700/
  560/390/375/360/320): `scrollWidth === viewport width` at every one, both
  before and after the two fixes above.
- Screenshotted at 1440, 1180, 900, 390, 320 — mosaic/badge balance and the
  input/button gap both confirmed fixed by re-screenshotting, not just by
  re-reading the CSS.
- Submit-handler lifecycle re-run against the new markup: `aria-invalid` set
  → cleared, `#route-err` text written → cleared, `.signup--bad` toggled,
  border/background colours for the bad and `:has(#email:valid)` states both
  confirmed via `getComputedStyle` after their transition settles (reading
  immediately after the class change shows the pre-transition colour, not
  the target — the same "read-too-soon" artifact this file has hit before).
- Contrast checked for every new colour pairing: `--accent-ink` on
  `--accent-soft` (5.65:1), `--ink-soft` placeholder on white (7.01:1),
  `--ink`/white text on the charcoal badge (12.32:1 both), the badge's
  rotating text at 72% white on charcoal (7.23:1). The focus ring's solid
  border-color already cleared 1.4.11 at 4.11:1; added an explicit 2px
  outline on top anyway, matching this file's established practice of not
  resting on the minimum.
- Found, and deliberately did **not** fix inline: the pre-existing global
  `.eyebrow` rule (`color: var(--accent)`, used site-wide, not introduced by
  this change) measures 4.11:1 on white — under the 4.5:1 AA minimum for its
  15px/600 size. Left alone because fixing it touches shared styling used by
  sections outside today's scope; flagged as a separate task instead.
- Markup tag-balance checked programmatically; no console errors; no
  leftover temp files.

---

## 2026-08-24 — Waitlist mosaic re-cut to the reference's actual grid

Scope: the `.mosaic` column of `#waitlist` in `new-WT/` only. The right-hand
`.showcase__main` column, the form, and every JS contract are untouched.

The previous pass built the mosaic as **2x4 with six tiles**; re-reading the
supplied reference against it, the reference is **2x3 with five**, with the
subject photo spanning rows 1-2. The grid shape itself was the thing that did
not match, so the fix was structural rather than cosmetic.

### Slot mapping — reference role to real MD content
| Reference | Role | Built as |
|---|---|---|
| Portrait, spans rows 1-2 | subject photo | `legacy-carrier.jpg` (unchanged) |
| Headset on a blue block | object on a tinted ground | `legacy-code.jpg`, circular crop on `--accent-soft` |
| "NFT DESIGN AWARDS" | centred mark + tracked caption | `logo.png` + "Mumbai's lunch network" |
| "Our creators" + avatars | label + overlapping round thumbs | "Our dishes" + three dish thumbs |
| Black circle | rotating ring text + centre glyph | unchanged |

Dropped: the `5,000+` stat tile. The reference has no sixth slot, and that
figure is already a headline stat in the "Since 1890" band immediately below —
removing it lost nothing and removed a duplication.

The lid photo gets a **circular** crop rather than the previous rounded
square: the lid genuinely is round, so the crop reads as the object itself,
which is what makes the reference's cut-out product shot work in that slot.
The caption that used to sit under it is gone — the reference's equivalent
tile is image-only, and the card directly beneath it is the one that carries
words.

### Two proportion corrections found by rendering, not by reading
1. **The label card was stretching to its row.** Left at the grid default it
   filled the full 265px row with the title pinned top and the thumbs pinned
   bottom, leaving ~150px of dead white between them. The reference's
   equivalent card is visibly *shorter* than the circle beside it, with the
   page ground showing beneath. Fixed with `align-self: start; height: 152px`.
2. **Row heights re-derived, not carried over.** `200 / 145 / 265` with 14px
   gaps totals 638, which lands within ~11px of the right column's own
   natural height — so neither column stretches far to meet the other.
   `--badge-row` stays the single source of truth for row 3's height and the
   circle's diameter, so those two cannot drift apart.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 375 /
  360 / 320: `scrollWidth === viewport width` at every one.
- Rendered and eyeballed at 1440, 1180 and 390 — the three distinct layout
  modes (2-col mosaic beside the form; 2-col mosaic full-width below the
  form; single-column stack).
- **No-JS check**: all five tiles computed `opacity: 1; transform: none` with
  every `<script>` stripped, confirming the reveal's hidden state is still
  keyed off the JS-added `reveal-ready` class and cannot strand a tile
  invisible.
- Reduced-motion block still covers all five via `.reveal-ready .piece`.
- Grepped for every retired class (`piece--product`, `piece--stat`,
  `piece--dishes`, `piece--stack`, `piece__n`, `piece__plus`, `piece__kicker`,
  `piece__l`) across both files: zero remaining references, in the base rules
  and inside the media queries.
- Markup tag-balance clean; no console errors; no leftover temp files.

### Note on measuring this section
Tiles measure at **0.92x** their CSS size if the page is probed before the
reveal fires — that is `transform: scale(0.92)`, the reveal's own starting
state, not a layout bug. Force `reveal-ready is-visible` on `.showcase`
before measuring or screenshotting, or divide by 0.92.

---

## 2026-08-24 (cont.) — Left mosaic converted to masonry

Scope: the `.mosaic` column of `#waitlist` only. Form, right column and every
JS contract untouched.

Per a second reference (a Pinterest-style board of varied-height cards), the
mosaic moved off the fixed 2x3 grid onto a real masonry flow: tiles keep their
own heights and the columns fill independently.

### Why multi-column and not grid
`grid-template-rows: masonry` is still not shipped unprefixed in any stable
browser, and a JS masonry would be the one runtime dependency this page does
not have. `columns: 2; column-gap: 14px` does it in two declarations and
degrades to a single column on its own.

Three things that are easy to get wrong and are load-bearing here:
- **`break-inside: avoid` on `.piece`** (plus the `-webkit-column-break-inside`
  alias Safari still wants). Without it a tall tile is free to split at the
  column break and render half at the bottom of column 1 and half at the top
  of column 2.
- **Vertical rhythm is `margin-bottom`, not `gap`.** `column-gap` only spaces
  the columns apart; nothing stacks tiles *within* a column, so the 14px had
  to move onto the tile.
- **`grid-area` / `align-self` / `justify-self` are inert in a multi-column
  flow** and were all removed rather than left as dead declarations that read
  as if they still positioned something.

Tile order in the DOM is the flow order — the browser fills column 1 to
roughly half the total height then starts column 2 — so heights were chosen so
that split lands cleanly between `.piece--mark` and `.piece--menu`. Measured
result at 1440: column 1 gets portrait/object/mark (340/200/132), column 2
gets menu/badge/stack (123/300/250).

### Changes beyond the layout swap
- **`.piece--stack` restored** (the dabba-stack photo, dropped in the previous
  2x3 re-cut). Masonry needs enough tiles of differing heights to read as
  masonry; five in two columns was too few to stagger convincingly.
- **`.piece--menu` is auto-height now.** It had a fixed 152px with the thumbs
  pushed to the bottom by `margin-top: auto` — in a masonry flow a text card
  should be exactly as tall as its content, and the fixed height left the
  thumbs stranded in a half-empty box. The now-inert `margin-top: auto` went
  with it.
- **The badge circle is capped at 300px** (`width: min(100%, 300px)` +
  `margin-inline: auto`). This is a real bug the sweep caught: between 701 and
  1040 the mosaic spans the full section rather than sharing it with the form,
  so its columns widen to ~470 — and an uncapped `width: 100%` circle rendered
  as a **435px black disc** that swallowed the board. At the desktop column
  width (306) the cap is within 6px of full-bleed, so it costs nothing where
  it is not needed.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 375 /
  360 / 320: `scrollWidth === viewport width` at every one. Badge now measures
  a constant 300px across every wide width instead of 435/374/314.
- Rendered at 1440, 900 and 390 — the three layout modes (masonry beside the
  form; masonry full-width below the form; single-column stack).
- **No-JS check** with every `<script>` stripped: all six tiles compute
  `opacity: 1; transform: none`, `column-count` still resolves to 2, and no
  overflow — so the masonry is pure CSS and the reveal's hidden state remains
  keyed off the JS-added `reveal-ready` class.
- Reduced-motion block still covers all six via `.reveal-ready .piece`.
- No stale `grid-area` / `grid-template-areas` / `--badge-row` / `align-self`
  declarations remain; markup balanced; no console errors; no temp files.

### Measuring note (unchanged, still bites)
Tiles read **0.92x** their CSS size if probed before the reveal fires — that is
the reveal's own `transform: scale(0.92)` starting state. Force
`reveal-ready is-visible` on `.showcase`, or strip the scripts, before
trusting a measurement.

---

## 2026-08-24 (cont.) — More images in the masonry

Scope: `.mosaic` only. Six tiles to nine; the three unused dish photos
(`dish-4` paneer tikka, `dish-5` chole bhature, `dish-6` gulab jamun) join as
full tiles, so the board is now six photographs and three cards rather than
three and three. Every asset in `new-WT/assets/` is now used somewhere on the
page.

### Refactors that came with it
- **`.piece--photo` replaces the per-tile image rules.** `.piece--portrait img`
  and `.piece--stack img` were byte-identical; both now share one
  `.piece--photo img` rule and the class is on the markup, so a new photo tile
  is a class rather than a new CSS block. Heights are three modifiers
  (`--h-sm` 132 / `--h-md` 158 / `--h-lg` 182) — a photo with
  `object-fit: cover` contributes no intrinsic height, so in a masonry flow
  every one has to be given a height or the tile collapses.
- **The reveal stagger is `nth-child`, not one rule per tile name.** With nine
  tiles and more likely to be added, a named rule per tile means a silently
  un-staggered card every time one is dropped in. `:nth-child(n + 9)` catches
  the tail so a tenth tile shares the last delay rather than trailing further
  behind.

### The composition problem this created, and two wrong turns before the fix
Nine tiles took the mosaic from 715px to 1046px while the form column's
natural height stayed ~640 — a ~400px hole under the privacy note, because
`.showcase` is a grid and both columns were stretching to the taller one.

1. **First attempt: `flex: 1` + `justify-content: center` on
   `.showcase__hero`,** so the form card absorbs the extra height and centres
   its contents. Rendered, and it was worse — a small form floating in the
   middle of an 800px white card reads as a void *inside* the card instead of
   beside it. Reverted.
2. **Second attempt: trim tile heights alone.** Helped (1046 → 954) but the
   columns still overshot, and trimming far enough to actually match would
   have meant shrinking the images the change was made to add.
3. **What shipped: `align-items: start` on `.showcase`,** so each column ends
   where its own content ends, plus a moderate trim of every tile. Ragged
   column bottoms are the board aesthetic anyway — the reference's own columns
   finish at different heights — and it keeps the form card correctly sized.
   Mosaic 864, form column ~640.

Trimmed with it: portrait 340 → 250, object 200 → 165, mark 132 → 112, stack
250 → 190, badge cap 300 → 228.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 375 /
  360 / 320 — `scrollWidth === viewport width` at every one, badge a constant
  228 across all wide widths.
- Rendered at 1440, 900 and 390.
- **No-JS check** with every `<script>` stripped: 9 tiles, none hidden
  (`opacity: 1; transform: none` on all), `column-count` still 2.
- **Image load check in the same pass**: all 10 `<img>` in the mosaic report
  `complete` with non-zero `naturalWidth` — no broken `src`.
- No console errors; no temp files.

### Known tradeoff, not a bug
On phones the mosaic stacks to one column and runs ~1570px. It sits *after*
the form there (`.showcase__main` has `order: -1`), so the reader reaches the
signup before any of it — the long tail is decorative and comes after the
conversion point. If it ever needs shortening, drop tiles at the ≤700
breakpoint rather than shrinking them further.

---

## 2026-08-24 (cont.) — Mosaic becomes two counter-scrolling image columns

Scope: `.mosaic` only. The badge circle and the logo/credential card were
removed on request and replaced with photographs, and the board now scrolls
itself — left column travelling up, right column travelling down.

### Two new assets, derived not repeated
`home-lunch.jpg` and `mumbai-rush.jpg` were the only two images in
`public/img/` never pulled into `new-WT`. Both are on-brief (a home-cooked
tiffin; the lunch run moving through Mumbai traffic), so they were added to
`generate-assets.mjs`'s `DERIVED` list as `legacy-lunch` / `legacy-rush` at the
same 3:4 / 1000px-edge spec as the other stills, and generated through the
existing pipeline rather than cropped by hand. Using a photo already on the
board a second time was the alternative and would have read as padding.

Board is now 11 photographs, no cards: 5 in the left column, 6 in the right.

### Architecture change
CSS `columns` masonry had to go — multi-column cannot animate its columns
independently. Each column is now its own flex track inside a fixed-height,
`overflow: hidden` window:

- **Each track holds its tiles twice.** The animation runs to exactly `-50%`
  (or `-50%` → `0` for the down column), so the second set is under the
  viewport at the moment the first wraps.
- **The duplicate set is `aria-hidden="true"` with empty `alt`s.** Verified:
  22 tiles, exactly 11 `aria-hidden`, exactly 11 images with a non-empty alt —
  every photograph announced once.
- **A `mask-image` gradient fades both ends**, so tiles enter and leave rather
  than being chopped at the window edge. `-webkit-` prefix first for Safari.
- **Hover and `:focus-within` pause both tracks**, so a reader can stop the
  board to look at something, and it stops for a keyboard user tabbing in.
- Durations differ per column (46s / 54s) because the tracks are different
  lengths — matching the seconds would make the shorter column visibly faster.
  Both land near ~34px/s.

### Two real bugs, both found by measuring rather than looking
1. **A 7px seam on every loop.** `n` tiles have `n-1` gaps between them, but
   the distance the track must travel to put set two exactly where set one was
   is `n/2` tiles **plus `n/2` gaps**. The track was one gap short, so
   `translateY(-50%)` undershot by half a gap and the loop jumped 7px each
   pass. Fixed with `padding-bottom` equal to the gap, which pads the track to
   `n` gaps and makes 50% land exactly on the seam. Probed directly —
   `tiles[half].top - tiles[0].top` versus `trackHeight / 2` — rather than
   inferred: seam error went 7px → **0** at both the 14px and 10px gap. The
   ≤700 block overrides the gap, so it overrides the padding too; a comment
   ties the two together.
2. **`prefers-reduced-motion` did not stop the marquee.** The override was
   written as `.mosaic__track { animation: none }` (specificity 0,1,0) but the
   rules setting the animation are `.mosaic__col--up .mosaic__track` and its
   `--down` twin (0,2,0), so the override silently lost. Caught by probing
   under `--force-prefers-reduced-motion`: `animationPlayState` was still
   `running`. Fixed by spelling out both selectors. **This is the third time
   this file has been bitten by a shorter selector losing to a longer one** —
   after `.tile__num` at the 900px breakpoint and the `.route__face`
   countdown override.

### Other consequences
- The reveal now fades the two **columns** in, not each tile: the tiles sit
  inside an animated track, so a per-tile transform would sit under the
  marquee's own transform and the stagger would be invisible behind the
  scroll anyway.
- Phones keep both columns rather than collapsing to one. The previous
  single-column stack ran ~1570px; the scrolling pair shows the same
  photographs in a 420px window.
- The mosaic is now a fixed-height window (660 desktop / 420 phone), so the
  section's height no longer moves when tiles are added or removed — the
  problem the previous entry solved with `align-items: start` cannot recur.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 375 /
  360 / 320 — `scrollWidth === viewport width` at every one.
- Seam error 0 at both gap sizes; all 22 images load (`complete`, non-zero
  `naturalWidth`); 11 announced / 11 hidden.
- Reduced motion: `animationName: none`, columns fully visible.
- No-JS: both columns visible, tracks still animating (the marquee is pure
  CSS and does not depend on the reveal script).
- Paused mid-cycle frames rendered at 1440, 700 and 390 to confirm the
  in-flight state, using a negative `animation-delay` plus
  `animation-play-state: paused`.
- No console errors; no dead selectors left behind; no temp files.

---

## 2026-08-24 (cont.) — "The run" section added from a supplied zip

Source: `~/Downloads/Ui-prompts/crav-takeaway.zip` — a self-contained replica
of a CRAV "Takeaway" section (mustard band, wavy divider, dashed flight route
with a scroll-driven plane, five city pins, separate mobile variant).

Placed between `#legacy` and `#waitlist`: heritage, then the journey, then the
signup.

### What was taken and what was not
**Taken — the mechanic and the structure:** the wavy divider bleeding the page
colour in, one dashed SVG path, a traveller placed along that path by scroll
progress via `getPointAtLength`, photo pins pegged at measured offsets, and the
under-768 swap to a stacked list. The section keeps the reference's own
`100 / 163` proportion and its route `viewBox`, because the five pin offsets
were measured against exactly that geometry — changing it means re-solving the
path and all five pins.

**Not taken, deliberately:**
- **Its palette and faces.** Mustard/beige plus Modak and Mouse Memoirs would
  have meant a fifth and sixth font and two new hues on a page whose whole
  system is Asar + Palanquin and four colours. The section is charcoal ground,
  off-white wave, brand-red eyebrow.
- **Its burger photography.** Wrong brand, and not licensed for MD. The five
  pins use real stills of the actual run instead — home kitchen, the carrier,
  the lid code, Mumbai rush, Perth — which also makes the route mean something
  rather than being five interchangeable cities.
- **The plane.** Replaced with the page's own dabba glyph via
  `<use href="#dabba-solid">`. A dabba is what actually travels this route.
- Its `build-artifact.py` (an artifact-inlining helper) and its runway
  scaffolding, both of which only existed to make the zip standalone.

### `cqw`, and one real bug it caused
The reference sizes every offset in `vw` because its section is full-bleed.
This one is an inset card like the rest of the page, so `vw` would drift from
the section's own box by the page padding. `container-type: inline-size` plus
`cqw` keeps the reference's numbers meaningful — 1cqw is 1% of *this section*,
which is what its measurements actually meant.

**The bug:** `height: 163cqw` on the section itself resolved against the
**viewport**, not the section — an element cannot be its own container query
container, so `cqw` fell back to the small viewport size. The section rendered
2347px tall (163% of 1440) while every pin inside it sized against 1400, adding
65px of dead space at the bottom. Fixed with `aspect-ratio: 100 / 163`, which
is self-referential by definition. Measured ratio went 1.68 → **1.63**, the
reference's own.

Also fixed: the headline wrapped to three lines in a 62cqw box at 8.5cqw and
ran into the lede. 8cqw in a 76cqw box gives the intended two lines —
`h2OverlapsLede: false` verified, not eyeballed.

### A long wrong turn worth recording
I spent several rounds convinced the traveller was not painting: pixel samples
where I expected it returned **zero** near-white pixels, an inlined copy of the
glyph changed nothing, and a magenta test circle inside the group also sampled
as absent while a lime circle appended directly to the route `<svg>` sampled
fine. I concluded cross-root `<use>` was broken and inlined the glyph.

**That conclusion was wrong.** Reading the element's actual transform showed
`translate(1519.98, 878.94)`, which maps to page (1231, 2599) — inside the
Home Kitchen pin's box, and pins are `z-index: 4` over the route. Every one of
my samples was at coordinates derived from a transform I had *injected*, which
the page's own `resize` handler had already overwritten before the capture. The
traveller was painting the whole time, behind a card. Sampling its real
`getBoundingClientRect` with pins dimmed found **219 near-white pixels**,
brightest (237, 236, 234).

The inline glyph was reverted to `<use href="#dabba-solid">` — DRY, one source
for the glyph, and it was never the problem. **The lesson: when verifying a
scroll-driven element, read the transform the page actually settled on. Do not
sample coordinates computed from a value you injected, on a page that has its
own resize/scroll handlers.** Pins passing behind cards is the reference's own
layering, kept.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 800 / 768 / 767 / 700 / 560 /
  390 / 375 / 360 / 320 — `scrollWidth === viewport width` at every one. The
  767 swap shows as docH jumping 4456 → 7467 as the route gives way to the list.
- Section ratio exactly 1.63; five pins at their measured offsets; path length
  8956 units; traveller samples correctly at p = 0, .25, .5, .75, 1.
- All 10 images load (`complete`, non-zero `naturalWidth`).
- **No-JS**: `run-ready` absent and 0 of 16 reveal targets hidden — everything
  legible without script.
- **Reduced motion** (`--force-prefers-reduced-motion`): `run-ready` never
  added, 0 hidden, traveller placed once and no scroll listener attached.
- Desktop/mobile variants swap correctly at 767; mobile list rendered and
  checked.
- No JS errors; markup balanced; no temp files.

---

## 2026-08-24 (cont.) — Run section: plane, grey ground, new pin imagery

Four changes to `#run`, all requested.

### The plane
`plane.webp` copied from the supplied zip into `new-WT/assets/` and swapped in
for the dabba glyph, at the reference's own `259 x 274` route units and
`x/y -130/-137` offsets — kept because the route geometry is unchanged, so its
centring numbers still hold. Renders ~223 x 211px at a 1400 container. Given a
`drop-shadow` so it reads as flying above the route rather than printed on it.
Ids and JS renamed `run-dabba` → `run-plane`.

**Provenance note:** this is third-party artwork from the supplied zip, not
generated for this project and not licensed to it. Same standing caveat as the
hero video. The `#dabba-solid` glyph is still used by the CTA and the card
badges and was not touched.

### Grey ground, and the text that had to follow it
`background: color-mix(in srgb, var(--brand-charcoal) 11%, var(--brand-white))`
= `#e9e9e9`. Still only the two brand neutrals, no fifth colour.

Flipping the ground meant flipping every piece of type in the section, and the
values were chosen off measured contrast rather than by eye:

| | on `#e9e9e9` |
|---|---|
| `--ink` (h2, pin labels) | 10.14:1 |
| `--ink-soft` (lede, mobile notes) | 5.77:1 |
| `--accent-ink` (eyebrow) | 5.31:1 |
| `--accent` — **rejected** for the eyebrow | 3.38:1, fails AA at 15px |

The route line went from off-white 22% to `rgba(55, 52, 53, 0.28)`, and the pin
card placeholder ground from white 8% to charcoal 6%.

### New pin imagery — Mumbai, food, Australia
Order is now **Mumbai → Biryani → Paneer tikka → Gulab jamun → Perth**, so the
route reads as the run leaving Mumbai with the food and landing in Australia.

Two images generated through the existing FAL pipeline (added to
`generate-assets.mjs`'s `IMAGES` so they are reproducible, not hand-fetched):
- **`run-mumbai`** — a dense Mumbai street at golden hour, iron balconies,
  overhead cables, black-and-yellow taxi.
- **`run-perth`** — the Perth skyline across the Swan River, gum trees in
  frame. Perth rather than a generic Australia shot because Perth is the city
  the brief names, and `hero.jpg` is already used twice on the page.

Both 3:4 at a 1000px edge, matching the other stills and the pin cards' crop.

### One bug, caught by rendering
Renaming the pin keys in the markup (`kitchen/carrier/code/rush` →
`mumbai/biryani/paneer/jamun`) left the **CSS still positioning the old
names**, so four of five pins had no `top`/`left`/`right` at all and piled up
in the section's top-left corner over the eyebrow — only `pin--perth`, whose
key was unchanged, landed correctly. Fixed by renaming the position rules, and
guarded with a check that every `pin--*` in the markup has a matching
positioned rule in the CSS (`without a position rule: none`).

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 767 / 700 / 560 / 390 /
  375 / 360 / 320 — `scrollWidth === viewport width` at every one.
- Computed values read back from the live page: ground `#e9e9e9`, h2
  `rgb(55,52,53)`, eyebrow `rgb(179,40,44)`, labels `rgb(55,52,53)`, route
  stroke `rgba(55,52,53,0.28)`, plane `href="assets/plane.webp"`, pin order as
  listed above.
- All 10 raster images in the section load; none broken.
- **No-JS**: `run-ready` absent, 0 of 16 reveal targets hidden.
- **Reduced motion**: `run-ready` never added, 0 hidden, no broken images.
- Mobile variant re-rendered at 390 and checked.
- No JS errors; no temp files.

---

## 2026-08-24 (cont.) — Run section: tightened, smaller heading, plane un-inverted

### The plane was flying backwards, belly up
`plane.webp`'s **nose is at the bottom of the artwork** — checked by rendering
the sprite on a contrasting ground rather than inferring it from ink-mass
measurements, which had been ambiguous. So its forward axis is already +90
degrees, and the reference's `rotate(ang + 90)` put it at `ang + 180`: exactly
reversed. Changed to `rotate(ang - 90)`. Confirmed at a tangent of 46 degrees
the nose now leads down-right along the route.

Worth noting the reference's `+90` was presumably right for *its* own plane
artwork; the same file evidently is not oriented the way that code assumed, so
this is a real difference, not a transcription slip.

### 434px of height removed, without touching the route
The route SVG was letterboxing: its viewBox ratio is 0.794, the section was
wider than that, and with the default `xMidYMid meet` that left **~260px of
dead band above and below the path** — most of the empty space in the section.
Setting `preserveAspectRatio="none"` makes the path fill the section instead,
so the same route now fits in **132cqw instead of 163cqw**: 1848px rather than
2282px at a 1400 container.

The trade is a ~5% vertical stretch on the path and the sprite (scale x 0.810
vs scale y 0.849) — invisible at this size. The plane's rotation is computed
from the user-space tangent, so a non-uniform render scale introduces at most
~1.4 degrees of angular error; not worth correcting.

Pin offsets were re-derived against the un-letterboxed route (each keeps its
fraction of the route's vertical run, shifted up by the removed letterbox):
50/64/80/105/130 → **30/46/62/84/106cqw**. The last one is held at 106 rather
than its proportional 115 so its 19cqw card and label clear the section's
bottom edge — `.run` has `overflow: hidden` and would otherwise crop it.

### Heading and copy
`h2` 8cqw → **6cqw** (112px → 84px at 1400), line-height 1 → 1.02, width 76 →
58cqw. Copy pulled up with it: eyebrow 9 → 6cqw, h2 12 → 8.5cqw, lede 31 →
22.5cqw. Mobile followed: h2 11 → 9.5cqw, `.mrun` gap 12 → 9cqw.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 767 / 700 / 560 / 390 /
  360 / 320 — `scrollWidth === viewport width` at every one.
- Section ratio measured 1.32; `h2` 84px at 1440, scaling to 68 / 60 / 52 / 46
  at 1180 / 1040 / 900 / 800 — and at every one of those widths
  `h2OverlapsLede: false` and `lastPinClipped: false`.
- Plane tangent and rotation read back from the live page; nose leads.
- **No-JS**: `run-ready` absent, 0 of 16 hidden, 0 broken images.
- **Reduced motion**: `run-ready` never added, 0 hidden, 0 broken.
- Mobile re-rendered at 390.
- No JS errors; no temp files.

One thing the probe reports as a false positive: `ledeOverlapsFirstPin: true`.
The two overlap on the vertical axis only — the lede ends at x 518 and the
Mumbai pin starts at x 1106, so there is no visual collision. The check
compares vertical ranges alone and would need horizontal ranges to be
meaningful here.

---

## 2026-08-24 (cont.) — On-load reveals, and the arrow becomes "Scroll to See"

### The trigger is set in <head>, not at the end of <body>
A `page-in` class on `<html>`, added by a tiny inline script in `<head>`. It has
to be there rather than in the deferred script block at the end of `<body>`,
or one un-animated frame paints before the class lands and the reveal starts
from a visible hero. No class means no animation, so JS-off and reduced-motion
both get the plain page — the same inversion the scroll reveals use.

### Banner: left-to-right fade
A moving `mask-image` on `.hero`, not a `clip-path`: the ask was a *fade* in
that direction and a clip edge is hard. The gradient image is 2.5x the hero's
width, opaque to 40% and transparent by 72%, so at `mask-position: 100%` the
element samples only the transparent tail and at `0%` only the opaque head —
animating between them sweeps one soft edge across. 1.1s.

Checked specifically that this does not fight the hero's existing carve:
`clip-path` still computes to `url("#hero-cut")` with the mask applied, and the
step in the bottom-right renders intact in both the mid and settled frames.

### Dish rail: right-to-left fade
Each card starts at `opacity: 0; translateX(34px)` and the delays run
*backwards* through the DOM — 0.55s on card 1 down to 0.15s on cards 6+ — so
the rightmost card on screen lands first and the leftmost last. Cards 4-6 sit
outside the viewport at rest, which is why theirs are the short delays.

**One interaction worth recording:** the initial `translateX(34px)` feeds
scroll-snap, because transformed overflow contributes to a scroll container's
scrollable area. During the animation `.rail__track` reports
`scrollLeft: 34`. Verified it is transient — with the animation forced
complete, `scrollLeft` is 0, the first card sits flush at offset 0 and its
transform is the identity matrix. No lasting offset, so no fix needed, but it
would have been easy to mistake for one.

### Arrow -> "Scroll to See", and a dead button fixed
`.card__jump` went from a 58px circle holding an arrow to a pill holding the
text (133 x 40 at desktop, 32px tall on phones). Its `svg` sizing rules, base
and at the 700 breakpoint, were removed rather than left dangling.

Two consequences that needed deciding rather than assuming:
- **It was `<a href="#legacy">` labelled "Read the Mumbai story".** A visible
  label has to match what the control does — "Scroll to See" pointing at a
  different section is a WCAG 2.5.3 (Label in Name) mismatch. So it is now a
  `<button>` that scrolls the rail, which is what the text promises. **Flagged
  to the user**, since it changes where the control goes.
- **`.rail__next` had no click handler at all** — it looked like a control and
  did nothing; the rail only moved by trackpad or touch, so it was
  keyboard-inaccessible. Both controls now share one handler. It measures the
  step from the first two cards rather than hardcoding it, so it stays correct
  at the 700px breakpoint where cards shrink 244 -> 172, and it wraps back to
  the start from the end instead of dead-ending. `behavior` drops to `auto`
  under reduced motion.

Verified by clicking both in-page: scrollLeft 34 -> 309 -> 584 (one 275px card
pitch per press), and from the end it returns to the start.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 360 /
  320 — `scrollWidth === viewport width` at every one.
- Mid-animation and settled frames rendered via negative `animation-delay` +
  `animation-play-state: paused`: the hero is opaque left and fading right
  mid-wipe, and the settled frame has no residual mask.
- **No-JS**: `page-in` absent, hero `animation: none` and `mask-image: none`,
  all cards `animation: none` at `opacity: 1`.
- **Reduced motion**: identical — the class is never added.
- No JS errors; no temp files.

---

## 2026-08-24 (cont.) — "Scroll to See" becomes a circular ring badge

Replaced the pill with the supplied reference's design: a round badge with the
label curved around its own ring, upright across the top and inverted across
the bottom, with a red dot in the gap at each side.

### How the ring is built
One circular `<path>` starting at 9 o'clock and running clockwise, so 25% of
its length is 12 o'clock and 75% is 6 o'clock. Two `<text><textPath>` runs
anchored `middle` at those two offsets put one label centred on top and one on
the bottom, and the gaps then land exactly where the two dots sit. The bottom
run reads inverted — that is simply what a single circular path does, and it is
what the reference shows.

Palette is unchanged: `--accent-soft` fill, a full `--accent` ring (the
reference's outline is the strong red, not the hairline the old circle used),
`--accent-ink` text, `--accent` dots.

### The phone size was a real trap
The ring text is sized in viewBox units, so it scales with the badge. Dropping
the badge from 92px to the 68px the old circle used would have rendered the
label at **~5.8px** — illegible. The font goes *up* in viewBox units on phones
to compensate: 74px badge with 11.5-unit text gives **8.5px on screen, larger
than the desktop's 7.9px**.

Measured the arc fit rather than trusting it, since a too-long run on a
`textPath` silently runs off the end of the path instead of wrapping:

| | badge | ring text | run width | half-arc | used |
|---|---|---|---|---|---|
| desktop | 92px | 7.9px | 71px | 110px | 65% |
| phone | 74px | 8.5px | 71px | 88px | 80% |

`overflowsArc: false` at both.

### Accessibility
The SVG is `aria-hidden` and the button carries
`aria-label="Scroll to see more dishes"` — which contains the visible "Scroll
to see", so WCAG 2.5.3 (Label in Name) still holds. Focus ring kept, offset
raised to 3px for the round shape. The `.card__jump svg` sizing rule from the
original arrow was removed, not left dangling.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 360 /
  320 — `scrollWidth === viewport width` at every one.
- Badge still drives the rail: scrollLeft 34 -> 309 -> 584 (one card pitch per
  press), and wraps to the start from the end.
- Computed values read back: `border-radius: 50%`, bg `rgb(253,236,236)`,
  ring `rgb(237,50,55)`, text `rgb(179,40,44)`, dots `rgb(237,50,55)`, two text
  runs both reading "Scroll to see".
- Rendered and zoomed at desktop and phone.
- No JS errors; no dead rules; no temp files.

---

## 2026-08-24 (cont.) — Badge sizing per request, ring rotation, stat counters

### Badge: requested values, and the text had to be re-fitted
`.card__jump` set to the supplied CSS — `top: 0; right: -5px; width/height: 72px`.

That reintroduced the legibility problem solved a moment earlier for phones:
**the ring text is sized in viewBox units, so it scales with the badge.** At
72px the 8.6-unit font rendered ~6.2px. Bumped to 11.5 units (~8.3px at 72px)
and letter-spacing dropped 0.1em -> 0.06em to keep the run off the end of the
path. Measured: run 69px in an 86px half-arc, **81% used, no overflow**.

The phone override that had set its own 74px + font is gone — 72px is already
at the floor where the curved run stays legible, so shrinking it for the
narrower card would only make it unreadable. Only the inset differs there now.

### Ring rotation
`.card__jump-ring` spins 18s linear infinite — the SVG turns, so text and both
dots move together while the button's border stays put. Paused on `:hover` and
`:focus-visible` so the label can be read before clicking.

Reduced motion gets its own explicit stop, written as
`.card__jump .card__jump-ring` (two classes) rather than a bare
`.card__jump-ring`, which would be the same specificity as the rule setting the
animation and would rely purely on source order. **Fourth time this file has
needed that care.** Verified under `--force-prefers-reduced-motion`:
`animationName: none`.

Rotation confirmed by capturing three paused frames at `animation-delay` 0s /
-3s / -6s — 0, 60 and 120 degrees, text and dots turning together.

### Stat counters (135 / 5,000+ / 200k+)
There was no count animation at all. Added one, triggered on arrival.

The numerals are wrapped in `[data-count]` spans that **keep their final value
in the markup**, so a reader without JS, or with reduced motion, sees the real
figures — both verified, both return `135 / 5,000 / 200k`.

`easeOutCubic` over 1.4s: most of the distance early, then it settles. A linear
count reads like a loading spinner. `en-AU` formatting gives the "5,000" comma
the markup already ships, and `data-suffix="k"` handles 200k. `.stats__n`
already carried `font-variant-numeric: tabular-nums`, so the figures do not
jitter in width while counting.

**One fragility caught and fixed mid-build:** the first version zeroed all three
cells at script time, so any path where the observer or rAF never delivered
would leave the reader looking at `0 / 0 / 0k` — worse than no animation.
Zeroing now happens *inside* the intersection callback, one frame before the
count starts, plus a `setTimeout` that lands the real figure if rAF still never
ticks.

### Reveal timing: load -> arrival
`revealOnScroll`'s observer went from `{ threshold: 0.2 }` to
`{ threshold: 0.15, rootMargin: "0px 0px -20% 0px" }`. A bare threshold cannot
express "on arrival": on a tall window 20% of a section can already be on
screen at page load, so the wipes fired immediately and read as load
animations. The negative bottom margin pulls the trigger line 20% up from the
viewport bottom instead.

### Verification note worth keeping
The counters read `0 / 0 / 0k` in both the browser pane and the first headless
attempt, which looked exactly like a broken animation. It was the environment:
`document.hidden` was `true` in the pane (which suspends IntersectionObserver
*and* rAF — already on file for this project), and virtual time does not pace
rAF against `setTimeout`. Proven working instead by loading at a 3000px window
height so `.stats` is in view at load and the observer's *first* delivery
already intersects — no scroll event needed. Caught it mid-count at
`78 / 2,891 / 116k` (all three at the same ~58% progress) and settled at
`135 / 5,000 / 200k`.

### Verified
- Badge: 72x72 at `top: 0 / right: -5px`, spin `jump-spin 18s linear`, ring text
  8.3px, 81% of arc, `overflowsArc: false`.
- Rail still driven by the badge: scrollLeft 34 -> 309 -> 584, wraps from the end.
- Counters: mid-count and settled values both captured; no-JS and reduced-motion
  both keep the real figures.
- Both inline script blocks pass `node --check`.
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 700 / 560 / 390 / 360 / 320.
- No JS errors; no temp files.

---

## 2026-08-24 (cont.) — Run section: gap, plane start, plane-driven pins, bottom clip

### 1. Gap above the section
`.run { margin-top: 96px -> 24px }`. The band above already ends on 96px of its
own `padding-bottom`, so a matching top margin here read as ~192px of dead
white. Visual gap is now 120px (96 + 24).

### 2. The plane no longer starts before the section is readable
The old mapping spread progress 0..1 over `section.height + innerHeight`, so
the whole viewport height was consumed *before* the section filled the screen —
roughly a third of the flight was spent while the section was still arriving,
which is why the plane was already well along the route the moment it appeared.

Remapped: progress 0 when the section's top crosses **85% of the viewport**, 1
when its bottom clears **15% from the top**, so the entire run happens while
the section is on screen. Measured: progress is `0` both as the section first
appears and at the arrival line, then `0.372` after a further 900px of scroll.

### 3. Pins pop as the plane reaches them
Pins came off the shared IntersectionObserver — the query is now
`.run-rev:not(.pin)` — and are driven by the plane's own progress instead.

Each pin's trigger point is found by **nearest point on the path**, not by
hand: sample the route, convert to the section's pixels (with
`preserveAspectRatio="none"` that is a straight proportion of the viewBox), and
take the closest sample to the pin's centre. **2D, not y alone** — the route
doubles back on itself, so matching on y would pair a pin with the wrong
crossing. Re-measured on resize.

Resulting trigger points are monotonic, so they fire in reading order:
Mumbai 0.16, Biryani 0.27, Paneer tikka 0.53, Gulab jamun 0.71, Perth 0.94.

Their transition also changed from the group's 0.7s ease to a shorter
overshooting curve (`scale(0.78)` -> 1 on `cubic-bezier(0.34, 1.56, 0.64, 1)`),
since they now land one at a time — a pop reads as arrival where a slow ease
reads as a fade.

### 4. The sprite was being cut off at the bottom
Measured the path rather than guessing: its bbox is `x -20..1929`,
`y -139..2234` against a `1728 x 2176` viewBox — it deliberately runs off all
four edges (dashes bleeding off is the reference's look). The **sprite** was the
problem: 274 units tall centred on the point, so at the path's lowest point its
bottom reached 2371, well past the section's edge.

Only 234 of 401 samples were sprite-safe and the longest contiguous safe run
was just p 0.405..0.733, so clamping progress to a safe window was not an
option — it would have cut the flight to a third of the route.

Fixed by extending the **viewBox height to 2400** (2371 now clears), leaving the
left/right bleed alone. Because `preserveAspectRatio="none"` maps the viewBox
onto the section proportionally, every path point now renders 2176/2400 =
0.9067 higher, so all five pin offsets were scaled by the same factor
(30/46/62/84/106 -> 27.2/41.7/56.2/76.2/96.1cqw) to stay on the line.

Verified geometrically across 400 samples: the sprite's lowest point is 1826px
in an 1848px section — `clipsBottom: false`, 22px headroom.

### Verified
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 767 / 700 / 560 / 390 /
  360 / 320 — `scrollWidth === viewport width` at every one.
- Pin-to-route distances 27-162px; trigger points monotonic.
- **No-JS**: `run-ready` absent, 0 of 5 pins hidden. This matters more than
  before — the pins now depend on the plane script for their reveal, so the
  hidden state must not exist without it.
- **Reduced motion**: same, 0 of 5 hidden.
- Both inline script blocks pass `node --check`; no JS errors; no temp files.

---

## 2026-08-24 — The run section holds until its flight finishes

> *"jab tak the run section ka animation khatam nahi hota tab tak section aage
> badhna nahi chahiye"* — plus a hero leading change.

### 1. The section is pinned for the last third of the flight
`#run` is now wrapped in `.run-pin`, and the section sticks to the bottom of the
viewport for one more viewport of scroll while the dabba finishes the route.
Progress reaches 1 **exactly** as the pin releases, so the page only moves on
after the flight has landed.

Sticky, not a scroll lock. Nothing calls `preventDefault`: the scrollbar,
keyboard and trackpad all keep working — only the section stays put.

Three things had to be measured rather than assumed, and the first two guesses
were both wrong:

- **`bottom: 0` does not pin an over-tall element at the viewport bottom.**
  `bottom` is the *reverse-sticky* constraint: it shifts a box **up** toward the
  viewport bottom. This section sits at the top of its wrapper with no upward
  room, so it never engaged at all — measured across 16 scroll positions, the
  section's rect moved linearly the whole way. A **negative `top`** is the
  constraint with room to move.
- **`padding-bottom` on the wrapper buys no hold whatsoever.** A sticky box is
  constrained to its containing block's **content** box, so padding is invisible
  to it. Measured both directions: zero hold. The pin distance has to be a real
  element — hence `.run-pin__hold`.
- The offset needs the section's own height, and that height is `132%` of its
  own width — which the section cannot express about itself, since **an element
  is never its own query container** (the same trap that made `height: 163cqw`
  resolve against the viewport). `.run-pin` is therefore a container, and the
  offset is `calc(100svh - 132cqw)` resolved against it. Verified: computed
  `top: -928.2px` at 1440x900, which is exactly `900 - 1828`.

Gated on `(min-width: 768px) and (min-aspect-ratio: 4 / 5)`. Under 768 the
desktop section is `display: none`, so the hold would be a viewport of blank
page; and the pin only reads right while the section is *taller* than the
viewport, which the 4/5 gate guarantees (below it the offset goes positive and
would pin the section on the way **in**).

### 2. Progress had a live inconsistency, and it swallowed Perth
Moving the flight's start to 60% of the viewport (see 3) left `travel` still
carrying the previous 0.85's remainder. Two constants that had to agree did not,
and progress topped out at **0.914** when the pin released — so the last 9% of
the route, **Perth's pin included**, simply never ran. Both lines now read one
`START`.

This is the bug the runtime pass caught and the geometry pass could not: the
geometry probe carried a copy of the same formula, so it agreed with the page
about a number they were both getting wrong.

### 3. The flight starts at 60%, not 85%
At 85% the section was still low on screen while the route's first dip was
already being flown, and the dabba **dropped ~96px below the fold and came
back**. Starting later keeps the whole flight on screen, and it also brings the
first two pins into view before they pop — at 85% Mumbai's card popped 180px
below the fold, so the reader only ever found it already there.

Pops also gained a second condition: reached by the dabba **and** on screen.
Geometry alone is enough at desktop heights, but on a short viewport the lower
pins are reached while still below the fold. The guard can only ever delay a
pop — a pin scrolled clean past sits above the fold, which passes.

### 4. Hero title leading
`.hero__title` `line-height` 100px -> **70px**, solid against its own 70px size,
so the two lines close up. `margin: 0`, `font-size: 70px` and `#fff` were
already in place. The block is 140px tall instead of 200px; two lines, no
overflow. Left alone: the `1180` and `900` breakpoints still carry the looser
leading they were tuned to (56/78 and a clamp) — say the word to match them.

### Verified
Real Chrome at 1440x900, scrolled in 21 steps:
- Sticky computed `top: -928.2px`; hold `900px`; section rect frozen at
  `-928` for the last **36%** of the scroll.
- At the release point: `section.bottom === track.bottom === innerHeight`
  (900) — progress 1 and the release are the same instant.
- Dabba at p=1 sits at route y `2043.6`; the path's end point is `2043`.
- All **5** pins popped before release (0.20 / 0.30 / 0.55 / 0.75 / 0.95),
  none of them off-screen.
- The dabba's bounding box never leaves the viewport at any of the 21 steps.
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 767 / 700 / 560 / 414 /
  390 / 360 / 320 — no horizontal overflow at any width.
- The 767 boundary: hold `0px`, `position: relative`, desktop section
  `display: none` — no dead scroll on phones.
- **Reduced motion** (`--force-prefers-reduced-motion`): `is-pinned` absent,
  hold `0px`, `position: relative`, track 1852px (= section + margin, no hold),
  and 0 of 5 pins hidden.
- **No JS**: none of `is-pinned` / `run-ready` / `is-in` exists in the markup,
  and no unguarded rule hides a pin or grows the hold — so the pin and the
  hidden states cannot exist without the script that drives them.
- Inline scripts pass `node --check`; temp probe files removed.

---

## 2026-08-24 — Hero CTA glides to the waitlist; Vercel build fixed

### 1. The CTA glides instead of jumping
The hero button was already a real anchor (`<a class="cta" href="#waitlist">`),
so this needed no click handler at all — one declaration on `html`:

```css
html { scroll-behavior: smooth; }
```

`#waitlist` also gained `scroll-margin-top: var(--page-pad)`, so it lands with
the page's own 20px of padding above it rather than flush against the viewport
edge. Verified: the click lands at `4353`, leaving exactly `20px` above the
section.

Two things this deliberately does *not* touch:

- **The dish rail.** `scroll-behavior` is not an inherited property, so the
  rail's horizontal scroller stays `auto` (measured) — and it passes its own
  `behavior` per `scrollBy` call anyway, with its own reduced-motion guard.
- **Keyboard and no-JS behaviour.** It is still an anchor, so it works with
  either off; the glide is purely additive.

Under `prefers-reduced-motion: reduce` the root goes back to `auto` — measured
`smooth` normally, `auto` with `--force-prefers-reduced-motion`. Chrome does not
switch smooth scrolling off by itself, and a 4300px glide is exactly the kind of
motion that setting is about.

**Why the glide itself is not in the verification list:** neither harness can
animate a scroll. The Browser pane's document reports
`visibilityState: "hidden"`, so Chrome produces no animation frames for it —
`behavior: "instant"` scrolls fine there while `"smooth"` moves **0px in 3.1s**;
and headless under `--virtual-time-budget` stalls at **9px** (one frame, then
virtual time races the compositor). So the declaration, the target, the landing
position and the reduced-motion override are all measured; the interpolation
between them is the browser's.

Worth knowing: the glide is ~4300px and passes straight through the run
section's pin, so the dabba's flight and all five pin pops happen during it.
Arriving at the waitlist means everything behind it is already revealed.

### 2. Vercel build failure — `FAL_KEY` required at build time
```
Error: Failed to collect configuration for /api/generate/image
  [cause]: Error: FAL_KEY is missing. Add it to .env.local
    at module evaluation (src/lib/fal.ts:6:9)
```

`src/lib/fal.ts` checked the key and called `fal.config()` at **module scope**.
Next imports every route module during `next build` to collect its exported
config (`runtime`, `maxDuration`), so the throw ran at build time and took the
whole deploy with it — on any host without the variable.

Requiring the key to *build* was wrong regardless of the host: nothing the site
serves calls FAL. Every image and the hero clip are generated ahead of time by
`new-WT/scripts/generate-assets.mjs` and committed. Only a live request to a
generate route needs credentials.

Fixed by making the client lazy — `getFal()` resolves the key and configures on
first use, and both generate routes call it inside their existing `try`, so a
missing key is now that request's error instead of a failed build. `MODELS` is
untouched and still importable anywhere.

**Verified by reproducing Vercel's environment exactly**: moved `.env.local`
aside, ran `npm run build` with `FAL_KEY` unset. Compiles, type-checks, and
lists both routes as dynamic functions (`ƒ /api/generate/image`,
`ƒ /api/generate/video`). `.env.local` restored and confirmed present.

Note this does not change what the routes need at runtime — if you ever want the
generate endpoints live on Vercel, `FAL_KEY` still has to be set there. It
should be a **rotated** key: the current one was pasted into plaintext chat.

---

## 2026-08-25 — Four run-section pins swapped for supplied artwork

Request: swap the run section's images for five files in
`~/Downloads/Archive (1)/` (Mumbai, Perth, Biryani, Paneer Tikka, Gulab Jamun
— all 4500x4500 square PNGs).

**One was unusable as supplied.** `Gulab Jamun.png` carries a repeating
`pngtree` watermark tiled across the entire frame (confirmed at full zoom on
both the bowl and the jamuns) — an unlicensed stock-site preview download, not
a clean asset. The other four were checked the same way and are clean. Flagged
to the user; they chose to swap the four clean ones and leave the Gulab jamun
pin on its current photo (`dish-6.jpg`) until a licensed replacement exists.

**Placement verified before touching anything.** Each PNG's alpha content
bounding box was measured (`PIL.Image.getbbox()`): all four are centered
within ~10px of the 4500x4500 canvas centre, with 240-340px of transparent
margin on every side even after `object-fit: cover` crops the square down to
the pin card's 16:19 aspect ratio. Nothing gets clipped — confirmed rather than
assumed, the same discipline this project has used for every crop decision.

Resized to 1000px (from 1.1-2.3MB down to 260-520KB each, still ample
resolution for the ~230px card at retina) and saved as new files —
`run-mumbai.png`, `run-biryani.png`, `run-paneer.png`, `run-perth.png` — rather
than overwriting `dish-2.jpg`/`dish-4.jpg`, which the waitlist mosaic also
uses for different photos of the same two dishes. The string-replace that
wired them in was scoped by including `loading="lazy"` in the match target;
without it, the first attempt matched 4 occurrences of the biryani/paneer
`src`+`alt` pair instead of the intended 2 (the mosaic reuses the identical
alt text), which would have silently repointed the mosaic's own tiles.

Updated both the desktop pin list and the mobile `<ol class="mrun">` list —
same five pins, same content, both variants of one section.

**Result is a visible, real inconsistency, left in rather than hidden:** the
four sticker PNGs float on the card's pale placeholder background with visible
margin (die-cut, not full-bleed), while the Gulab jamun pin is still a
full-bleed photo with none. That is what mixing sticker artwork with
photography in the same row actually looks like — not a defect to paper over
by cropping the stickers tighter than their own art intends.

### Verified
- All four new images load (`naturalWidth > 0`) at their new paths; Jamun
  pin still resolves to `dish-6.jpg`.
- Mosaic's `dish-2.jpg`/`dish-4.jpg` — both the real tiles and their
  marquee-loop duplicates — untouched: re-grepped after the edit.
- Headless screenshot at 1440px: all five pins render in the correct
  position along the route, correctly labelled, no clipping on any of the
  four die-cut images.
- The Browser pane's `document.hidden: true` (a recurring quirk this
  session) froze both smooth-scroll and the live screenshot compositor
  during this check; DOM state (`getBoundingClientRect`, computed opacity,
  `currentSrc`) was read directly instead of trusting the frozen frame, then
  cross-checked against a headless Chrome screenshot for the actual visual.
- No temp probe files left in the working tree.

Licensing on the four kept images is unconfirmed — the watermark on the
excluded fifth suggests the same stock source, flagged the same way as
`plane.webp` and the hero video.

---

## 2026-08-25 — Supplied copy placed; run pins finished; footer gains Stay Connected

Copy was supplied as five labelled blocks with the instruction to place them in
existing sections and create none. Mapping used:

| Supplied block | Landed in |
|---|---|
| Main Section | `.hero` — `h1` + `.hero__sub` |
| Creative Message | `.run` `h2`, both desktop and the phone list |
| Pre-Launch Message | `.showcase#waitlist` — `h2` + `.lede` (CTA already read "Join The Waitlist") |
| Stay Connected | `.foot` — new `.foot__social` block |
| Contact | `.foot` — `.foot__meta`, email was already correct |

`.intro` was left alone: nothing in the supplied copy replaces it and it does
not contradict the new headings.

### The run heading needed a measured fix, twice
"The Dabba Story Continues." is 10 characters longer than the line the box was
tuned for. At the then-current 6cqw it needed **70.1cqw** against a `width:
58cqw`, and both lines wrapped — the heading rendered at **four lines**, not
two. Widened to 72cqw (measured: clears the Mumbai pin, whose left edge is at
79cqw, and they share no vertical band anyway) rather than shrinking type that
is sized to Asar's cap height for a documented reason.

The size was then set to **4cqw** by request, which gave the width back: at
4cqw the long line needs 46.7cqw, so `width` returned to 58cqw with ~24% slack
— enough that a fallback serif still sets both lines flat if Asar fails to
load. Verified 2 lines at every desktop width.

**Consequence worth knowing:** the `.lede` sits at a fixed `top: 22.5cqw`, so
the shorter heading opened the gap between them from ~25px to **81px**. Left as
measured rather than silently re-spacing a section whose spacing is being
hand-tuned.

### `.run__copy` top margin
`margin-top: 50px`, scoped to `.run--desktop .run__copy`. The box is `inset: 0`
here, so with `top` and `bottom` both set the margin resolves by shrinking the
box and carrying every absolutely-positioned child down with it — measured
exactly 50px. Scoped because the phone variant makes the same element
`position: static` with its own `margin-top: 22cqw`.

### Pins finished, card background removed
A replacement Gulab jamun image was supplied to replace the watermarked one;
checked at full zoom first, clean, installed as `run-jamun.png`. All five pins
are now die-cut stickers, so `.pin__card`'s background came off and the art
sits on the section's grey.

`object-fit: cover` was kept over `contain`: cover crops 7.9% per side while
every sticker holds ≥13% transparent margin there, so nothing is clipped and
the art renders at the taller 19cqw scale.

**Open, deliberately not fixed:** each PNG's transparent top/bottom margin now
sits inside an invisible box, so a `pin__label` reads ~60px clear of the art it
labels. Trimming the PNGs to their content bbox fixes it and scales the art up
~1.6x — a taste call, so it was flagged rather than done.

### Footer social links — what was and was not shipped
Four URLs were supplied. Checked all of them rather than pasting them in:

- Instagram `mumbai_dabbawala` — **200**, shipped as given.
- LinkedIn `company/mumbai-dabbawala` — **200**, shipped as given.
- Facebook `MumbaiDabbawala` — **400**, which is Facebook refusing a
  non-browser request rather than a dead page. Inconclusive; shipped as given.
- Twitter `mumbaidabb**e**wala` — **404 on both twitter.com and x.com.** The
  same brand name spelled `mumbaidabbawala` returns **200** on both, so the
  supplied URL is a typo. Shipped the corrected handle as `x.com`, flagged.

**TikTok and YouTube are absent.** The supplied copy lists both, but no URL was
given for either. `@mumbaidabbawala` happens to return 200 on both platforms —
that is *not* evidence the accounts are this brand's, and both services soft-404
with a 200, so neither was wired. Guessing a handle risks pointing visitors at
someone else's account.

Also worth confirming: every supplied handle is the India-based parent
organisation (`in.linkedin.com`, `mumbai_dabbawala`), not a Perth account.

The brief's `✉️` is an inline SVG envelope, not the emoji: every other icon on
this page is drawn that way, and an emoji would be the only one on the page,
rendering differently on each platform.

### Verified
- Every changed heading holds its intended 2 lines at 1440: hero title, hero
  sub, run `h2`, waitlist `h2`.
- Overflow sweep at 1440 / 1180 / 1040 / 900 / 768 / 767 / 700 / 560 / 414 /
  390 / 360 / 320 — no horizontal overflow at any width.
- The new `.hero__sub` `<br>` is hidden at ≤900 and the text reads
  "legacy. Now," **with the space intact** — the word-fusion trap this file has
  hit before, checked rather than assumed.
- Footer: 4 links present at every width, row → column at ≤700, envelope SVG
  renders, email text correct.
- `.pin__card` computed background is `rgba(0, 0, 0, 0)`; jamun pin resolves to
  `run-jamun.png`; mosaic's `dish-6.jpg` untouched.
- Inline scripts pass `node --check`; temp probe files removed.

---

## 2026-08-25 — Run pins lose their labels and grow; footer socials become icons

### Desktop pin labels removed, cards up 25%
Annotated request: drop the label text from the run route and enlarge the art.

- The five `<p class="pin__label">` were removed from the **desktop** pins only.
  The phone list keeps its five — there a label heads a list item that also
  carries a `.mrun__note`, so it is doing real work, whereas on the route it
  was floating ~60px clear of its own sticker.
- **Nothing is lost to a screen reader**: every sticker's `alt` already names
  its subject ("The Gateway of India in Mumbai…", "A bowl of gulab jamun…"),
  and no JS referenced `.pin__label`. Checked before deleting.
- `.pin__card` 16 x 19cqw -> **20 x 23.75cqw** (222x263 -> 277x329px at a 1385
  section). The 16:19 ratio is held on purpose so `cover` keeps cropping the
  same 7.9% per side that each sticker's transparent margin absorbs.

**A string-replace trap worth remembering:** removing the labels by matching
`'          <p class="pin__label">Mumbai</p>'` (10-space indent) hit **two**
occurrences, not one — the phone list's 12-space line *contains* the 10-space
string as a substring, so a naive `str.count`/`replace` would have stripped the
phone headings too. Fixed by comparing whole lines for equality instead.

### Footer socials are now brand icons
The four text links became icon-only links. Because the visible name is gone and
an `<svg>` is not an accessible name, **each anchor carries an `aria-label`**
("Mumbai Dabbawala on Instagram") with `aria-hidden="true"` on the mark. Hit
area is 38px around a 20px icon — an icon-only control needs more than its ink.
Hover/focus is an `--accent-soft` tint rather than an underline, since there is
no text left to underline.

The marks are inline SVG in `currentColor`, so they inherit the footer's red and
need no image assets. Verified by rendering, not by trusting the path data: each
`getBBox()` fills its viewBox, and a 5x crop confirms all four read as the real
marks (Instagram camera, Facebook f, LinkedIn in, X).

### Verified
- Desktop `.pin__label` count is **0** at every width; phone list still **5**.
- No pin is cropped by the section's `overflow: hidden` at any of
  1440 / 1180 / 1040 / 900 / 768 / 767 / 700 / 560 / 390 / 320, and no pin
  overlaps another (checked pairwise: Perth's bottom lands at 119.8cqw in a
  132cqw section).
- No horizontal overflow at any of those widths.
- All four footer links keep their correct hrefs and have zero visible text.
- Inline scripts pass `node --check`; temp probe files removed.

---

## 2026-08-25 — Rail drag, a sixth pin, and a reversible reveal

### Grab cursor on the dish rail — plus the drag it implies
Asked for a grab cursor on the rail. The rail had **no drag-scroll at all**
(trackpad, touch and the arrow button only), so the cursor alone would have been
a false affordance — it would advertise a grab that does nothing. Added both.

Three things it turns on:
- **`scroll-snap-type: none` while dragging.** With `x mandatory` the browser
  re-snaps after every `scrollLeft` write, so pointer and rail fight each other
  and the drag feels stuck. Restoring snap on release is also what settles the
  rail neatly onto a card.
- **`dragstart` prevented.** The card photos are natively draggable and that
  fires before any distance threshold could, taking the pointer away mid-grab.
- **Mouse only** (`e.pointerType !== "mouse"` bails). Touch already has native
  momentum scrolling; hijacking it would make the rail worse on a phone.
  Verified: a synthetic touch sequence starts no drag and moves nothing.

**A bug I wrote and then caught.** The first version suppressed the click that
closes a drag by re-checking the drag distance at click time. That variable was
never reset on a press that *returns early* — which is every press on the ring
badge or arrow — so after one drag the badge was **permanently dead**. Caught it
because the test asserted the badge still scrolls the rail and got `0`. Now the
suppression is decided at `pointerup`, consumed once, and cleared at the top of
every `pointerdown` before any early return. Re-verified all five cases: drag
works, the closing click is eaten, a later badge click fires, it scrolls the rail
275px (one card), and a press with no movement suppresses nothing.

### The pin reveal now runs backwards too
Scrolling back up un-pops each pin as the dabba retreats past it. `passStops`
went from one-shot (`done`) to a bidirectional on/off check; the CSS transition
already ran both ways, so no new declarations. Walked the section down and back
up in the browser: pops accumulate mumbai -> biryani -> paneer -> jamun ->
pulav -> perth, and un-pop in exactly that reverse order back to none.

### A sixth pin, between Gulab jamun and Perth
Placed by **measuring the route, not by eye**: the path runs through (13.4,
120.6) at p 0.808 and (23.6, 122.4) at p 0.828, so a card centred on (19, 114)
sits ~7cqw above the line — the same slightly-above offset jamun (5cqw) and
Perth (11cqw) already use. Resulting trigger progress is **0.817**, which keeps
all six monotonic (0.160 / 0.268 / 0.525 / 0.700 / 0.817 / 0.933) so they fire
in reading order. No pin overlaps another and none is clipped; the new one's
bottom lands at 125.8cqw in a 132cqw section. Added to the phone list in the
same slot, where that variant still uses labels and notes.

### The supplied image needed rebuilding twice
It arrived as `pulav.jpeg` — **a transparent PNG flattened onto its own
checkerboard**, with the grey/white checker baked into the pixels. Dropped in
as-is it would have shown a checkerboard rectangle.

1. **Background removed by flood-filling inward from the border**, not by a
   luminance threshold. The dish contains light rice grains and rim highlights
   that a threshold would have punched holes through; only background connected
   to an edge is eligible.
2. **Then it still looked wrong on the page** — flagged as "fix this image". The
   other five carry a white die-cut sticker edge; measured them (20-26px white
   run at a 1000px canvas) against this one's **0**. Two traps generating it:
   PIL's `MaxFilter` is a *square* kernel, so dilating the scattered flying rice
   turned every speck into a white box (fixed by blurring and re-thresholding to
   round the corners); and outlining every speck merged them into a white cloud
   above the bowl, so only the **largest connected component** is outlined and
   the specks stay bare. Final content is 69% of canvas — matching biryani and
   mumbai, and comfortably inside what `object-fit: cover` crops.

Licensing on it is unconfirmed, the same standing caveat as the other stickers.

### Verified
- Six pins on the route, six items in the phone list.
- Triggers monotonic; no overlaps; nothing clipped at 1440.
- Reveal symmetric down and up (walked 10 steps each way in the browser).
- Rail: drag moves it 1:1, cursor `grab` -> `grabbing` -> `grab`, snap
  `x mandatory` -> `none` -> `x mandatory`, touch untouched, badge still live.
- `run-pulav.png` loads at 1000x1000, 602KB.
- No horizontal overflow; inline scripts pass `node --check`; temp files removed.

---

## 2026-08-25 — TikTok and YouTube marks added as placeholders

Both were requested with "link baadme deti hu" — icon now, URL later.

Added as **`<span>`s, not `<a>`s**. An anchor with no destination is a dead
control, and this page is live. Each renders its mark at `opacity: .42` with
`cursor: default` and `aria-hidden="true"`, so the row reads as four working
icons plus two visibly pending ones — not six identical links where two do
nothing. Activation is a one-line swap, spelled out in a comment beside each.

TikTok verification stayed inconclusive and is worth recording: all three
candidate handles (`@mumbaidabbawala`, `@mumbai_dabbawala`,
`@mumbaidabbawala.official`) return a byte-identical ~106KB generic shell with
no `uniqueId`, `nickname` or `followerCount` in it. Identical responses for
three *different* handles is proof of bot-blocking, not of existence — which is
exactly why no URL was guessed for it.

YouTube's glyph needs `fill-rule="evenodd"` so the play triangle knocks out of
the rounded rect instead of filling over it. Verified by rendering, not by
trusting the path.

### Verified
- Six `<li>` in `.foot__links`: 4 links (opacity 1, `cursor: pointer`) and
  2 pending (opacity 0.42, `cursor: default`), in the brief's own order.
- Both new glyphs have sane `getBBox()` ink and a 5x crop confirms they read as
  the real TikTok note and YouTube play button.
- Inline scripts pass `node --check`; temp files removed.

---

## 2026-08-26 — 20 real network photographs into the waitlist mosaic

Twenty documentary photographs of the organisation (uniformed carriers with
tiffin crates, visitor groups, the exhibition room, station scenes) were
supplied. They were first requested for the **run section**; that was walked
back after I flagged the mismatch — the route is six hand-placed die-cut
sticker pins in a fixed-height box, and 20 rectangular photos neither fit it
(9 of 20 generated positions overlapped where the path doubles back) nor match
the treatment. The mosaic is the section already built for many photographs.

- **47.7MB of PNG became 1.3MB of JPEG** (65KB average). Each keeps its own
  aspect at a 600px long edge rather than being pre-cropped square — tiles are
  279px wide and `object-fit: cover` does the cropping, so pre-cropping would
  throw away pixels the taller tiles use.
- Split 10 per column, height classes varied to keep the masonry rhythm.
- **Durations re-derived, which is the part that is easy to miss.** Duration is
  a function of track length: 46s/54s ran the old 1894/2172px tracks at 20.6
  and 20.1 px/s. The tracks are now 5602/5880px, so the same speeds need
  **136s and 146s** — left alone the board would have run three times too fast.
  Verified back to 20.6 and 20.1 px/s exactly.
- **The duplicate half of each track is now generated from the real half**
  rather than hand-written. The seamless `-50%` loop depends on the two sets
  being identical, and 31 tiles per column is past the point where keeping that
  in sync by hand is safe. Dupes are emitted from the reals with `aria-hidden`
  added and every `alt` emptied, so each photograph is announced once.

The user confirmed usage rights before publishing; the photographs show
identifiable people, which is why that was asked rather than assumed.

### Also: the orphan deletion finally deployed
`run-mumbai.jpg` / `run-perth.jpg` were committed as deleted last turn but the
deploy was interrupted, so the live site was still serving both (checked: 200).
This deploy carries it.

### Verified
- 31 unique photographs, 62 tiles, real/dupe halves mirrored.
- Speeds exactly 20.6 and 20.1 px/s; `padding-bottom == gap` still true at
  every width, including where the ≤700 block overrides the gap to 10px — the
  documented seam trap.
- Alt audit: no duplicate carries alt text, no real tile lacks it.
- No broken images anywhere on the page; no horizontal overflow at 1440 / 1180
  / 1040 / 900 / 768 / 700 / 560, nor at 414 / 390 / 360 / 320 via the iframe
  harness (headless Chrome clamps its own window near 500px).
- Reduced motion: both tracks `animation-name: none`, `transform: none`.

---

## 2026-08-26 — The mosaic drops its generated stills

All eleven AI-generated tiles came out of the waitlist mosaic, leaving the
twenty real photographs. Ten per column, 40 tiles with the duplicate halves.

**The files mostly stay, because nine of the eleven are used elsewhere** —
`dish-1`..`dish-6` in the hero dish rail and `legacy-carrier`/`legacy-stack`/
`legacy-code` in the Since-1890 band. Checked before touching anything; deleting
the files rather than the tiles would have blown holes in two other sections.
Confirmed after the edit that the rail still renders 6 cards and the band 3.

**`legacy-code.jpg` was the mosaic's only `piece--object`** — the single
pink-tinted tile that echoed the reference's one colour block. That treatment is
gone from the page with it, and `.piece--object`'s three rule blocks are now
unused CSS. Left in place rather than stripped, since restoring the tile is a
one-line change if it is wanted back.

**Durations re-derived for the second time in two turns, in the opposite
direction.** 136s/146s were correct for 5602/5880px tracks. With the generated
tiles gone both tracks are 3708px, where those durations ran **33% too slow**
(13.6 and 12.7 px/s against the reference 20.6/20.1). Now 90s/92s, measured
back to 20.6 and 20.2. Both columns are the same height now — each holds ten
tiles of the same height-class multiset — so the differing durations are what
stop them travelling in lockstep.

**Newly orphaned, not deleted:** `legacy-lunch.jpg` (132KB) and
`legacy-rush.jpg` (240KB) were mosaic-only and now have zero references. Flagged
rather than removed — they are real content that may be wanted elsewhere, and
deleting them means editing their `generate-assets.mjs` entries too or the next
run recreates them.

### Verified
- 40 tiles, 20 unique, all `net-*`; zero `piece--object` tiles remain.
- Speeds 20.6 and 20.2 px/s; `padding-bottom == gap` still true.
- Alt audit clean; no broken images; no horizontal overflow.
- Hero dish rail still 6 cards, Since-1890 band still 3 images.
