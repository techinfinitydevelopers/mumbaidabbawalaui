import "server-only";

import { fal } from "@fal-ai/client";

/**
 * Endpoints are pinned here so a model swap is a one-line change.
 * All ids verified against queue.fal.run.
 */
export const MODELS = {
  /** Hero + gallery food stills. Strong photoreal lighting, good with texture. */
  foodImage: "fal-ai/flux-pro/v1.1-ultra",
  /** Cheaper/faster alternative for iterating on prompts. */
  foodImageFast: "fal-ai/nano-banana",
  /** Image-to-video for the scroll sequence source clip. */
  scrollVideo: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
} as const;

let configured = false;

/**
 * Configures the client on first use and returns it.
 *
 * The key check and `fal.config()` are deliberately NOT at module scope. Next
 * imports every route module during `next build` to collect its exported
 * config, so a module-scope throw for a missing `FAL_KEY` fails the entire
 * build on any host that does not have the variable — which is exactly how the
 * Vercel deploy broke ("Failed to collect configuration for
 * /api/generate/image").
 *
 * Requiring the key at build time was never right anyway: nothing the site
 * serves calls FAL. Every image and the hero clip are generated ahead of time
 * by `new-WT/scripts/generate-assets.mjs` and committed. Only an actual request
 * to a generate route needs credentials, so only that path asks for them.
 */
export function getFal() {
  if (!configured) {
    const key = process.env.FAL_KEY;
    if (!key) {
      throw new Error(
        "FAL_KEY is missing. Add it to .env.local (or the host's environment) to use the generate routes.",
      );
    }
    fal.config({ credentials: key });
    configured = true;
  }
  return fal;
}
