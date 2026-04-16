import { NextRequest, NextResponse } from "next/server";
import { generateLlmsTxt, type GeneratorInput } from "@/lib/generator";
import { z } from "zod";

const GenerateInput = z.object({
  url: z.string().url("Invalid URL"),
  maxUrls: z.number().int().min(1).max(200).optional().default(50),
  includePaths: z.array(z.string()).optional().default([]),
  excludePaths: z.array(z.string()).optional().default([]),
});

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateInput.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input: GeneratorInput = parsed.data;

    const result = await generateLlmsTxt(input);

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[/api/generate]", message);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
