export type OrganizationSchema = {
  name?: string;
  url?: string;
  legalName?: string;
  alternateName?: string[];
  description?: string;
  foundingDate?: string;
  contactPoint?: Array<{ email?: string; telephone?: string; contactType?: string }>;
  sameAs?: string[];
  founder?: { name?: string };
};

export type FAQPageSchema = {
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
};

export type WebSiteSchema = {
  name?: string;
  url?: string;
  description?: string;
};

export type ExtractedSchema = {
  organization?: OrganizationSchema;
  faqPage?: FAQPageSchema;
  website?: WebSiteSchema;
  rawJsonLd: unknown[];
};

export type StructuredDataResult = ExtractedSchema & {
  url: string;
};

const JSON_LD_REGEX = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function flattenGraph(entity: unknown): unknown[] {
  if (typeof entity !== "object" || entity === null) return [entity];
  const obj = entity as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    const result: unknown[] = [];
    for (const item of obj["@graph"] as unknown[]) {
      result.push(...flattenGraph(item));
    }
    return result;
  }
  return [entity];
}

function selectOrganization(entities: unknown[]): OrganizationSchema | undefined {
  const orgs = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "Organization"
  );
  if (orgs.length === 0) return undefined;
  return orgs.at(0) as OrganizationSchema | undefined;
}

function selectFaqPage(entities: unknown[]): FAQPageSchema | undefined {
  const faqs = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "FAQPage"
  );
  if (faqs.length === 0) return undefined;
  const faq = faqs.at(0) as Record<string, unknown> | undefined;
  if (!faq) return undefined;
  return { mainEntity: (faq["mainEntity"] as FAQPageSchema["mainEntity"]) ?? [] };
}

function selectWebsite(entities: unknown[]): WebSiteSchema | undefined {
  const sites = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "WebSite"
  );
  if (sites.length === 0) return undefined;
  return sites.at(0) as WebSiteSchema | undefined;
}

export function extractStructuredData(html: string): ExtractedSchema {
  const rawJsonLd: unknown[] = [];
  let match: RegExpExecArray | null;

  JSON_LD_REGEX.lastIndex = 0;
  while ((match = JSON_LD_REGEX.exec(html)) !== null) {
    const content = match[1];
    if (!content) continue;

    try {
      const parsed = JSON.parse(content);
      const entities = flattenGraph(parsed);
      rawJsonLd.push(...entities);
    } catch {
      // Malformed JSON-LD — skip
    }
  }

  return {
    organization: selectOrganization(rawJsonLd),
    faqPage: selectFaqPage(rawJsonLd),
    website: selectWebsite(rawJsonLd),
    rawJsonLd,
  };
}
