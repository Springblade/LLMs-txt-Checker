import { NextRequest, NextResponse } from "next/server";
import { generateLlmsTxt, type GeneratorInput } from "@/lib/generator";
import { generateFile } from "@/lib/discovery/file-generators";
import { z } from "zod";

const FileTypeEnum = z.enum([
  "llms.txt",
  "llm.txt",
  "ai.txt",
  "brand.txt",
  "faq-ai.txt",
  "developer-ai.txt",
  "llms.html",
  "robots-ai.txt",
  "identity.json",
  "ai.json",
]);

const GenerateInput = z.object({
  url: z.string().url("Invalid URL"),
  fileType: FileTypeEnum.optional(),
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

    const { url, fileType } = parsed.data;

    if (fileType) {
      const result = await generateFile(fileType, url);
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }

    const input: GeneratorInput = { url, maxUrls: 50 };
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
