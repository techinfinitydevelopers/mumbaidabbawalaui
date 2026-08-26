
---

## 2026-08-26 — Mobile: smaller hero type, smaller button, full countdown

Three asks on the phone view, all in the `≤900` block.

### Headline and subcopy down a size

Headline `clamp(30px, 8.4vw, 54px)` → **`clamp(26px, 7.2vw, 46px)`**, subcopy
17/26 → **15.5/23**. The line-height comes down with the size rather than staying
put — 26 on 15.5 is 1.68, which reads as a list of lines, not a paragraph.

The smaller headline pays for itself beyond taste: at 390 it puts the whole of
`A 135-Year-Old Legend` on one line (284px in a 302px column, against 321px at
the old size), so the headline renders as the **two lines it is written as**
instead of three. Stack 296.5px → **221px**.

That let `min-height` go back **520 → 470**: at 470 the clearance above the
headline is 76px, where 520 would give 114 and read as a gap. The 520 floor was
only ever there to absorb the stack the larger type produced.

Also retired the `≤340` headline override (`8vw`). The new clamp's 26px floor
puts `Is Coming to Perth.` at 208px inside a 248px column on its own.

### Button down a size

44px tall from 50, label 15 from 16, chip 36 from 42, paddings 50/20 from 58/22.
The paddings still trade exactly, which is what stops the box resizing when the
chip slides across on hover.

### All four countdown tiles on phones

`.tile--fine` (minutes, seconds) was hidden below 900 with the note "four tiles
will not fit beside the logo". They fit now by giving up width, not by the logo
giving any back — the chip is the size the client asked for and stays it:

| | nav | brand chip | left for the tiles | tiles + gaps |
| --- | --- | --- | --- | --- |
| 360 | 284 | 135 | 149 | `4×32 + 3×4 = 140` |
| 390 | 314 | 135 | 179 | 140 |
| 401+ | 325+ | 135 | 191+ | `4×40 + 3×6 = 178` |
| 320 | 244 | 135 | **109** | four legible tiles do not fit |

Digits go to 15px (17px above 400), which is the floor the turnover animation
still reads at, and the unit labels to 7.5px. At **≤340** minutes and seconds
hide again — four tiles in 109px would be 22px wide with 10px digits, and days
plus hours is the reading that matters at a glance anyway.

Also removed a duplicate `.tile--fine { display: none }` that appeared twice in
the same block.

### Verified
- 4 tiles visible at **360, 375, 390, 401, 430, 480, 560, 700, 744, 900**; 2 at 320 and 340, by design. Gap between chip and tiles never negative — tightest is **8.6px at 360**, then 11.6 at 401.
- `title top − nav bottom` positive at every width from 320 to 900 (42 at 320, 68 at 390, 104 at 744); `cta bottom − hero bottom` negative at all of them; `scrollWidth − clientWidth` **0** at all of them.
- Headline is **2 visual lines from 340 up**, 3 at 320.
- Rendered and read at **320, 360, 390, 744**.

Probe fix worth keeping: the measuring iframe carries a 15px classic scrollbar a
phone does not, so every width had been coming out 15px narrow — a 390 probe was
really measuring 375. `html{scrollbar-width:none}` injected before the read. The
nav numbers above are the corrected ones.

### Not changed
481–700 now has a lot of sky above the headline (133px of clearance at 480,
308 at 700) because the hero's height still comes from the 0.82 ratio while the
stack shrank. Nothing collides or overflows there, and closing it means either a
landscape ratio for that band or capping the hero's height — the second changes
how far the white panel tucks into the bite, since the pull resolves against
width while the bite is a share of height. Left alone; it is a composition call.

---

## 2026-08-26 — The countdown moves into the copy column on mobile

Asked for by annotation: a box drawn between the nav row and the headline, "kya
hum countdown ko yaha add kar sakte hai with the heading Launches in?"

Below 900 the readout now sits at the top of `.hero__copy`, above the headline,
with the `Launches in` label and its pulse dot. The nav row keeps only the logo.

### Duplicated, not moved

The markup is a second `.counter` inside `.hero__copy`, `display: none` above 900;
the nav's is `display: none` below it. That works without a second clock because
the ticker already reads **every `[data-unit]` on the page** into one array off
one target — a deliberate choice from when it was written, and the comment there
says so. `display: none` also keeps the hidden one out of the accessibility tree,
so a screen reader never meets two `role="timer"` elements.

Moving the element instead would have meant putting it back into the nav row on
desktop from inside `.hero__copy`, which is an absolutely positioned box that
shrink-wraps its content — there is no reliable way to right-align a child of it
to the nav's right edge.

### What it buys

The nav row could never hold this. At 360 the nav is 284px and the brand chip —
the size the client asked for, and not up for shrinking — takes 135, so the four
tiles had to live inside 149px: 32px wide with 15px digits. At 320 minutes and
seconds could not fit at all and were hidden.

The copy column is **248px at its narrowest**, which holds `4×48 + 3×6 = 210`
with room over. So every width from 320 up now shows the full readout at the
size the tiles were designed at, plus the label, which had been `display: none`
from 1180 down for want of nav width.

Deleted as dead: the `≤900` tile-shrinking rules, the `401–900` block that
re-grew them, and the `≤340` block that hid minutes and seconds. All three
existed only to squeeze the readout in beside the logo.

### Hero floors again

The readout adds **103px** to the stack (85 of tiles and label plus its 18px
margin), so at the old floors the stack ran back into the nav: −26.7px at 390,
−53.8 at 320. Floors to **570** (≤700) and **620** (701–900).

The arithmetic, written into the CSS this time because it keeps coming back: the
copy's top is `16 + 0.77H − stack`, so clearing the nav's 81px bottom edge with
air to spare needs `0.77H ≥ 85 + stack` — 531 at 390, 566 at 320. In the 701–900
band `bottom` could not absorb it instead: 24% is already close to the 20% where
the carve starts eating the subcopy's right end.

### Verified
- `stack top − nav bottom` positive at **320, 360, 390, 430, 560, 700, 744, 900** (23.2 at its tightest, 320) and 4 tiles visible at every one of them, 320 included.
- `cta bottom − hero bottom` negative and `scrollWidth − clientWidth` **0** at all of them.
- **901 and 1440 unchanged**: nav readout 240 / 392px wide, copy readout measures 0×0. No desktop rule was touched.
- Rendered and read at **320, 390, 744**.

---

## 2026-08-26 — The run's mechanic ported to mobile, without the pin

Asked for after the "sirf batao" answer: build it, drop the pin.

Under 768 the stages still flow as a column — the desktop serpentine has nowhere
to go in portrait — but the mechanic now comes across: dashed route, the dabba
flying it on scroll, each stage popping as the dabba arrives and un-popping on
the way back up. **No pin**, by decision: a phone would be held for a whole
viewport it cannot skip.

### Most of it was already portable

`initRunRoute` is the old IIFE turned into a function called twice. The progress
mapping, the tangent, the nearest-point stop matching and the bidirectional
reveals were **already layout-agnostic** — the traveller maps the route's viewBox
to the section's box proportionally, and each pin's `at` is found at runtime by
sampling the path and taking the closest point to that pin's measured centre.
`buildPath` is the only argument that differs between the two calls. Two other
existing contracts did the rest of the work: each variant's `read()` already
returns false while its own section is `display: none`, and the section-wide
observer already skipped `.run-rev.pin`, so adding `pin` to each `<li>` was
enough to move it onto the traveller.

### The path is built, not authored

A fixed `d` cannot work here: the column reflows with the width and each note
wraps differently, so the cards are not at a fixed fraction of the section's
height the way the desktop pins' `cqw` coordinates are. `rebuild()` writes the
viewBox in the section's own CSS pixels — mapping 1:1 — and lays a Catmull-Rom
curve through the cards, converted to cubics with each control point a sixth
along the neighbours' chord.

**Two points per stage, not one.** Through the card centres alone it rendered as
a near-straight diagonal: measured, the centres only alternate between 37% and
63% of the width across 384px of vertical travel per stage. Each card is now
followed by a waypoint thrown to the far flank — 88% for a left stage, 12% for a
right one — and the flank is chosen by where the note is *not*, since a note sits
under its own card and the opposite side of that band is empty. That bought both
the amplitude and a clear channel for the text; the straight version crossed the
note on nearly every stage.

**The dabba flies in a second overlay above the cards** (z-index 5 against their
4, line at 1). The route runs through the card centres, so with one shared box
the dabba is hidden behind a card at exactly the moment it arrives at one.
Desktop shares a box because its cards are a fifth of the frame; here they are
two thirds of the column.

### The bug the Browser pane caught

The page shipped `viewBox="0 0 0.0 1879.0"` — a path collapsed onto x=0, a
vertical line up the section's left edge with the dabba stuck on it. Two causes,
both fixed:

1. **`rebuild` had no zero-width guard.** A box read mid-load as `0 x 1879` was written straight out. It now bails and leaves `builtW` alone so the path stays marked stale.
2. **The ResizeObserver was load-bearing and shouldn't have been.** Observer callbacks come from the rendering lifecycle, which a hidden tab does not run — the same trap this script's own comment already records for rAF and IntersectionObserver. In the pane it fired once at a mid-load box and never again. `read()` now compares the section's box against the box the path was built for and re-measures on any difference, so the **first scroll repairs it** regardless of what the observer delivered. Confirmed: on load the path was built for a 2609px box, one scroll took it to 2679 — matching the section exactly.

Also removed a `first`-callback skip I had added to the observer. It looks free —
init has already measured — but the first callback is only guaranteed to carry
the size at observe *time*, not to arrive before the next change. Delivered late
it carries the new size, gets skipped, and nothing fires again because nothing
moves again.

### Verified
- **viewBox → px scale exactly 1.0000 × 1.0000**, and every card centre within 0.5–3.3px of the route (residual is the sampling grid, not error). Route and flight overlays' viewBoxes identical.
- **Every pin reachable**, computed from `read()`'s own formula against the measured geometry, at 390×844 and 375×667: progress reaches exactly **1.0000** on the last frame, and each pin's card is above the fold when the dabba gets there — the one exception, pin 6 at 375×667, sits 1px low and clears 0.002 of progress later, which is what the on-screen gate is for.
- Right instance active per width: at **1440 and 800** the desktop route is live (viewBox 1728×2400, length 8956) and the phone route inert (length 0, no transform); at **390** the reverse. No console errors at any width, no horizontal overflow.
- Reduced motion: `is-pinned` false, `run-ready` absent, all six pins at **opacity 1, transform none**. Normal: opacity 0, `scale(0.78)`, waiting for the traveller.
- Rendered and read the whole section at 390 and 405, at flight fractions 0.30 / 0.47 / 0.62 / 0.72.

### What I could not verify
**A real scroll, in either harness.** The Browser pane reports
`document.visibilityState: "hidden"` and rAF never fires there, so the traveller
cannot move; headless clamps the top-level window to ~500px and its scroll stalls
under virtual time. So the motion itself is unproven by direct observation — what
is proven is that the geometry feeding it is correct, that every pin is reachable
under the page's own progress formula, and that the formula is unchanged shared
code already shipping on desktop.
