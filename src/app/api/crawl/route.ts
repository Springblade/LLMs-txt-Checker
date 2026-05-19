import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/generator";
import { getOrCrawlSite, buildDescription } from "@/lib/generator/site-crawl-cache";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url } = body as { url?: unknown };

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let origin: string;
  try {
    const parsed = new URL(url.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "URL must use http or https protocol" },
        { status: 400 }
      );
    }
    origin = parsed.origin;
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const result = await getOrCrawlSite(origin, async () => {
      const crawl = await crawlWebsite(origin);
      const description = buildDescription(crawl.pages, crawl.origin, crawl.siteName);
      return { ...crawl, description };
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[api/crawl]", message, e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
