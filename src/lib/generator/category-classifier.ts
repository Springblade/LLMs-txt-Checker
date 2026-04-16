import type { PageCategory } from "./types";

export function classifyPage(url: string, title?: string): PageCategory {
  const pathname = new URL(url).pathname.toLowerCase();
  const combined = `${pathname} ${title ?? ""}`.toLowerCase();

  if (/docs?|guide|tutorial|getting-started|quickstart/i.test(combined)) {
    return "documentation";
  }
  if (/blog|post|article|news/i.test(combined)) {
    return "blog";
  }
  if (/api|reference|endpoints?|swagger|openapi/i.test(combined)) {
    return "api-reference";
  }
  if (/pricing|billing|cost|plans?/i.test(combined)) {
    return "pricing";
  }
  if (/about|company|team|history/i.test(combined)) {
    return "about";
  }
  if (/contact|support|help|faq/i.test(combined)) {
    return "contact";
  }
  if (/privacy|terms|legal|cookies|license/i.test(combined)) {
    return "legal";
  }

  return "other";
}

export function getCategoryLabel(category: PageCategory): string {
  const labels: Record<PageCategory, string> = {
    documentation: "Documentation",
    blog: "Blog Post",
    "api-reference": "API Reference",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    legal: "Legal",
    other: "Page",
  };
  return labels[category];
}
