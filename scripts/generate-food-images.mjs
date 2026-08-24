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
    slug: "masala-dosa",
    name: "Masala Dosa",
    prompt: `Crisp golden masala dosa on a banana leaf, rolled open to reveal spiced potato filling, three small steel bowls of coconut chutney, tomato chutney and sambar, ${LOOK}`,
    aspect_ratio: "4:3",
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
    prompt: `Chole bhature — a tall puffed golden bhatura beside dark spiced chickpea curry in a steel bowl, sliced red onion, green chilli, pickle, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "gulab-jamun",
    name: "Gulab Jamun",
    prompt: `Gulab jamun in a shallow ceramic dish, deep amber syrup catching the light, crushed pistachio and rose petals on top, single dumpling lifted on a spoon, ${LOOK}`,
    aspect_ratio: "1:1",
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
