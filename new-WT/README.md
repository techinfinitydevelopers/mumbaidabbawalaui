# new-WT — Mumbai Dabbawala Perth waitlist page

The **Mumbai Dabbawala — Perth** pre-launch waitlist page. Its hero is a
pixel-faithful replica of a shared reference screenshot
(`/Users/apple/Downloads/hero-section.jpeg`, 845 × 529 — a crop of a 1440 × 900
viewport). Plain HTML + CSS, no build step, no framework.

The **layout is the reference's, measured to ±3 reference px** (see below); the
**content and imagery are Mumbai Dabbawala's**. Nothing about the geometry moved
when the content was swapped in — same carve, same type scale, same card rail.

```
new-WT/
  index.html            markup, the SVG clipPath that carves the hero, the tiffin
                        glyph (CTA icon + card badges), the countdown and the
                        two-step signup script
  styles.css            hero styles annotated with their reference px, then the
                        sections below, which have no reference and are built
                        from the hero's own vocabulary
  assets/               logo, hero, six dishes, legacy stills, the run's sticker
                        pins, 20 network photographs (net-*), see below
  scripts/
    generate-assets.mjs rebuilds the imagery — FAL for the hero, Perth and the
                        lid code; public/food and public/img for the rest
    serve.mjs           tiny static server for previewing
  comparison.png        reference vs shipped hero, side by side at one scale
```

## Sections

| Section | Carries |
|---|---|
| Hero | Logo (48px in a 64px chip, matching the countdown's height), the **launch countdown in the nav row** with a live accent pulse on its label, the positioning headline, the Mumbai numbers, an enlarged "Join The Waitlist" CTA (66px), and the six-dish rail |
| Since 1890 | 135 years / 5,000+ carriers / 200k+ lunches, and a three-image collage of **real photographs** — the tiffin handover full height, a loaded handcart and a crowd of carriers beside it, each chosen against the lede's own words |
| The run | A light-grey band carrying a dashed Mumbai-to-Perth route, a plane that flies it as you scroll, and six die-cut sticker pins, unlabelled on desktop — Mumbai, four dishes, Perth. Structure and plane artwork from a supplied zip; palette, faces and photography are MD's |
| The waitlist | A bento mosaic (20 real photographs across two counter-scrolling columns) beside a headline card with the actual signup, a secondary highlight card, and a privacy note — then a modal for mobile (+61), Perth suburb and veg / non-veg — the brief's two-step signup |
| Footer | The logo, a **Stay Connected** block (Instagram, Facebook, LinkedIn, TikTok and YouTube as icon-only links — **all five live**, all pointing at the Australian accounts, `mumbaidabbawalaau`. TikTok was a dimmed placeholder until its URL arrived; it was supplied as an app share link and the `?_r=1&_t=…` tracking pair was stripped before publishing, since `_t` is a share-session token belonging to the sender, not part of the address. X was removed: the only account was India-only, and a Perth page pointing there was worse than not linking at all) and **Contact** with `hello@mumbaidabbawala.com.au`. No phone number anywhere, by design |

The signup does not post anywhere: there is no backend behind this page, so the
modal ends in a confirmation state. Wiring it up is a one-function change in the
`details` submit handler.

### The CTA

Shape and motion follow a 21st.dev reference (shadcnspace "Button with Icon"): a
pill with the label left and a circular chip inset right, and on hover **the chip
travels to the left end while the label's padding swaps by the same amounts** — the
paddings trade values, so the box never resizes. 500ms, `cubic-bezier(.4,0,.2,1)`.

Two departures from the reference: the chip holds the dabba rather than an arrow,
and its 45-degree rotation is dropped — that reads as motion on an arrow and as a
spill on a lunchbox.

This page is plain HTML and CSS, so the component is CSS (`.cta`, `.cta__label`,
`.cta__chip`, `.cta--block`) rather than the reference's `.tsx`.

The hero CTA is a real anchor to `#waitlist`, and it glides there on
`html { scroll-behavior: smooth }` — **there is no click handler, and it does not
need one.** `#waitlist` carries `scroll-margin-top: var(--page-pad)` so it lands
with the page's own padding above it. `scroll-behavior` is not inherited, so the
dish rail's horizontal scroller is untouched (it sets its own `behavior` per
call). Reduced motion puts the root back to `auto`, since Chrome does not switch
smooth scrolling off on its own and this is a ~4300px glide.

### Phones

Under 700px the hero keeps the idea rather than the geometry: a **portrait card
(0.82) with its own carve out of the bottom-right**, the paragraph becoming a
**white panel tucked into that bite**, and the dish rail following below at two
cards across.

The hero's height is the one number every other hero rule is downstream of, and
it is derived two different ways at different widths — from the frame's ratio, or
from a floor. The copy stack's height is not derived at all; it is fixed px that
grows when the type wraps. Those two facts are the source of every hero
regression this page has had, so the widths are set out here with the measurement
that fixed each one:

| Width | Hero height from | The stack's problem, and the lever |
| --- | --- | --- |
| ≤380 | `min-height: 570px` | 28px insets left a 232px column for a 245px line; insets go to 20px, column to 248 |
| ≤700 | ratio 0.82, floor **570** | 470 → 520 → 470 → 570; the last one is the countdown moving into this column |
| 701–900 | ratio **1.28**, floor **620** | the desktop carve used to run here: 359px of hero against a 440px stack, CTA 65px *below* the hero |
| 901–1023 | ratio 1.941 (desktop) | 448 against 506; the chamfer sliced the CTA's chip off. Headline 48/62 and a 56px CTA give back 50px |
| ≥1024 | ratio 1.941 (desktop) | clear on its own — measured, which is where the band above stops |

Phone type is `clamp(26px, 7.2vw, 46px)` for the headline, 15.5/23 for the
subcopy and a 44px CTA. The sizes are what the client asked for, but the headline
one earns its keep twice: at 390 it puts the whole of `A 135-Year-Old Legend` on
one line (284px in a 302px column), so the headline is the two lines it is
written as rather than three, and the stack drops from 296.5px to 221.

**Below 900 the countdown is not in the nav row at all** — it sits at the top of
the copy column, above the headline, with the `Launches in` label. It got there
because the nav row cannot hold it: at 360 the nav is 284px and the brand chip
(the size the client asked for) takes 135, so four tiles had to shrink to 32px
with 15px digits, and 320 could not carry minutes and seconds at any legible
size. The copy column is 248px at its narrowest, which holds four 48px tiles and
their gaps with room over — so every width gets the full readout, and the label
the nav row has never had space for.

It is a **second readout, not a second clock**. The ticker writes every
`[data-unit]` on the page from one target — that was already true, and is why the
nav markup could be duplicated rather than moved. Only one is ever displayed, and
`display: none` keeps the other out of the accessibility tree too, so a screen
reader never meets two timers.

The readout costs the stack 103px (85 of tiles and label, plus an 18px margin),
which is what took the hero floors to **570** on phones and **620** in the
701–900 band.

The 701–900 band is the phone treatment with its own proportions, not a copy of
it: a 0.82 hero would stand 1000px tall out there. Two numbers change with the
ratio. `.hero__copy`'s `bottom` goes 23% → 24%, and `.intro`'s pull into the bite
goes −22% → −13%, because the bite is 20% of the hero's **height** while the pull
resolves against its **width** — so the ceiling on the pull is `20 / ratio`,
which is 24.4% at 0.82 but only 15.6% at 1.28. Overshoot it and the panel stops
tucking into the bite and starts covering the photograph.

- The carve is a second clipPath, `#hero-cut-m`. The desktop path's proportions
  shear unusably when the box goes from 1.94 wide to 0.82, so it is authored
  separately: a step with a concave fillet where the panel's corner sits.
- `.intro` sits **between `.hero` and `.rail` in the DOM** for this reason, and is
  pulled up into the bite with `margin-top: calc(-22% + 6px)` — a percentage margin
  resolves against the container's width, and once the hero's aspect ratio is fixed
  the bite's depth is a fixed share of that width. On desktop the same element is
  positioned absolutely below the hero, with `.stage` reserving the 173px it gives
  up by leaving the flow.
- Cards go to a fixed 172 × 200 with their own scoop path for the featured one — a
  `clip-path: path()` is in px, so the card it cuts has to be a known size.
- The hard line breaks in the headline copy and the paragraph are hidden here, and
  the markup keeps a space around every `<br>` so hiding one cannot fuse two words.

Between 700 and 1180 the desktop hero holds, with the paragraph capped at 38% so it
clears the rail's left edge.

### The waitlist section

Rebuilt 2026-08-21 as a bento mosaic, structurally after a shared reference
screenshot (an AI/3D product landing page) — a grid of small photo/stat/badge
tiles beside a headline card with the real signup, a secondary feature card,
and a slim privacy note. Two earlier redesigns of this section (a dark
dabba-lid concept, then a lid-painting animation) were fully replaced; the
functional contract carried through unchanged (`#waitlist`, `form#signup`,
`input#email`, `#route-err`, `#route-note`, `.signup--bad`) so the submit
handler needed no changes across any of the three.

- **The mosaic is two counter-scrolling image columns** — **10 real
  photographs of the organisation** (`net-01`..`net-10`), five per column, no
  cards, the left column travelling up and the right down inside a
  fixed-height `overflow: hidden` window. Three of the ten are reused in the
  Since-1890 band. The eleven generated stills it began with went once real
  photography existed, and the first batch of twenty network photographs was
  replaced in turn by the client's own ten — a stronger, more editorial set, and
  smaller on the wire (1.7MB against 4MB+). Every tile change means recomputing
  the marquee durations; see the running note in `styles.css`. It began as a static
  masonry board (CSS `columns`); that had to go when the columns needed to
  animate independently, which multi-column cannot do.
- **Each track holds its tiles twice** and animates to exactly `-50%`, so the
  duplicate set is under the window at the moment the first wraps. The
  duplicate is `aria-hidden` with empty `alt`s, so every photograph is
  announced once.
- **The track needs `padding-bottom` equal to its `gap`, and it is
  load-bearing.** `n` tiles have `n-1` gaps between them, but the travel
  needed to align set two over set one is `n/2` tiles *plus* `n/2` gaps — one
  gap short, `translateY(-50%)` undershoots by half a gap and the loop jumps
  7px every pass. The ≤700 block overrides the gap, so it overrides the
  padding too; keep the two equal.
- A `mask-image` gradient fades both ends so tiles enter and leave rather
  than being chopped; hover and `:focus-within` pause both tracks; durations
  differ per column (**90s / 92s**) so the two do not travel in lockstep.
- **Duration is a function of track length, so it has to be re-derived every
  time tiles change — this has bitten twice.** The reference speeds are 20.6
  and 20.1 px/s. 46s/54s ran the original 1894/2172px tracks; adding the
  network photographs took them to 5602/5880px (136s/146s); removing the
  generated tiles brought both to 3708px, where those same durations ran 33%
  too *slow* at 13.6 and 12.7 px/s. Half the track height over the target speed
  is the duration. Adding tiles alone would have scrolled three times too
  fast. Same speeds now need 136s and 146s. Measure the track, divide half its
  height by the old speed.
- **The duplicate set is generated from the real set, not maintained by hand.**
  The `-50%` loop only lands seamlessly if the two halves are identical, and 31
  tiles per column is well past what is safe to keep in sync manually — the
  dupes are emitted from the reals with `aria-hidden` added and every `alt`
  emptied.
- **`prefers-reduced-motion` must override with the full selector**
  (`.mosaic__col--up .mosaic__track`, not `.mosaic__track`) — a single class
  loses to the two-class rule that sets the animation, and the board keeps
  scrolling. Verified under `--force-prefers-reduced-motion`, not assumed.
- **`.showcase` uses `align-items: start`.** A masonry board's height is a
  function of how many tiles it holds, and letting the grid stretch the form
  column to match it put ~400px of dead space under the privacy note. Each
  column now ends where its content ends; ragged bottoms are the board
  aesthetic, and the reference's own columns finish at different heights.
  Making the form card absorb the height instead (`flex: 1` + centred
  contents) was tried and is worse — it moves the void inside the card.
- **The reveal stagger is `nth-child`, not one rule per tile name**, with an
  `:nth-child(n + 9)` catch-all — otherwise every tile added later animates
  with no delay and nobody notices until it looks subtly wrong.
- **The badge circle is capped at `min(100%, 300px)` and centred.** Between
  701 and 1040 the mosaic spans the full section rather than sharing it with
  the form, so its columns widen to ~470 — an uncapped `width: 100%` circle
  rendered there as a 435px black disc that swallowed the board. At the
  desktop column width (306) the cap is within 6px of full-bleed, so it costs
  nothing where it is not needed. `aspect-ratio: 1` supplies the height, which
  keeps it a circle and never an ellipse.
- Both of this section's grids use `minmax(0, 1fr)` tracks, never a bare
  `1fr` — the page has already hit the bare-track min-content overflow bug
  twice, and it is cheap to guard against everywhere rather than re-discover
  it a third time.
- At ≤700, `.showcase__row` (the email field beside the button) switches to
  `flex-direction: column` — and `flex-basis` always sizes along the *main*
  axis, which just became vertical. The desktop rule's `flex: 1 1 240px`
  turned a sane minimum width into a minimum height, stretching the field
  into a tall empty box above the button; fixed with `flex: 0 0 auto` scoped
  to that breakpoint.

### The run

**Both variants fly the same route now.** Under 768 the stages still flow as a
column rather than being pegged to fixed coordinates — the desktop serpentine has
nowhere to go in portrait — but the mechanic came across: a dashed route, the
dabba flying it on scroll, each stage popping as the dabba reaches it, and
un-popping on the way back up. What did **not** come across is the pin. A phone
would be held for a whole viewport it cannot skip, which is where readers leave;
the page keeps scrolling and the flight is paced against the column instead.

Three things made that cheap, and they were all already true:

- `initRunRoute` is one function called twice. The progress mapping, the tangent, the nearest-point stop matching and the bidirectional reveals were **already layout-agnostic** — the traveller maps the route's viewBox to the section's box proportionally, and each pin's `at` is found at runtime by sampling the path and taking the closest point to the pin's measured centre. Nothing was hardcoded, so neither variant needed its own copy. `buildPath` is the only argument that differs.
- Each variant's `read()` returns false while its own section is `display: none`, so only the one on screen is driven and crossing 767 hands over.
- `.run-rev:not(.pin)` already excluded pins from the section-wide observer, so adding `pin` to each `<li>` was enough to move it onto the traveller.

**The phone route's `d` is built, not authored.** A fixed path cannot work: the
column reflows with the width and each note wraps differently, so the cards are
not at a fixed fraction of the section's height the way the desktop pins'
coordinates are. `rebuild()` writes the viewBox in the section's own CSS pixels
(so the mapping is 1:1) and lays a Catmull-Rom curve — converted to cubics, each
control point a sixth along the neighbours' chord — through the cards.

Two points per stage, not one. Through card centres alone the curve came out a
near-straight diagonal: the centres only alternate between 37% and 63% of the
width across one stage of vertical travel. So each card is followed by a waypoint
in the gutter below it, thrown to the far flank — 85% below a left card, 15%
below a right one — and the lobe that makes is what gives the serpentine its
amplitude.

**The gutter is measured between the two cards**, not from whatever sits between
them. It used to key off each stage's note, and when the stage labels and notes
were removed that selector stopped matching: every lobe silently dropped and the
route flattened straight back to the diagonal the lobes exist to fix. Nothing
errored — it just quietly looked worse.

One trap in measuring the cards: `getBoundingClientRect` returns the
**transformed** box, and an unrevealed pin carries `scale(0.78)`, so a card reads
173×207 where it is really 222×265. The centre survives that (the scale is about
the element's own centre — measured, the centre y is identical popped or not) but
the edges do not, and the edges are what the gutter is measured from, so the
heights come from `offsetHeight`. As it happens the midpoint of two
equally-scaled cards' facing edges works out the same either way; that is an
accident of the six cards being the same height, not something to rely on.

There are no stage labels or notes on the phone route — just the six die-cut
images on the line, the way the desktop pins are. Each image's `alt` carries the
identification.

**Speed.** `initRunRoute`'s options carry `ease` and `start`, and between them
they are the only speed controls there are — the route's length and the scroll it
maps over are both consequences of the column's geometry.

| | desktop | phone |
| --- | --- | --- |
| `start` | 0.6 | **1** |
| `ease` | 0.12 | **0.055** |

`start: 1` spreads the flight over the section's whole pass rather than its height
minus 0.4 of a viewport — 2325px of scroll instead of 1987 at 390, so **1.33px of
path per pixel of page instead of 1.55**. The reason 0.6 exists (at 0.85 the
desktop dabba dipped below the fold on the route's first dip) does not apply here:
the phone route's first fifth runs straight down through the copy above the first
card.

`ease` is the lerp in `loop()` — how hard the dabba chases the scroll. At 0.055
it trails 17.2× the per-frame step against the desktop's 7.3×, and a flick glides
for 2.5s rather than 1.1s. That is where most of the felt slowdown comes from: a
sustained slow scroll moves the sprite at the mapped rate whatever `ease` is, so
`ease` buys the flick-and-watch case, `start` buys the sustained one.

Going genuinely 1:1 would need another ~1100px of column — 276px between cards —
which is a page of white space, so it is not on the table. More slowdown means
more gap, at that exchange rate.

The dabba rides a **second overlay above the cards** (`z-index` 5 against their
4, the line at 1). It has to: the route runs through the card centres, so the
dabba is behind a card at exactly the moment it arrives at one. Desktop gets away
with sharing one box because its cards are a fifth of the frame; here they are
two thirds of the column.

A route unit is a pixel here where on desktop it is a 1728th of the section's
width, so the line's `stroke-width: 10` / `dasharray: 42 42` and the sprite's 259
units are all rescaled — 5/13 and 76.

Structure and mechanic come from a supplied zip (a replica of CRAV's
"Takeaway" section): a wavy divider bleeding the page colour in, one dashed
SVG path, a traveller placed along it by scroll progress via
`getPointAtLength`, photo pins pegged at measured offsets, and an under-768
swap to a stacked list.

What did **not** come across: its mustard/beige palette and its Modak/Mouse
Memoirs faces (that would be two new hues and two new fonts on a page built on
four colours and two faces), and its burger photography (wrong brand, not
licensed for MD). Its **`plane.webp` is used**, at the reference's own
`259 x 274` route units — third-party artwork from the zip, not generated here
and not licensed to this project, the same standing caveat as the hero video.
**Its nose is at the bottom of the sprite**, so the rotation is
`rotate(ang - 90)`, not the reference's `+90` — that put it at `ang + 180`,
flying backwards and belly up. Check a sprite's orientation by rendering it,
not by measuring where its ink sits.

**All five pins are die-cut sticker PNGs, not photographs**, so
`.pin__card` carries no background — the art sits straight on the section's
grey. Supplied as 4500x4500 squares and resized to 1000px. `object-fit:
cover` is kept over `contain` deliberately: cover crops 7.9% off each side
while every sticker holds at least 13% transparent margin there (measured
via `PIL.Image.getbbox()`), so nothing is clipped and the art renders at the
taller 19cqw scale rather than the narrower 16cqw one. Saved under new
filenames (`run-mumbai/biryani/paneer/jamun/perth.png`) so the mosaic's own
`dish-2.jpg`/`dish-4.jpg`/`dish-6.jpg` — same dishes, different photos — are
untouched.

**The first Gulab jamun file supplied was rejected**: it carried a repeating
`pngtree` watermark tiled across the entire frame, visible at full zoom on
both the bowl and the jamuns. A replacement was supplied and checked the same
way before use. Worth keeping the habit — check every supplied asset at full
zoom, not just at thumbnail size, because a tiled watermark is invisible
until you do.

**Six pins, and the reveal runs both ways.** Scrolling back up un-pops each
pin as the dabba retreats past it; the CSS transition already ran both
directions, so reversing it was a matter of making the progress check
bidirectional instead of one-shot. Verified by walking the section down and back
up: pops accumulate mumbai -> biryani -> paneer -> jamun -> pulav -> perth and
un-pop in exactly that reverse order.

**`run-pulav.png` was rebuilt, not just imported.** It arrived as a `.jpeg` that
was a transparent PNG *flattened onto its own checkerboard* — the grey/white
checker was baked into the pixels, so dropping it in would have put a
checkerboard rectangle on the page. Recovered by flood-filling the background
inward **from the border**, which is what preserves the light rice grains and rim
highlights *inside* the dish that a plain luminance threshold would have punched
holes in. Then given the white die-cut edge the other five carry (measured:
20-26px at a 1000px canvas; this one had 0). Two traps in generating that edge:
PIL's `MaxFilter` is a **square** kernel, so dilating the scattered flying rice
turned each speck into a white box — fixed by blurring and re-thresholding to
round it off; and outlining every speck merged them into a white cloud above the
bowl, so only the **largest connected component** gets an edge and the specks
stay bare. Content is 69% of canvas, matching biryani (69%) and mumbai (69%),
which also keeps it inside what `cover` crops.

**The desktop route carries no pin labels.** They were removed (and the card
went from 16x19 to 20x23.75cqw) because with the card background gone, each
PNG's own transparent margin sat inside an invisible box and a label read as
~60px clear of the art it named. The phone list keeps its five `pin__label`
headings — there they head a list item that also carries a `.mrun__note`, so
they are doing real work. Nothing is lost to a screen reader either way: every
sticker's `alt` names its subject ("The Gateway of India in Mumbai...").

Sticker licensing is unconfirmed, the same standing caveat as `plane.webp`
and the hero video.

The five pins read **Mumbai → biryani → paneer tikka → gulab jamun → Perth**,
so the route is the run leaving Mumbai with the food and landing in Australia.
`run-mumbai` and `run-perth` were generated through the existing FAL pipeline
and added to `generate-assets.mjs`'s `IMAGES`, so they are reproducible rather
than hand-fetched; Perth specifically, because that is the city the brief names
and `hero.jpg` is already used twice elsewhere.

The ground is `charcoal 11% over white` (`#e9e9e9`) — still only the two brand
neutrals. Flipping it from charcoal meant re-picking every text colour off
measured contrast: `--ink` 10.14:1, `--ink-soft` 5.77:1, and `--accent-ink`
5.31:1 for the eyebrow, where plain `--accent` would be 3.38:1 and fail AA at
15px.

- **The section is pinned until the flight lands.** `#run` sits inside
  `.run-pin`, and once its bottom meets the viewport bottom it sticks there for
  one more viewport of scroll while the dabba finishes the route. Progress
  reaches 1 *exactly* as the pin releases, so the page never moves on
  mid-flight. Sticky, not a scroll lock — nothing calls `preventDefault`, so
  the scrollbar, keyboard and trackpad keep working normally.

  Three measured facts shape it, two of which contradict the obvious approach:
  **`bottom: 0` cannot do this** (it is the reverse-sticky constraint and
  shifts a box *up*; with the section at the top of its wrapper there is no
  upward room, so it never engages); **`padding-bottom` on the wrapper buys no
  hold** (a sticky box is constrained to its containing block's *content* box,
  so the pin distance has to be a real element — `.run-pin__hold`); and the
  negative `top` needs the section's own height, which the section cannot state
  about itself, so `.run-pin` is a container and the offset is
  `calc(100svh - 132cqw)` resolved against it. Gated on
  `(min-width: 768px) and (min-aspect-ratio: 4 / 5)`: below 768 the desktop
  section is `display: none` and the hold would be blank page, and below 4/5
  the section fits the viewport, which would pin it on the way *in*.
- **The plane's progress is mapped to the section's arrival, not its approach.**
  0 when the section's top crosses 60% of the viewport, 1 when the *track's*
  bottom reaches the viewport bottom — the pin's release point. The obvious
  mapping (`section.height + innerHeight`) spends a full viewport of scroll
  before the section is even readable, which had the plane already well along
  the route the moment it appeared. 60% rather than 85% because at 85% the
  dabba dropped ~96px below the fold on the route's first dip, and the first
  two pins popped below the fold where nobody saw them.

  **The two constants have to be derived from one another.** Moving the start to
  0.6 while `travel` still carried 0.85's remainder capped progress at 0.914 at
  the release point, so the last 9% of the route — Perth's pin included — never
  ran. A geometry probe cannot catch that class of bug: it carries a copy of the
  same formula and agrees with the page about a number they are both getting
  wrong.
- **Pins are revealed by the plane reaching them**, not by an
  IntersectionObserver on the section. Each trigger point is the nearest point
  on the path to the pin's centre, computed at runtime and re-measured on
  resize — **matched in 2D, because the route doubles back and matching on `y`
  alone pairs a pin with the wrong crossing**. Because the reveal is
  script-driven, the hidden state must not exist without JS: it is keyed off
  `run-ready`, which only JS adds. A pin pops when the dabba has reached it
  **and** it is on screen — the second condition only ever delays a pop, and it
  matters on short viewports where the lower pins are reached below the fold.
- **The route's viewBox is 2400 tall, not the path's own 2176.** The path
  deliberately runs off all four edges (its bbox is `x -20..1929`,
  `y -139..2234`) and the dash bleed is the reference's look — but the *sprite*
  is 274 units tall centred on the point, so at the path's lowest it reached
  2371 and was cut by the section's bottom. Clamping progress to a safe window
  was not viable: only the middle third of the route is sprite-safe. Extending
  the viewBox was, and **every pin offset scales by 2176/2400 with it**, since
  `preserveAspectRatio="none"` maps the viewBox proportionally.
- **The route uses `preserveAspectRatio="none"` so it fills the section.** With
  the default `xMidYMid meet` the viewBox's 0.794 ratio inside a wider section
  left ~260px of dead band above and below the path — most of the section's
  empty space. Filling it instead fits the same route in **132cqw rather than
  163cqw** (1848px vs 2282px at a 1400 container). The trade is a ~5% vertical
  stretch on the path and the sprite, and up to ~1.4 degrees of angular error
  in the plane's rotation (computed from the user-space tangent); neither is
  visible at this size.
- **Pin offsets are tied to that geometry.** They were re-derived when the
  letterbox went (50/64/80/105/130 → 30/46/62/84/106cqw), each keeping its
  fraction of the route's vertical run. The last is held slightly above its
  proportional spot so its card and label clear the bottom edge — `.run` has
  `overflow: hidden` and would crop it.
- **Offsets are `cqw`, not `vw`.** The reference's section is full-bleed, so
  `vw` was right there; this one is an inset card, so `vw` would drift from its
  own box by the page padding. `container-type: inline-size` makes 1cqw = 1% of
  *this section*, which is what the reference's numbers meant.
- **The section's own height is `aspect-ratio`, never `163cqw`.** An element
  cannot be its own container query container, so `cqw` on the section falls
  back to the viewport — it rendered 163% of 1440 (2347px) while every pin
  inside sized against 1400, leaving 65px of dead space. `aspect-ratio` is
  self-referential.
- **Pins sit above the route** (`z-index: 4`), so the traveller passes behind
  the cards. That is the reference's own layering, and worth knowing before
  concluding the traveller is missing — verify its position by reading the
  transform the page settled on, not one you injected.
- Reveals follow the page's inversion: JS adds `run-ready`, and the hidden
  state is keyed off it, so no-JS and reduced-motion both land on the plain
  fully-visible section.
- **Every `pin--*` in the markup needs a matching positioned rule in the CSS.**
  Renaming the pin keys once left four of five pins with no `top`/`left`/
  `right` at all, and they piled into the section's top-left corner over the
  eyebrow — only the one key that had not changed landed correctly. Worth a
  grep whenever the pin set changes.

### On-load reveals

A `page-in` class on `<html>`, set by a tiny inline script in **`<head>`** — it
cannot live in the deferred block at the end of `<body>` or one un-animated
frame paints first. No class means no animation, so JS-off and reduced-motion
both get the plain page.

- **The banner fades in left to right** via a moving `mask-image` on `.hero`,
  not a `clip-path` — the brief was a fade in that direction and a clip edge is
  hard. The gradient is 2.5x the hero's width, so animating `mask-position`
  from `100%` to `0` sweeps one soft edge across. The hero's `clip-path` carve
  survives the mask; both compose.
- **The dish cards fade in right to left**, each from `translateX(34px)`, with
  delays running *backwards* through the DOM (0.55s on card 1 down to 0.15s on
  cards 6+) so the rightmost card on screen lands first. Cards 4-6 are offscreen
  at rest, hence their short delays.
- That initial `translateX` feeds scroll-snap — transformed overflow counts
  toward a scroll container's scrollable area — so `.rail__track` reads
  `scrollLeft: 34` *during* the animation. It settles to 0 with the first card
  flush; transient, not a bug.

### The rail controls

`.card__jump` is the round badge on the featured card with **"Scroll to See"**
curved around its ring — upright across the top, inverted across the bottom,
a dot in the gap at each side (it was a circular arrow linking to `#legacy`;
a visible label has to match what the control does, so it now scrolls the rail
instead).

**The rail also drags.** `.rail__track` carries `cursor: grab` (`grabbing`
while held) with pointer-event drag-scrolling behind it — a grab cursor with no
drag under it is a promise the page cannot keep. Three details it depends on:
`scroll-snap-type` has to go to `none` for the duration (with `x mandatory` the
browser re-snaps after every `scrollLeft` write and the drag feels stuck);
`dragstart` is prevented, because the card photos are natively draggable and
that fires before any distance threshold could; and it is **mouse-only**, since
touch already has native momentum scrolling worth more than anything reimplemented
here. The click that closes a drag is swallowed **once** — an earlier version
re-derived that from the drag distance at click time, which went stale and left
the ring badge permanently dead after the first drag.

The ring is one circular `<path>` starting at 9 o'clock, so 25% along is
12 o'clock and 75% is 6 o'clock; two `<textPath>` runs anchored `middle` at
those offsets centre one label top and one bottom, and the gaps then fall
exactly where the dots sit. It spins 18s linear, paused on hover and focus so
the label can be read before clicking.

**The ring text is sized in viewBox units, so it scales with the badge** — at
the 72px the badge now uses, the original 8.6-unit font rendered ~6.2px, so it
is 11.5 units (~8.3px). Same size on phones for the same reason: 72px is
already the floor where a 13-character curved run stays legible. A run too long
for the arc runs off the end of the path rather than wrapping, so the fit is
measured rather than assumed — 69px in an 86px half-arc, 81% used. `.rail__next` is the
arrow at the rail's edge — **it previously had no click handler at all**, so the
rail was keyboard-inaccessible and only moved by trackpad or touch.

Both now share one handler that measures its step from the first two cards
rather than hardcoding it, so it stays right at the 700px breakpoint where
cards shrink 244 → 172, wraps back to the start from the end rather than
dead-ending, and drops to `behavior: auto` under reduced motion.

### The stat counters

The three Since-1890 figures count up when the band is reached. The numerals sit
in `[data-count]` spans that **keep their final value in the markup**, so no-JS
and reduced-motion readers see the real figures — the animation only runs where
it can finish.

- `easeOutCubic` over 1.4s. A linear count reads like a loading spinner.
- `en-AU` formatting supplies the "5,000" comma; `data-suffix="k"` handles 200k.
- `.stats__n` carries `font-variant-numeric: tabular-nums`, so the figures do
  not jitter in width while counting.
- **Zeroing happens inside the intersection callback, not at script time.** The
  first version zeroed up front, which meant any path where the observer or rAF
  never delivered left the reader looking at `0 / 0 / 0k` — worse than no
  animation. There is also a `setTimeout` that lands the real figure if rAF
  never ticks.

Note for anyone debugging this: it will read `0 / 0 / 0k` in a hidden document
(the browser pane reports `document.hidden: true`, which suspends
IntersectionObserver *and* rAF) and under headless virtual time, which does not
pace rAF against `setTimeout`. Load at a tall window height so `.stats` is
visible at load and the observer's first delivery already intersects.

### The countdown

Four tiles in the hero's nav row, each turning its digit over like a calendar page
when it changes.

- **Tiles, not a line of numbers**, so it reads as a countdown at a glance and each
  unit can turn on its own. Days sits in a brand-red tile; it is the figure people
  actually read.
- **The turn is two layers and sequential.** The outgoing value is cloned into a
  `.tile__prev` layer that lifts away about its top edge over 0.22s; the new digit
  then drops in about its bottom edge over 0.26s. Running them together — the first
  attempt — overlapped both digits into mush at the halfway frame. Each layer also
  dips in brightness as it rotates, which is what sells a page turning rather than
  a number sliding.
- **Only what changed turns.** `put()` compares before it writes, so the seconds
  turn every tick and the hours turn once an hour. A digit that animates every
  second reads as noise. The outgoing layer removes itself on `animationend`.
- Phones drop the lead label and the minutes/seconds tiles — marked `--fine` and
  `--lead`, not `:nth-of-type`, because a positional rule broke silently the moment
  an element was added ahead of them in the DOM.
- Under `prefers-reduced-motion` the outgoing layer is not drawn and the new digit
  simply appears.

One `setInterval` writes every `[data-unit]` element on the page, so any further
readout added later is the same clock rather than a second one that drifts.

### On-scroll reveal

Two sections animate in the first time they cross into view, both through one
shared `revealOnScroll(el)` helper (a single-shot `IntersectionObserver`,
`threshold: 0.2`) rather than a library:

- **The legacy collage** (`#legacy`) — each photo wipes in via its own
  direction, not the same motion three times: the tall lead photo
  bottom-to-top, the second tall photo top-to-bottom, the wide photo from its
  top-left corner toward its bottom-right (the closest a pure
  `clip-path: inset()` can get to a diagonal — `inset()` only ever describes
  an axis-aligned rectangle).
- **The waitlist section** (`#waitlist`) — the six mosaic tiles pop in
  (fade + scale, staggered) as if the grid were assembling itself, while the
  headline card's children and the feature/note cards fade and rise,
  timed to follow the tiles rather than race them.

The helper only ever adds a `reveal-ready` class — which is what the CSS keys
the hidden starting state off — when `IntersectionObserver` exists and
`prefers-reduced-motion` is not `reduce`. Without it, every element stays in
its plain, always-visible state defined outside that class, so a visitor with
no JS, no `IntersectionObserver`, or a motion preference never lands on
permanently invisible content.

## Brand

```
Headings   Asar          (one weight, 400 — never bold)
Body       Palanquin     (300–700)
Palette    #ED3237 red · #373435 charcoal · #FEFEFE off-white · #FFFFFF white
```

Both faces are declared once as `--font-head` / `--font-body`, and the palette as
`--brand-*` with `--accent` / `--ink` on top, so a future change is a token edit.

**Every type size was re-fitted when the faces changed**, because the hero's
boxes are traced and the two brand faces are metrically nothing like the
reference's. Asar's cap height is 0.658em and Palanquin's x-height is 0.449em,
against 0.702 and 0.558 for the grotesque the reference was set in — so the same
px value renders visibly smaller. Sizes were solved to preserve the measured ink
widths and cap heights instead:

| Element | Was | Now | Why |
|---|---|---|---|
| Headline | 65px | **70px Asar** | Carries the reference's 46.4px cap height |
| Hero subcopy / paragraph | 20.5px | **23.5px Palanquin** | Reproduces the traced 561px line |
| CTA label | 16px | **19.5px Palanquin** | Keeps the button box on its measured 184px |
| Card title | 16.5px | **17px Asar** | Cap-height match |
| Card body | 17px | **20px Palanquin** | Fills the traced 177px line |

Verified after the swap: the button box measures 108 × 30 reference px against
the traced 109 × 30, and the headline's baselines land within 1px of the traced
187.5 / 246.5.

Asar ships a single weight, so headings are 400 and never bold — a synthesised
bold smears it. The one place that costs something is the card titles, which can
no longer lean on weight to separate from a photograph, so they lean on a
text-shadow instead.

## Photography

```bash
node new-WT/scripts/generate-assets.mjs                      # anything missing
node new-WT/scripts/generate-assets.mjs --only hero --force  # redo one
```

Two sources on purpose:

- **`hero.jpg`** — the site's existing Perth shot (`public/img/perth-arrival.jpg`)
  cropped to the hero box's 1.9417 ratio. It is bright edge to edge with no dark
  element to sit the headline on, so the left wedge in `.hero__scrim` does the work
  the reference's tree did: sampled to land under 110 of 255 behind the subcopy and
  the nav ticker, which is what the reference itself measures.
- **`dabbawala-street.jpg`** — generated with `fal-ai/flux-pro/v1.1-ultra` for the
  launch band. `FAL_KEY` comes from `.env.local`; the page never calls FAL at
  runtime. Its prompt spells out composition rather than subject, because the band
  needs a dark centre for the copy and the subject to one side.
- **`legacy-code.jpg`** — generated with **`fal-ai/gpt-image-2`**, not FLUX. This
  is the one asset whose subject *is* its lettering: FLUX garbles painted text
  (`public/img/dabba-lid-code.jpg` came back reading "KoR3O"), while gpt-image-2
  returns the routing code as written — "K BO / 12 E7".
- **`dish-1..6.jpg`, `legacy-carrier.jpg`, `legacy-stack.jpg`** — centre-cropped
  and downscaled from `public/food/` and `public/img/`, which the main site
  already generated. Same subjects, so there is no reason to pay for them twice
  or risk a different look.

Both paths finish through `sips` (built into macOS, hence no image dependency):
~810 KB of imagery total, down from 9 MB of originals.

One CSS accommodation for the hero photograph: `object-position: 50% 100%`. FLUX
put a garbled shop sign along the top edge — bottom-aligning the cover crop
removes exactly that band and adds street to the foreground instead.

## Not reproduced

- The reference's own photographs (licensing unknown), so tone differs slightly
  per image even though the layout matches.
- The reference is a crop: it ends 16px below the card rail, so anything the
  page would show further down is invented — here, just page padding.
