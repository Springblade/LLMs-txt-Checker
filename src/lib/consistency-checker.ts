export type ConsistencySeverity = "error" | "warning";

export interface ConsistencySource {
  file: string;
  value: string | null;
  match: boolean;
}

export interface ConsistencyCheck {
  field: string;
  label: string;
  sources: ConsistencySource[];
  severity: ConsistencySeverity;
}

export interface ConsistencyResult {
  checks: ConsistencyCheck[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
  };
}

function extractFromLlmsTxt(content: string): string | null {
  // Extract the H1 title
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1]?.trim() ?? null : null;
}

function extractUrlFromLlmsTxt(content: string): string | null {
  // Extract first Markdown link URL
  const match = content.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
  return match ? match[2]?.trim() ?? null : null;
}

function extractContactFromLlmsTxt(content: string): string | null {
  // Extract email from ## Contact or similar section
  const lines = content.split("\n");
  for (const line of lines) {
    const emailMatch = line.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) return emailMatch[0] ?? null;
  }
  return null;
}

function extractFromIdentityJson(content: string): Record<string, string | null> {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : null,
      url: typeof parsed.url === "string" ? parsed.url : null,
      email: typeof parsed.email === "string" ? parsed.email : null,
    };
  } catch {
    return { name: null, url: null, email: null };
  }
}

function extractFromAiTxt(content: string): Record<string, string | null> {
  // Extract from [identity] section
  const identitySection = content.match(
    /^\[identity\]\s*\n([\s\S]*?)(?=^\[|\z)/im
  );
  if (!identitySection) return { name: null, url: null, email: null };

  const block = identitySection[1] ?? "";
  const result: Record<string, string | null> = { name: null, url: null, email: null };

  const nameMatch = block.match(/^\s*name\s*=\s*(.+)/im);
  if (nameMatch) result.name = nameMatch[1]?.trim() ?? null;

  const urlMatch = block.match(/^\s*url\s*=\s*(.+)/im);
  if (urlMatch) result.url = urlMatch[1]?.trim() ?? null;

  const emailMatch = block.match(/^\s*email\s*=\s*(.+)/im);
  if (emailMatch) result.email = emailMatch[1]?.trim() ?? null;

  return result;
}

function extractFromBrandTxt(content: string): string | null {
  const match = content.match(/^brand-name\s*:\s*(.+)/im);
  return match ? match[1]?.trim() ?? null : null;
}

function extractFromDeveloperAiTxt(content: string): string | null {
  // Extract project name from first heading
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1]?.trim() ?? null : null;
}

function extractFromLlmsHtml(content: string): Record<string, string | null> {
  const result: Record<string, string | null> = { name: null, url: null };

  // Extract og:title
  const ogTitleMatch = content.match(
    /<meta[^>]+property\s*=\s*["']og:title["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i
  ) ?? content.match(
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+property\s*=\s*["']og:title["'][^>]*>/i
  );
  if (ogTitleMatch) result.name = ogTitleMatch[1]?.trim() ?? null;

  // Extract og:url
  const ogUrlMatch = content.match(
    /<meta[^>]+property\s*=\s*["']og:url["'][^>]+content\s*=\s*["']([^"']+)["'][^>]*>/i
  ) ?? content.match(
    /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+property\s*=\s*["']og:url["'][^>]*>/i
  );
  if (ogUrlMatch) result.url = ogUrlMatch[1]?.trim() ?? null;

  // Extract title tag
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && !result.name) result.name = titleMatch[1]?.trim() ?? null;

  return result;
}

function buildCheck(
  field: string,
  label: string,
  sources: ConsistencySource[],
  severity: ConsistencySeverity
): ConsistencyCheck {
  return { field, label, sources, severity };
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function valuesMatch(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return false;
  return normalize(a) === normalize(b);
}

export interface FetchedFile {
  name: string;
  content: string;
}

export function checkConsistency(files: FetchedFile[]): ConsistencyResult {
  const checks: ConsistencyCheck[] = [];

  // Build a map: file name -> extracted values
  const extracted: Record<string, Record<string, string | null>> = {};

  for (const file of files) {
    switch (file.name) {
      case "llms.txt":
        extracted["llms.txt"] = {
          name: extractFromLlmsTxt(file.content),
          url: extractUrlFromLlmsTxt(file.content),
          email: extractContactFromLlmsTxt(file.content),
        };
        break;
      case "identity.json":
        extracted["identity.json"] = extractFromIdentityJson(file.content);
        break;
      case "ai.txt":
        extracted["ai.txt"] = extractFromAiTxt(file.content);
        break;
      case "brand.txt":
        extracted["brand.txt"] = {
          name: extractFromBrandTxt(file.content),
        };
        break;
      case "developer-ai.txt":
        extracted["developer-ai.txt"] = {
          name: extractFromDeveloperAiTxt(file.content),
        };
        break;
      case "llms.html":
        extracted["llms.html"] = extractFromLlmsHtml(file.content);
        break;
      default:
        break;
    }
  }

  const filesWithName = files.filter((f) => extracted[f.name]?.name !== null);
  if (filesWithName.length >= 2) {
    const sources: ConsistencySource[] = filesWithName.map((f) => ({
      file: f.name,
      value: extracted[f.name]?.name ?? null,
      match: true,
    }));
    const ref = sources[0]?.value ?? "";
    for (const s of sources) {
      s.match = valuesMatch(s.value, ref);
    }
    const hasMismatch = sources.some((s) => !s.match);
    checks.push(
      buildCheck(
        "companyName",
        "Company / Project Name",
        sources,
        hasMismatch ? "warning" : "warning"
      )
    );
  }

  const filesWithUrl = files.filter((f) => extracted[f.name]?.url !== null);
  if (filesWithUrl.length >= 2) {
    const sources: ConsistencySource[] = filesWithUrl.map((f) => ({
      file: f.name,
      value: extracted[f.name]?.url ?? null,
      match: true,
    }));
    const ref = sources[0]?.value ?? "";
    for (const s of sources) {
      s.match = valuesMatch(s.value, ref);
    }
    const hasMismatch = sources.some((s) => !s.match);
    checks.push(
      buildCheck(
        "url",
        "Canonical URL",
        sources,
        hasMismatch ? "error" : "warning"
      )
    );
  }

  const filesWithEmail = files.filter((f) => extracted[f.name]?.email !== null);
  if (filesWithEmail.length >= 2) {
    const sources: ConsistencySource[] = filesWithEmail.map((f) => ({
      file: f.name,
      value: extracted[f.name]?.email ?? null,
      match: true,
    }));
    const ref = sources[0]?.value ?? "";
    for (const s of sources) {
      s.match = valuesMatch(s.value, ref);
    }
    const hasMismatch = sources.some((s) => !s.match);
    checks.push(
      buildCheck(
        "email",
        "Contact Email",
        sources,
        hasMismatch ? "error" : "warning"
      )
    );
  }

  const total = checks.length;
  const errors = checks.filter((c) => c.severity === "error").length;
  const warnings = checks.filter((c) => c.severity === "warning").length;

  return {
    checks,
    summary: { total, errors, warnings },
  };
}
