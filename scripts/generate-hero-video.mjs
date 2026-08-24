#!/usr/bin/env node
/**
 * Generates the hero scroll-sequence video with FAL, in two stages:
 *
 *   1. flux-pro/v1.1-ultra  → a still of the miniature world-map diorama
 *   2. kling-video v2.5-turbo pro (image-to-video) → the India→Australia flight
 *
 * The look references a travel-diorama style clip, but every frame here is
 * generated: no third-party footage, and no "Your Logo" placeholder anywhere.
 * Both prompts carry hard negatives against text, logos and livery markings.
 *
 *   node scripts/generate-hero-video.mjs --image-only     # stills, to review first
 *   node scripts/generate-hero-video.mjs --image-url <u>  # video from a chosen still
 *   node scripts/generate-hero-video.mjs                  # both stages
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("public/hero");
const IMAGE_MODEL = "fal-ai/flux-pro/v1.1-ultra";
/**
 * gpt-image-2 renders legible, correctly-spelled text where FLUX garbles it.
 * On a world map that flips from a liability to an asset: real place names read
 * as a real map, whereas FLUX's "Connalia"/"Iseriam India" read as AI slop.
 * Not in the typed client (v1.10.1 predates it), so it's called over raw REST.
 */
const IMAGE_MODEL_GPT = "fal-ai/gpt-image-2";
/** Caps at 10s, and takes `image_url`. */
const VIDEO_MODEL = "fal-ai/kling-video/v2.5-turbo/pro/image-to-video";
/**
 * Goes to 15s, but a different contract: `start_image_url` rather than
 * `image_url`, and `generate_audio` defaults to TRUE — which we don't want for a
 * silent scroll sequence (it only adds bytes). Chosen automatically when
 * duration exceeds 10.
 */
const VIDEO_MODEL_LONG = "fal-ai/kling-video/v3/pro/image-to-video";

/** Applied to both stages — the placeholder branding is the whole reason we regenerated. */
const NO_TEXT =
  "text, lettering, letters, words, writing, typography, logo, logotype, wordmark, " +
  "watermark, signage, labels, captions, subtitles, numbers, brand marks, " +
  "airline livery text, tail markings, decals, stickers";

/**
 * NOTE: flux-pro/v1.1-ultra accepts no `negative_prompt` — the field is silently
 * ignored. Everything we want *absent* has to be phrased as something present,
 * hence "blank unlabelled map" rather than "no text". An earlier pass that relied
 * on a negative came back with garbled place names and "India" on the fuselage.
 */
const IMAGE_PROMPT = [
  "Tilt-shift macro photograph of a miniature tabletop diorama on a warm oak desk:",
  "a large blank unlabelled political world map, its countries printed as smooth flat",
  "areas of pale green, sand and cream, entirely free of place names — a wordless",
  "map with clean empty landmasses and no writing, no labels and no legend.",
  "The Indian subcontinent sits in the upper left of frame and Australia in the lower",
  "right, with the open blue Indian Ocean stretching between them.",
  "Tiny scale models stand on the land: a small white marble domed monument with four",
  "slender towers and miniature palms on India, and a low red desert monolith beside a",
  "small white shell-roofed building on Australia.",
  "A miniature passenger airliner rests on the map over India, nose angled down toward",
  "Australia, moulded in one piece of smooth glossy blank white plastic — a bare",
  "unpainted model aircraft with pristine empty fuselage, wings and tail.",
  "Soft warm morning window light from the left, gentle shadows, little tufts of cotton",
  "cloud resting on the ocean, shallow depth of field, photoreal miniature model",
  "photography, 35mm, rich saturated map colours.",
].join(" ");

/**
 * Prompt history — both failures were about the camera, not the aircraft:
 *   v1: no destination named → plane took off from India and exited frame upward.
 *   v2: "camera pans and tilts down and right" → the camera panned clean off the
 *       map and Kling invented a whole second map with garbled place names.
 *
 * v3 locks the camera off. The aircraft does all the travelling, so there is no
 * off-map area for the model to hallucinate into.
 */
const VIDEO_PROMPT = [
  "The small white model airliner flies slowly from left to right, low over the bright",
  "blue ocean, travelling from India across towards Australia, then descends and",
  "settles gently onto the Australian landmass beside the red desert rock.",
  "Tiny cargo ships drift very slowly across the ocean and the miniature palm trees",
  "stir faintly.",
  "The camera creeps forward in one very slow, smooth, steady dolly push, staying low",
  "just above the surface of the map, keeping both India and Australia inside the",
  "frame the whole time. The camera does not pan and does not tilt — a forward push",
  "only, so the map always fills the frame.",
  "One continuous shot, no cuts, no new scenery, no title cards, no end card.",
].join(" ");

/**
 * Matched to the reference clip's actual look, which is a bright stylised 3D CGI
 * travel-diorama — NOT photoreal macro photography. Earlier passes read as moody
 * product photography: too dark, too sparse, camera too high. The traits that
 * matter are: clean CGI render, bright office daylight, vivid cyan ocean, many
 * small landmarks plus palm trees, and a low camera almost at map level.
 */
const GPT_IMAGE_PROMPT_CGI = [
  "A bright 3D rendered CGI miniature diorama, in the clean stylised look of an",
  "animated travel explainer video — a crisp computer render, not a photograph.",
  "A large vivid political world map poster lies flat on a light oak office desk,",
  "seen from a low camera angle just above the surface of the map so the map recedes",
  "into the distance. The ocean is bright saturated cyan blue and the countries are",
  "printed in cheerful pastel greens, sand and pinks.",
  "Detailed miniature landmark models and small palm trees stand up off the map",
  "across Asia and Australia: a white marble domed monument with four minarets on",
  "India, a tall slender glass skyscraper, a red sandstone tower, and on Australia a",
  "white shell-roofed opera house beside a red desert rock — plus scattered miniature",
  "palm trees and a few tiny cargo ships dotted on the ocean.",
  "The word INDIA is printed neatly on the Indian subcontinent and the word AUSTRALIA",
  "on the Australian landmass, both correctly spelled in small dark serif capitals.",
  "A small white model airliner flies low over the ocean between India and Australia,",
  "moulded in plain glossy blank white plastic with a completely bare fuselage, wings",
  "and tail — no livery, no logo, no lettering anywhere on it.",
  "Behind the desk, a soft out-of-focus bright office wall. Clean bright studio",
  "daylight, cheerful saturated colours, shallow depth of field tilt-shift miniature",
  "effect, polished 3D animation render.",
].join(" ");

/** Photoreal variant — kept for reference, superseded by the CGI prompt above. */
const GPT_IMAGE_PROMPT = [
  "Tilt-shift macro photograph of a miniature tabletop diorama on a warm oak desk:",
  "a printed world map, angled slightly away from camera, showing the Indian",
  "subcontinent in the upper left and Australia in the lower right with the blue",
  "Indian Ocean between them.",
  "The map carries only two clean printed labels, both correctly spelled in small",
  "neat dark blue serif capitals: the word INDIA on the Indian subcontinent, and the",
  "word AUSTRALIA on the Australian landmass. No other writing anywhere on the map.",
  "Tiny scale models stand on the land: a small white marble domed monument with four",
  "slender towers and miniature palms on India, and a low red desert monolith beside a",
  "small white shell-roofed building on Australia.",
  "A very small die-cast model airliner sits on the map just off the Indian coast,",
  "nose angled down toward Australia. It is tiny in scale — barely longer than the",
  "southern tip of India is wide, dwarfed by the landmasses around it, a small toy",
  "plane on a big map rather than a centrepiece.",
  "It is moulded in one piece of smooth glossy blank white plastic — a bare unpainted",
  "model aircraft with a pristine empty fuselage, wings and tail carrying no livery,",
  "no logo and no lettering of any kind.",
  "Soft warm morning window light from the left, gentle shadows, little tufts of cotton",
  "cloud resting on the ocean, shallow depth of field, photoreal miniature model",
  "photography, rich saturated map colours.",
].join(" ");

function parseArgs(argv) {
  const args = {
    imageOnly: false,
    imageUrl: null,
    duration: "10",
    candidates: 2,
    model: "flux",
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--image-only") args.imageOnly = true;
    else if (argv[i] === "--image-url") args.imageUrl = argv[i + 1];
    else if (argv[i] === "--duration") args.duration = argv[i + 1];
    else if (argv[i] === "--candidates") args.candidates = Number(argv[i + 1]);
    else if (argv[i] === "--model") args.model = argv[i + 1];
    else if (argv[i] === "--resume") args.resume = argv[i + 1];
  }
  if (args.model !== "flux" && args.model !== "gpt") {
    throw new Error(`--model must be flux or gpt (got "${args.model}")`);
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

/**
 * Parses a fal response, surfacing the HTTP status and body on failure.
 * A bare `.json()` here turns any non-JSON reply into "Unexpected end of JSON
 * input", which hides the real cause — a 405 from a wrongly-built poll URL.
 */
async function safeJson(response, what) {
  const text = await response.text();
  if (!text) {
    throw new Error(`${what}: empty body (HTTP ${response.status})`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `${what}: non-JSON body (HTTP ${response.status}): ${text.slice(0, 200)}`,
    );
  }
}

/**
 * Queue status lives under the *base* app id, not the full endpoint path:
 * fal-ai/kling-video/requests/… , never fal-ai/kling-video/v2.5-turbo/pro/…
 * The latter returns 405 with an empty body.
 */
function baseAppId(model) {
  return model.split("/").slice(0, 2).join("/");
}

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download failed: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
  return buffer.length;
}

async function makeStills(key, count, model) {
  const useGpt = model === "gpt";
  const endpoint = useGpt ? IMAGE_MODEL_GPT : IMAGE_MODEL;
  console.log(`→ stage 1: ${count} candidate still(s) via ${endpoint}`);

  const urls = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const body = useGpt
        ? {
            prompt: GPT_IMAGE_PROMPT_CGI,
            image_size: "landscape_16_9",
            quality: "high",
            num_images: 1,
            output_format: "jpeg",
          }
        : {
            prompt: IMAGE_PROMPT,
            // No negative_prompt here — this endpoint ignores it (see IMAGE_PROMPT note).
            aspect_ratio: "16:9",
            num_images: 1,
            output_format: "jpeg",
            // Vary per candidate so the stills differ.
            seed: 1000 + i * 7919,
          };

      const response = await fetch(`https://fal.run/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.detail ?? `${response.status}`);

      const url = payload?.images?.[0]?.url;
      if (!url) throw new Error("no image returned");

      const dest = path.join(OUT_DIR, `${model}-${i + 1}.jpg`);
      const bytes = await download(url, dest);
      console.log(`  ✓ ${model}-${i + 1}.jpg  (${Math.round(bytes / 1024)} KB)`);
      return url;
    }),
  );

  return urls;
}

async function makeVideo(key, imageUrl, duration, resumeId) {
  const auth = { Authorization: `Key ${key}` };
  let statusUrl;
  let responseUrl;

  if (resumeId) {
    console.log(`→ stage 2: resuming request ${resumeId}`);
    const base = `https://queue.fal.run/${baseAppId(VIDEO_MODEL)}/requests/${resumeId}`;
    statusUrl = `${base}/status`;
    responseUrl = base;
  } else {
    // Only v3 goes past 10s, and it wants a different field name.
    const long = Number(duration) > 10;
    const model = long ? VIDEO_MODEL_LONG : VIDEO_MODEL;
    const negative = `${NO_TEXT}, distortion, warping, morphing, flicker, cuts, hard transitions`;

    console.log(`→ stage 2: ${duration}s video via ${model}`);

    const submit = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(
        long
          ? {
              prompt: VIDEO_PROMPT,
              start_image_url: imageUrl,
              duration,
              negative_prompt: negative,
              // Silent scroll sequence — audio would only add weight.
              generate_audio: false,
            }
          : {
              prompt: VIDEO_PROMPT,
              image_url: imageUrl,
              duration,
              negative_prompt: negative,
            },
      ),
    });

    const queued = await safeJson(submit, "submit");
    if (!submit.ok) throw new Error(queued?.detail ?? `submit failed: ${submit.status}`);

    console.log(`  queued: ${queued.request_id}`);
    console.log(`  resume with: --resume ${queued.request_id}`);

    // Use the URLs fal hands back rather than building them — the status route
    // sits under the base app id, and guessing it returns a bodyless 405.
    statusUrl = queued.status_url;
    responseUrl = queued.response_url;
  }

  // Kling takes minutes; poll rather than holding a long request open.
  for (let attempt = 0; attempt < 150; attempt += 1) {
    await new Promise((r) => setTimeout(r, 6000));

    const statusRes = await fetch(statusUrl, { headers: auth });
    const status = await safeJson(statusRes, "status");

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(responseUrl, { headers: auth });
      const result = await safeJson(resultRes, "result");
      const url = result?.video?.url;
      if (!url) throw new Error(`no video in result: ${JSON.stringify(result)}`);

      const dest = path.join(OUT_DIR, "hero.mp4");
      const bytes = await download(url, dest);
      console.log(`  ✓ hero.mp4  (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
      console.log(`\nNext: npm run gen:frames -- --file public/hero/hero.mp4 --frames 150`);
      return dest;
    }

    if (status.status === "FAILED" || status.error) {
      throw new Error(`generation failed: ${JSON.stringify(status)}`);
    }

    if (attempt % 5 === 0) {
      console.log(`  …${status.status} (${(attempt + 1) * 6}s elapsed)`);
    }
  }

  throw new Error("timed out waiting for the video (15 min)");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = await loadKey();
  await mkdir(OUT_DIR, { recursive: true });

  let imageUrl = args.imageUrl;

  // Resuming attaches to an in-flight job; no still needed.
  if (args.resume) {
    await makeVideo(key, null, args.duration, args.resume);
    return;
  }

  if (!imageUrl) {
    const urls = await makeStills(key, args.candidates, args.model);
    imageUrl = urls[0];
    if (args.imageOnly) {
      console.log(`\n✓ stills in public/hero/. Review, then run:`);
      urls.forEach((u, i) => console.log(`   ${args.model}-${i + 1}: ${u}`));
      return;
    }
  }

  await makeVideo(key, imageUrl, args.duration);
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
