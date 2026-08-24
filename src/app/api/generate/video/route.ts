import { NextResponse } from "next/server";

import { MODELS, fal } from "@/lib/fal";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  prompt?: string;
  imageUrl?: string;
  duration?: "5" | "10";
  negativePrompt?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  const imageUrl = body.imageUrl?.trim();

  if (!prompt || !imageUrl) {
    return NextResponse.json(
      { error: "prompt and imageUrl are both required" },
      { status: 400 },
    );
  }

  try {
    const result = await fal.subscribe(MODELS.scrollVideo, {
      input: {
        prompt,
        image_url: imageUrl,
        duration: body.duration ?? "5",
        negative_prompt:
          body.negativePrompt ??
          "blur, distortion, warping, text, watermark, extra limbs",
      },
      logs: false,
    });

    const data = result.data as { video?: { url: string } };
    const url = data.video?.url;
    if (!url) {
      return NextResponse.json(
        { error: "Model returned no video", raw: result.data },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url,
      requestId: result.requestId,
      model: MODELS.scrollVideo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
