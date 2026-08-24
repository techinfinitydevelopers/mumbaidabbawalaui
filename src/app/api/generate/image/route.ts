import { NextResponse } from "next/server";

import { MODELS, getFal } from "@/lib/fal";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  prompt?: string;
  aspectRatio?: string;
  fast?: boolean;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const model = body.fast ? MODELS.foodImageFast : MODELS.foodImage;

  try {
    /* Credentials are resolved here, not at import time: the module has to be
       importable without FAL_KEY or `next build` cannot collect this route's
       config. A missing key now surfaces as this request's 500. */
    const fal = getFal();
    const result = await fal.subscribe(model, {
      input: {
        prompt,
        aspect_ratio: body.aspectRatio ?? "3:4",
        num_images: 1,
        output_format: "jpeg",
      },
      logs: false,
    });

    const data = result.data as { images?: { url: string }[] };
    const url = data.images?.[0]?.url;
    if (!url) {
      return NextResponse.json(
        { error: "Model returned no image", raw: result.data },
        { status: 502 },
      );
    }

    return NextResponse.json({ url, requestId: result.requestId, model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
