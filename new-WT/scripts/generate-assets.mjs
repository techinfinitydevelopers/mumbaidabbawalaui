#!/usr/bin/env node
/**
 * Builds the imagery for the `new-WT` hero into new-WT/assets/.
 *
 *   node new-WT/scripts/generate-assets.mjs             # anything missing
 *   node new-WT/scripts/generate-assets.mjs --only hero --force
 *   node new-WT/scripts/generate-assets.mjs --only dish-3 --force
 *
 * Two sources, on purpose:
 *   dabbawala-street.jpg   generated here with FAL (raw REST, so new-WT needs
 *               no packages)
 *   hero, dishes   cropped from public/img and public/food, which the main site
 *               already generated — same subjects, so there is no reason to pay
 *               for them twice or risk a different look
 *
 * Both paths finish with `sips` (built into macOS) to crop and downscale to ~2x
 * display size: FLUX returns 2752px originals where the page shows the hero at
 * 1400 CSS px and a card at 244.
 */

import { mkdir, readFile, writeFile, access, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = process.cwd();
const OUT_DIR = path.resolve(ROOT, "new-WT/assets");
const FOOD_DIR = path.resolve(ROOT, "public/food");
const IMG_DIR = path.resolve(ROOT, "public/img");
const MODEL = "fal-ai/flux-pro/v1.1-ultra";
/* gpt-image-2 spells; FLUX garbles lettering. Only used where the lettering IS
   the subject — the routing code painted on a dabba lid. */
const MODEL_TEXT = "fal-ai/gpt-image-2";

/* flux-pro/v1.1-ultra silently ignores negative_prompt (see BUILD_LOG), so every
   anti-text instruction has to live in the positive prompt — and it still slips
   the odd shop sign in, which is why the hero is bottom-cropped in CSS. */
const LOOK =
  "photojournalistic, photoreal, natural light, fine grain, documentary realism, " +
  "no text, no lettering, no signage, no watermark";

const IMAGES = [
  {
    slug: "dabbawala-street",
    aspect_ratio: "16:9",
    maxEdge: 2400,
    /* Not referenced by the page as it stands — it was the launch band's ground,
       and that band was removed. The entry stays so the asset is one command away
       if the band comes back. Composition is spelled out because that band needed
       it: the copy ran down the centre, so the frame has to stay dark there and
       carry the subject to one side. */
    prompt:
      "Golden-hour documentary photograph of a Mumbai dabbawala in a white kurta " +
      "and white Gandhi cap standing beside a bicycle loaded with a wide plain " +
      "unpainted wooden crate packed with stacked stainless steel tiffin dabbas, " +
      "on a wide Mumbai street. He stands to the right of centre and fills two " +
      "thirds of the frame height; the entire left third of the frame is deep " +
      "shadow under a dark overhanging awning and building wall, almost black; " +
      "warm low sun rakes across the street behind him with the city softly " +
      "blurred; completely blank bare timber crate with absolutely no lettering " +
      "or markings anywhere, " + LOOK,
  },
  /* Removed, and the same reason each time — an entry here recreates its file on
     the next run, so a deleted asset has to lose its entry with it:

       `run-mumbai` / `run-perth`  were the route's two bookend photos. The
         route's pins are supplied die-cut stickers now (`run-mumbai.png`,
         `run-perth.png` and friends — note the extension).

       `legacy-code`  was a close-up of a hand-painted routing code on a dabba
         lid, the one asset generated through gpt-image-2 rather than FLUX
         because its whole point was legible lettering. It went unreferenced when
         the waitlist board moved to the supplied network photographs. */
];

/** Stills the main site already generated; cropped here rather than re-made. */
const DERIVED = [
  /* The hero is the site's existing Perth shot, cropped to the hero box's ratio —
     chosen over a generated one because it is the frame the brief asked for. */
  { slug: "hero", dir: IMG_DIR, from: "perth-arrival", ratio: 1400 / 721, edge: 2400 },
  /* `legacy-carrier`, `legacy-stack`, `legacy-lunch` and `legacy-rush` were 3:4
     crops of the main site's stills, four tiles for the waitlist board's
     scrolling columns. The board runs on the twenty supplied network photographs
     now, so all four went unreferenced — deleted, entries included, for the
     reason given above. */
];

/** Card rail order: mains first, dessert last. Sources live in public/food/. */
const DISHES = [
  { slug: "dish-1", from: "butter-chicken" },
  { slug: "dish-2", from: "hyderabadi-biryani" },
  { slug: "dish-3", from: "idli" },
  { slug: "dish-4", from: "paneer-tikka" },
  { slug: "dish-5", from: "chole-bhature" },
  { slug: "dish-6", from: "gulab-jamun" },
].map((d) => ({ ...d, dir: FOOD_DIR, ratio: 3 / 4, edge: 800 }));

function parseArgs(argv) {
  const args = { only: null, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--only") args.only = argv[i + 1];
    if (argv[i] === "--force") args.force = true;
  }
  return args;
}

async function loadKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const env = await readFile(path.resolve(ROOT, ".env.local"), "utf8");
  const line = env.split("\n").find((l) => l.startsWith("FAL_KEY="));
  if (!line) throw new Error("FAL_KEY not found in .env.local");
  return line.slice("FAL_KEY=".length).trim();
}

/** Read the body as text and parse defensively — a bare .json() hides real HTTP errors. */
async function jsonOrThrow(res, what) {
  const text = await res.text();
  if (!res.ok) throw new Error(`${what} → HTTP ${res.status}: ${text.slice(0, 400)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${what} → unparseable body: ${text.slice(0, 200)}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dimensions(file) {
  const { stdout } = await run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]);
  const w = Number(stdout.match(/pixelWidth: (\d+)/)[1]);
  const h = Number(stdout.match(/pixelHeight: (\d+)/)[1]);
  return { w, h };
}

async function report(slug, out, extra = "") {
  const { size } = await stat(out);
  console.log(`  ✓ ${slug} → ${out} (${(size / 1024).toFixed(0)} KB${extra})`);
}

async function generate(image, key) {
  const model = image.model ?? MODEL;
  const body = image.image_size
    ? { prompt: image.prompt, image_size: image.image_size, quality: "high", num_images: 1 }
    : {
        prompt: image.prompt,
        aspect_ratio: image.aspect_ratio,
        num_images: 1,
        output_format: "jpeg",
        safety_tolerance: "5",
      };
  const submit = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  /* Use the URLs the queue hands back rather than composing them: status lives
     under the base app id, and building it by hand yields a bodyless 405. */
  const { status_url, response_url, request_id } = await jsonOrThrow(submit, `submit ${image.slug}`);
  console.log(`  ${image.slug}: queued ${request_id}`);

  for (let i = 0; i < 150; i += 1) {
    await sleep(2000);
    const s = await jsonOrThrow(
      await fetch(status_url, { headers: { Authorization: `Key ${key}` } }),
      `status ${image.slug}`,
    );
    if (s.status === "COMPLETED") break;
    if (s.status === "FAILED") throw new Error(`${image.slug} FAILED: ${JSON.stringify(s).slice(0, 300)}`);
    if (i % 5 === 4) console.log(`  ${image.slug}: ${s.status} (${(i + 1) * 2}s)`);
  }

  const result = await jsonOrThrow(
    await fetch(response_url, { headers: { Authorization: `Key ${key}` } }),
    `result ${image.slug}`,
  );
  const url = result?.images?.[0]?.url;
  if (!url) throw new Error(`${image.slug}: no image url in ${JSON.stringify(result).slice(0, 300)}`);

  const out = path.join(OUT_DIR, `${image.slug}.jpg`);
  await writeFile(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
  /* gpt-image-2 hands back a PNG whatever the extension says, so force the format. */
  await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82",
                     "-Z", String(image.maxEdge), out, "--out", out]);
  await report(image.slug, out, `, long edge ${image.maxEdge}`);
  return out;
}

/** Centre-crop an existing still to a ratio and downscale it for its slot. */
async function derive(item) {
  const src = path.join(item.dir, `${item.from}.jpg`);
  const out = path.join(OUT_DIR, `${item.slug}.jpg`);
  await writeFile(out, await readFile(src));

  const { w, h } = await dimensions(out);
  const [cw, ch] =
    w / h > item.ratio ? [Math.round(h * item.ratio), h] : [w, Math.round(w / item.ratio)];
  await run("sips", ["-c", String(ch), String(cw), out]);
  await run("sips", ["-Z", String(item.edge), "-s", "formatOptions", "82", out]);
  await report(item.slug, out, `, from ${path.relative(ROOT, src)}`);
  return out;
}

const args = parseArgs(process.argv.slice(2));
await mkdir(OUT_DIR, { recursive: true });

async function wanted(items) {
  const queue = [];
  for (const item of items) {
    if (args.only && item.slug !== args.only) continue;
    if (!args.force) {
      try {
        await access(path.join(OUT_DIR, `${item.slug}.jpg`));
        console.log(`  – ${item.slug}: exists, skipping (--force to redo)`);
        continue;
      } catch {}
    }
    queue.push(item);
  }
  return queue;
}

const genQueue = await wanted(IMAGES);
const cropQueue = await wanted([...DERIVED, ...DISHES]);
console.log(`Generating ${genQueue.length} image(s) + deriving ${cropQueue.length} still(s)`);

const key = genQueue.length ? await loadKey() : null;
const results = await Promise.allSettled([
  ...genQueue.map((i) => generate(i, key)),
  ...cropQueue.map((d) => derive(d)),
]);
const failed = results.filter((r) => r.status === "rejected");
for (const f of failed) console.error("  ✗", f.reason?.message ?? f.reason);
console.log(`Done: ${results.length - failed.length} ok, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
