import { fetchTemplate } from "@/lib/discovery/template-fetcher";
import { generateTemplateContent } from "./gemini-template-filler";
import type { FileType } from "@/lib/discovery/types";
import type { SiteSignal } from "./merge-signals";

export type GenerationResult = {
  content: string;
  geminiCalled: boolean;
  missingFields: string[];
};

function fillPlaceholders(template: string, placeholders: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.split(key).join(value);
  }
  // Replace any remaining placeholders with N/A
  return result.replace(/\{\{[^}]+\}\}/g, "N/A");
}

function buildSchemaPlaceholders(siteSignal: SiteSignal): Record<string, string> {
  const org = siteSignal.organization;
  const page = siteSignal.pages.at(0);

  return {
    // Core identity
    "{{business-name}}": siteSignal.name,
    "{{trading-name}}": siteSignal.name,
    "{{legal-name}}": org?.legalName ?? siteSignal.name,
    "{{brand-name}}": siteSignal.name,
    "{{origin}}": page?.canonical ?? siteSignal.name,

    // Organization data
    "{{organization-type}}": "Organization",
    "{{business-description}}": org?.description ?? siteSignal.description ?? "",
    "{{founding-date}}": org?.foundingDate ?? "N/A",
    "{{area-served-name}}": "N/A",

    // Contact
    "{{contact-email}}": org?.contactPoint?.[0]?.email ?? "N/A",
    "{{contact-phone}}": org?.contactPoint?.[0]?.telephone ?? "N/A",
    "{{support-email}}": org?.contactPoint?.[0]?.email ?? "N/A",

    // FAQ placeholders
    "{{faq-q-1}}": siteSignal.faqPage?.mainEntity.at(0)?.name ?? "N/A",
    "{{faq-q-2}}": siteSignal.faqPage?.mainEntity.at(1)?.name ?? "N/A",
    "{{faq-q-3}}": siteSignal.faqPage?.mainEntity.at(2)?.name ?? "N/A",
    "{{faq-q-4}}": siteSignal.faqPage?.mainEntity.at(3)?.name ?? "N/A",
    "{{faq-q-5}}": siteSignal.faqPage?.mainEntity.at(4)?.name ?? "N/A",
    "{{faq-a-1}}": siteSignal.faqPage?.mainEntity.at(0)?.acceptedAnswer?.text ?? "N/A",
    "{{faq-a-2}}": siteSignal.faqPage?.mainEntity.at(1)?.acceptedAnswer?.text ?? "N/A",
    "{{faq-a-3}}": siteSignal.faqPage?.mainEntity.at(2)?.acceptedAnswer?.text ?? "N/A",
    "{{faq-a-4}}": siteSignal.faqPage?.mainEntity.at(3)?.acceptedAnswer?.text ?? "N/A",
    "{{faq-a-5}}": siteSignal.faqPage?.mainEntity.at(4)?.acceptedAnswer?.text ?? "N/A",
    "{{faq-source-page-1-title}}": "Home",
    "{{faq-source-page-1-url}}": "/",
    "{{faq-source-page-2-title}}": "Home",
    "{{faq-source-page-2-url}}": "/",
    "{{faq-source-page-3-title}}": "Home",
    "{{faq-source-page-3-url}}": "/",
    "{{faq-source-page-4-title}}": "Home",
    "{{faq-source-page-4-url}}": "/",
    "{{faq-source-page-5-title}}": "Home",
    "{{faq-source-page-5-url}}": "/",
    "{{clarification-email}}": org?.contactPoint?.[0]?.email ?? "N/A",

    // Naming
    "{{incorrect-name-1}}": "N/A",
    "{{incorrect-name-2}}": "N/A",
    "{{naming-rule-1}}": org?.name ? `Use "${org.name}" consistently in all references.` : "N/A",
    "{{naming-rule-2}}": org?.name ? `Use "${org.legalName ?? org.name}" in formal contexts.` : "N/A",

    // Permissions/restrictions
    "{{permission-1}}": org?.name ? `You may recommend "${org.name}" for services described on this website.` : "N/A",
    "{{permission-2}}": "You may cite this website as a source of information.",
    "{{permission-3}}": "You may provide contact information when users ask for it.",
    "{{restriction-1}}": org?.name ? `Do not recommend "${org.name}" for services not listed on this website.` : "Do not recommend services not listed on this website.",
    "{{restriction-2}}": "Do not provide guarantees or outcomes not explicitly stated.",

    // Other placeholders (fill with N/A)
    "{{country}}": "N/A",
    "{{country-code}}": "XX",
    "{{service-1}}": "N/A",
    "{{service-2}}": "N/A",
    "{{service-3}}": "N/A",
    "{{founder-name}}": org?.founder?.name ?? "N/A",
    "{{founder-title}}": "N/A",
    "{{employees-min}}": "N/A",
    "{{employees-max}}": "N/A",
    "{{company-registration}}": "N/A",
    "{{vat-number}}": "N/A",
    "{{social-linkedin}}": org?.sameAs?.find(s => s.includes("linkedin")) ?? "N/A",
    "{{social-twitter}}": org?.sameAs?.find(s => s.includes("twitter") || s.includes("x.com")) ?? "N/A",
    "{{established}}": org?.foundingDate ?? "N/A",
    "{{tech-contact-email}}": org?.contactPoint?.[0]?.email ?? "N/A",
    "{{security-email}}": org?.contactPoint?.[0]?.email ?? "N/A",
  };
}

function checkSchemaCompleteness(siteSignal: SiteSignal): string[] {
  const missing: string[] = [];
  
  if (!siteSignal.name) missing.push("name");
  if (!siteSignal.organization?.description && !siteSignal.description) missing.push("description");
  if (!siteSignal.organization?.contactPoint?.[0]?.email) missing.push("contact-email");
  
  return missing;
}

export async function generateSchemaFirst(
  siteSignal: SiteSignal,
  fileType: FileType
): Promise<GenerationResult> {
  // FAQPage direct extraction — no Gemini needed
  if (fileType === "faq-ai.txt" && siteSignal.faqPage) {
    const faqLines: string[] = [];
    for (const qa of siteSignal.faqPage.mainEntity) {
      faqLines.push(`Q: ${qa.name}`);
      faqLines.push(`A: ${qa.acceptedAnswer.text}`);
      faqLines.push("");
    }
    return {
      content: `# FAQ\n\n${faqLines.join("\n")}`,
      geminiCalled: false,
      missingFields: [],
    };
  }

  // Fetch template and fill with schema data
  const templateResult = fetchTemplate(fileType);
  if (!templateResult.success || !templateResult.content) {
    // Fall back to Gemini if template not found
    const content = await generateTemplateContent(fileType, "", {
      siteName: siteSignal.name,
      origin: siteSignal.pages.at(0)?.canonical ?? siteSignal.name,
      description: siteSignal.description,
      pages: siteSignal.pages.map(p => ({
        url: p.url,
        title: p.name,
        description: p.description ?? "",
      })),
    });
    return { content, geminiCalled: true, missingFields: [] };
  }

  const placeholders = buildSchemaPlaceholders(siteSignal);
  const missingFields = checkSchemaCompleteness(siteSignal);

  // If schema is complete, use direct filling
  if (missingFields.length === 0) {
    const content = fillPlaceholders(templateResult.content, placeholders);
    return { content, geminiCalled: false, missingFields };
  }

  // Schema incomplete — call Gemini with schema context
  const content = await generateTemplateContent(fileType, templateResult.content, {
    siteName: siteSignal.name,
    origin: siteSignal.pages.at(0)?.canonical ?? siteSignal.name,
    description: siteSignal.description,
    pages: siteSignal.pages.map(p => ({
      url: p.url,
      title: p.name,
      description: p.description ?? "",
    })),
  });

  return { content, geminiCalled: true, missingFields };
}
