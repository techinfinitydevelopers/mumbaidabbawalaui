#!/usr/bin/env node
/**
 * Generates the imagery for the Mumbai Dabbawala 2.0 (Perth) teaser page and
 * writes it to public/img/. Run once, commit the output — the site itself never
 * calls FAL at runtime.
 *
 * The set is deliberately *heritage and journey*, not dishes: the page is a
 * teaser with no menu, so nothing here is framed as something you can order.
 *
 *   node scripts/generate-images.mjs
 *   node scripts/generate-images.mjs --only dabba-stack --fast
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("public/img");
const MODEL_QUALITY = "fal-ai/flux-pro/v1.1-ultra";
const MODEL_FAST = "fal-ai/nano-banana";

const LOOK =
  "photojournalistic, natural light, fine grain, rich but restrained colour, " +
  "shallow depth of field, documentary realism, no text overlay, no watermark";

const IMAGES = [
  {
    slug: "dabba-stack",
    prompt: `A tall stack of well-used stainless steel tiffin dabbas, lids hand-painted with small coloured code marks and numerals, worn metal catching warm side light, dark neutral background, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "dabbawala-cycle",
    // Explicitly text-free: earlier runs painted garbled lettering on the crate.
    prompt: `A dabbawala in a white Gandhi cap and simple white kurta steadying a bicycle loaded with a wide plain unpainted wooden crate of steel tiffin dabbas on a Mumbai street in morning light, motion of the city softly blurred behind him, completely blank bare timber crate with absolutely no lettering signage writing or markings anywhere, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "dabba-lid-code",
    prompt: `Extreme close-up of the lid of a steel tiffin dabba, hand-painted alphanumeric routing code in red and yellow enamel on scratched metal, condensation beads, strong raking light revealing texture, ${LOOK}`,
    aspect_ratio: "1:1",
  },
  {
    slug: "mumbai-rush",
    prompt: `Long wooden crates of steel tiffin dabbas being unloaded on a crowded Mumbai suburban railway platform at midday, figures in motion, sunlight cutting through the station roof, sense of practised choreography, ${LOOK}`,
    aspect_ratio: "4:3",
  },
  {
    slug: "home-lunch",
    prompt: `An opened steel tiffin dabba on a plain table, its round compartments holding simple home-cooked Indian food — dal, a vegetable, roti — steam still rising, honest domestic cooking rather than restaurant plating, soft window light, ${LOOK}`,
    aspect_ratio: "3:4",
  },
  {
    slug: "perth-arrival",
    prompt: `Perth Western Australia city skyline across the Swan River at golden hour, calm water, clear southern sky, warm low sun on the towers, wide calm establishing shot, ${LOOK}`,
    aspect_ratio: "4:3",
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

async function generate(key, model, image) {
  const response = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: image.prompt,
      aspect_ratio: image.aspect_ratio,
      num_images: 1,
      output_format: "jpeg",
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.detail ?? `${response.status} ${response.statusText}`);
  }

  const url = payload?.images?.[0]?.url;
  if (!url) throw new Error("no image returned");

  const binary = await fetch(url);
  const buffer = Buffer.from(await binary.arrayBuffer());
  await writeFile(path.join(OUT_DIR, `${image.slug}.jpg`), buffer);
  return buffer.length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = await loadKey();
  const model = args.fast ? MODEL_FAST : MODEL_QUALITY;
  const queue = args.only ? IMAGES.filter((d) => d.slug === args.only) : IMAGES;

  if (!queue.length) throw new Error(`No image matching "${args.only}"`);
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`→ ${queue.length} image(s) via ${model}\n`);

  const results = await Promise.allSettled(
    queue.map(async (image) => {
      const bytes = await generate(key, model, image);
      console.log(`  ✓ ${image.slug}  (${Math.round(bytes / 1024)} KB)`);
    }),
  );

  const failed = results
    .map((r, i) => ({ r, slug: queue[i].slug }))
    .filter(({ r }) => r.status === "rejected");
  failed.forEach(({ r, slug }) => console.error(`  ✗ ${slug}: ${r.reason?.message}`));

  console.log(`\n✓ ${results.length - failed.length}/${results.length} → public/img/`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
