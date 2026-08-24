import "server-only";

import { fal } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY is missing. Add it to .env.local");
}

fal.config({ credentials: process.env.FAL_KEY });

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

export { fal };
