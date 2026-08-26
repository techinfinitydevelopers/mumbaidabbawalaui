
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
