#!/usr/bin/env node
/**
 * Turns a source video into a scroll-scrubbable JPEG sequence.
 *
 *   node scripts/extract-frames.mjs --url "https://v3.fal.media/files/.../out.mp4"
 *   node scripts/extract-frames.mjs --file ./source.mp4 --frames 180 --width 1600
 *
 * Writes public/frames/frame-0001.jpg … and public/frames/manifest.json.
 * The manifest is what <ScrollFrames /> reads at runtime.
 */

import { execFile } from "node:child_process";
import { mkdir, readdir, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const OUT_DIR = path.resolve("public/frames");
const TMP_DIR = path.resolve(".frame-cache");

function parseArgs(argv) {
  // width 0 = keep the source width. Upscaling only inflates bytes; the canvas
  // scales to fit anyway, so never extract larger than the source.
  const args = { frames: 150, width: 0, quality: null, format: "webp" };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--url") args.url = value;
    else if (key === "--file") args.file = value;
    else if (key === "--frames") args.frames = Number(value);
    else if (key === "--width") args.width = Number(value);
    else if (key === "--quality") args.quality = Number(value);
    else if (key === "--format") args.format = value;
  }
  if (args.format !== "webp" && args.format !== "jpg") {
    throw new Error(`--format must be webp or jpg (got "${args.format}")`);
  }
  // webp quality is 0-100 (higher = better); mjpeg -q:v is 1-31 (lower = better).
  if (args.quality === null) args.quality = args.format === "webp" ? 78 : 4;
  return args;
}

async function ensureTool(tool) {
  try {
    await run(tool, ["-version"]);
  } catch {
    throw new Error(`${tool} not found on PATH. Install it: brew install ffmpeg`);
  }
}

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
  return dest;
}

async function probe(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,r_frame_rate:format=duration",
    "-of", "json",
    file,
  ]);
  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0] ?? {};
  const [num, den] = String(stream.r_frame_rate ?? "30/1").split("/").map(Number);
  return {
    width: stream.width,
    height: stream.height,
    fps: den ? num / den : 30,
    duration: Number(parsed.format?.duration ?? 0),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.url && !args.file) {
    console.error("Provide --url <video-url> or --file <path-to-video>");
    process.exit(1);
  }

  await ensureTool("ffmpeg");
  await ensureTool("ffprobe");

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  let source = args.file ? path.resolve(args.file) : path.join(TMP_DIR, "source.mp4");
  if (args.url) {
    console.log("→ downloading source video…");
    source = await download(args.url, source);
  }

  const meta = await probe(source);
  if (!meta.duration) throw new Error("Could not read video duration.");
  console.log(
    `→ source: ${meta.width}x${meta.height} @ ${meta.fps.toFixed(2)}fps, ${meta.duration.toFixed(2)}s`,
  );

  // Sample evenly across the clip so scroll distance maps linearly to time.
  const targetFps = args.frames / meta.duration;
  const width = args.width || meta.width;
  if (args.width && args.width > meta.width) {
    console.warn(
      `! --width ${args.width} exceeds source width ${meta.width}; upscaling adds bytes, not detail.`,
    );
  }
  const ext = args.format;
  console.log(
    `→ extracting ~${args.frames} frames at ${width}px ${ext} (${targetFps.toFixed(2)} fps sample)…`,
  );

  // ffmpeg on macOS/Homebrew ships without a webp encoder, so always write JPEG
  // here and hand off to cwebp when webp output was requested.
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error",
    "-i", source,
    "-vf", `fps=${targetFps},scale=${width}:-2:flags=lanczos`,
    "-q:v", ext === "webp" ? "2" : String(args.quality),
    path.join(OUT_DIR, "frame-%04d.jpg"),
  ]);

  if (ext === "webp") {
    await ensureTool("cwebp");
    const jpgs = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".jpg")).sort();
    console.log(`→ converting ${jpgs.length} frames to webp (q${args.quality})…`);

    // Bounded concurrency — one cwebp process per core saturates without thrashing.
    const pool = 8;
    let cursor = 0;
    await Promise.all(
      Array.from({ length: pool }, async () => {
        while (cursor < jpgs.length) {
          const file = jpgs[cursor++];
          const src = path.join(OUT_DIR, file);
          await run("cwebp", [
            "-quiet",
            "-q", String(args.quality),
            src,
            "-o", src.replace(/\.jpg$/, ".webp"),
          ]);
          await unlink(src);
        }
      }),
    );
  }

  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(`.${ext}`)).sort();
  if (!files.length) throw new Error("ffmpeg produced no frames.");

  const first = await probe(path.join(OUT_DIR, files[0]));

  const manifest = {
    count: files.length,
    width: first.width ?? width,
    height: first.height ?? null,
    pattern: `/frames/frame-%04d.${ext}`,
    sourceDuration: meta.duration,
    sourceFps: meta.fps,
  };

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await rm(TMP_DIR, { recursive: true, force: true });

  console.log(`✓ ${files.length} frames → public/frames/`);
  console.log(`✓ manifest written (${manifest.width}x${manifest.height})`);
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
