import type { CrawledData, FileType } from "./types";

function getPlaceholders(data: CrawledData): Record<string, string> {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const year = today.split("-")[0] ?? "";
  const siteName = data.brandName || data.siteName || "";

  return {
    "[Your Business Name]": siteName,
    "[Your Brand Name]": siteName,
    "[Your Legal Business Name]": siteName,
    "[Your Trading Name]": siteName,
    "[Your Official Registered Business Name]": siteName,
    "[Your Legal Business Name Ltd]": `${siteName} Ltd`,
    "[Your Website]": siteName,
    "[Your Company]": siteName,
    "[https://www.yourwebsite.com/]": data.origin.endsWith("/") ? data.origin : `${data.origin}/`,
    "[https://www.yourwebsite.com]": data.origin,
    "[YYYY-MM-DD]": today,
    "[YYYY]": year,
    "[Service 1 description]": data.pages?.[0]?.title ?? `${siteName} services`,
    "[Service 2 description]": data.pages?.[1]?.title ?? `${siteName} consulting`,
    "[Service 3 description]": data.pages?.[2]?.title ?? `${siteName} advisory`,
    "[Service Name 1]": data.pages?.[0]?.title ?? `${siteName} Service 1`,
    "[Service Name 2]": data.pages?.[1]?.title ?? `${siteName} Service 2`,
    "[Service Name 3]": data.pages?.[2]?.title ?? `${siteName} Service 3`,
    "[email@yourwebsite.com]": data.email ?? "hello@example.com",
    "[+44 XXXX XXXXXX]": "+44 161 000 0000",
    "[Company Name]": siteName,
  };
}

export function fillTemplate(fileType: FileType, data: CrawledData, rawTemplate: string): string {
  const placeholders = getPlaceholders(data);

  let content = rawTemplate;

  for (const [placeholder, value] of Object.entries(placeholders)) {
    content = content.split(placeholder).join(value);
  }

  if (fileType === "llms.html") {
    content = stripHtmlGuidanceComments(content);
  }

  return content;
}

function stripHtmlGuidanceComments(html: string): string {
  // Strip the HTML guidance comment block (starts with <!--\n=====)
  return html.replace(/<!--\n={10,}[\s\S]*?-->/, "");
}
