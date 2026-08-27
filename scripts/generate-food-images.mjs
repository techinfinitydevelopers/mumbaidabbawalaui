#!/usr/bin/env node
/**
 * Generates the Indian food stills used across the landing page and writes them
 * to public/food/. Run once, commit the output — the site itself never calls FAL.
 *
 *   node scripts/generate-food-images.mjs
 *   node scripts/generate-food-images.mjs --only butter-chicken --fast
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("public/food");
const MODEL_QUALITY = "fal-ai/flux-pro/v1.1-ultra";
const MODEL_FAST = "fal-ai/nano-banana";

const LOOK =
  "shot on Hasselblad, 90mm macro, shallow depth of field, moody directional window light, " +
  "deep shadows, steam rising, hyper-detailed texture, editorial food photography, " +
  "dark rustic surface, no text, no watermark";

/* The shared LOOK asks for "steam rising" and a dark rustic surface, which is
   right for the savoury dishes and wrong for a syrup sweet — it is what put smoke
   across the gulab jamun and sank it into a black frame. This variant keeps the
   camera and the detail, drops the steam, and opens the light up. Negatives are
   stated explicitly because "no steam" alone tends not to hold; FLUX responds to
   the absence being named more than once. */
const LOOK_STILL =
  "shot on Hasselblad, 90mm macro, shallow depth of field, warm golden side light, " +
  "bright and appetising, hyper-detailed glossy texture, editorial food photography, " +
  "no steam, no smoke, no haze, no text, no watermark";

const DISHES = [
  {
    slug: "butter-chicken",
    name: "Butter Chicken",
    prompt: `Overhead close-up of butter chicken in a hammered copper karahi, glossy tomato-cream gravy, swirl of fresh cream, scattered kasuri methi and coriander, torn butter naan at the edge of frame, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "hyderabadi-biryani",
    name: "Hyderabadi Biryani",
    prompt: `Hyderabadi dum biryani in a clay handi with the lid lifted, long saffron-streaked basmati grains, tender lamb, fried onions, mint leaves, visible steam, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    /* Replaced masala dosa outright. Art-directed from a supplied reference, which
       was a watermarked stock comp — used as direction for a fresh generation, not
       as an asset. `LOOK_STILL` again: the reference has no steam and the shared
       LOOK would have added it.

       The reference is landscape and the slot is 3:4, so the two idli sit in the
       lower two thirds with the bowls stacked behind them rather than beside — a
       side-by-side arrangement would lose a bowl to the crop, the same trap the
       dosa fell into at 4:3. */
    slug: "idli",
    name: "Idli",
    prompt: `Two steamed idli on a speckled cream ceramic plate in the lower two thirds of the frame, each a low domed disc of white fermented rice cake, matte chalk-white with a fine softly pitted grain and a faint speckle of semolina, gently irregular and slightly rustic, not glazed and not smooth, a few black mustard seeds and a curl of curry leaf resting on top, a sprig of fresh mint, behind them two dark stoneware bowls stacked back to front, one of orange sambar with green chilli and coriander, one of thick white coconut chutney flecked with mustard seed and a thread of red chilli oil, dark weathered wood table, ${LOOK_STILL}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "paneer-tikka",
    name: "Paneer Tikka",
    prompt: `Charred paneer tikka skewers straight off the tandoor, blistered edges, bell peppers and red onion, smoke curling upward, lime wedge, sprinkle of chaat masala, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "chole-bhature",
    name: "Chole Bhature",
    /* Regenerated. "A tall puffed golden bhatura" is what produced the cone —
       the model read "tall" as the silhouette and gave a spire that dominated the
       frame with the chole barely present. The chole leads now, and the bhatura
       is described by what it actually is: a round, flat-ish, hollow-puffed
       bread. */
    prompt: `Chole bhature, the bowl of chole in front: dark glossy spiced chickpea curry in a steel bowl, thick masala clinging to the chickpeas, coriander and ginger julienne on top; behind it one round golden-brown bhatura, wide and flat with a soft hollow puff and blistered spots, lying flat on the plate rather than standing; sliced red onion, a green chilli and a lime wedge to the side, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "gulab-jamun",
    name: "Gulab Jamun",
    /* Regenerated to a supplied reference: a plateful rather than one on a spoon,
       and a warm festive table rather than a dark smoky one. The spoon was in the
       old prompt ("single dumpling lifted on a spoon") and the smoke came from the
       shared LOOK, so both had to go at once.

       3:4 like the rest, not 1:1 — every consumer crops to 3:4, and a square
       source spends a quarter of itself on the crop. */
    prompt: `A generous mound of gulab jamun piled high on an ornate gold-rimmed plate, deep amber-brown glossy spheres glistening with syrup, slivered green pistachio and a few dried rose petals scattered over them, shallow pool of syrup in the plate, warm festive table behind thrown softly out of focus with glass jars of nuts and a brass bowl, ${LOOK_STILL}`,
    aspect_ratio: "3:4",
  },
];

function parseArgs(argv) {
  const args = { fast: false, only: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--fast") args.fast = true;
    else if (argv[i] === "--only") args.only = argv[i + 1];
  }
  return args;
}

async function loadKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const env = await readFile(path.resolve(".env.local"), "utf8");
  const match = env.match(/^FAL_KEY=(.+)$/m);
  if (!match) throw new Error("FAL_KEY not found in environment or .env.local");
  return match[1].trim();
}

async function generate(key, model, dish) {
  const response = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: dish.prompt,
      aspect_ratio: dish.aspect_ratio,
      num_images: 1,
      output_format: "jpeg",
      enable_safety_checker: true,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.detail ?? `${response.status} ${response.statusText}`);
  }

  const url = payload?.images?.[0]?.url;
  if (!url) throw new Error("no image returned");

  const image = await fetch(url);
  const buffer = Buffer.from(await image.arrayBuffer());
  const dest = path.join(OUT_DIR, `${dish.slug}.jpg`);
  await writeFile(dest, buffer);
  return { dest, bytes: buffer.length };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = await loadKey();
  const model = args.fast ? MODEL_FAST : MODEL_QUALITY;
  const queue = args.only ? DISHES.filter((d) => d.slug === args.only) : DISHES;

  if (!queue.length) throw new Error(`No dish matching "${args.only}"`);
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`→ ${queue.length} image(s) via ${model}\n`);

  const results = await Promise.allSettled(
    queue.map(async (dish) => {
      const { bytes } = await generate(key, model, dish);
      console.log(`  ✓ ${dish.slug}  (${Math.round(bytes / 1024)} KB)`);
      return dish.slug;
    }),
  );

  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r, i) => console.error(`  ✗ ${queue[i].slug}: ${r.reason?.message}`));

  console.log(`\n✓ ${results.length - failed.length}/${results.length} → public/food/`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
