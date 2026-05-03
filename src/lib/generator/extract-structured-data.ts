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

function normalizeContactPoint(
  cp: unknown
): Array<{ email?: string; telephone?: string; contactType?: string }> | undefined {
  if (!cp) return undefined;
  if (Array.isArray(cp)) return cp as Array<{ email?: string; telephone?: string; contactType?: string }>;
  if (typeof cp === "object") return [cp as { email?: string; telephone?: string; contactType?: string }];
  return undefined;
}

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
  const result: unknown[] = [];

  // Keep the parent entity if it has meaningful properties (not just @graph)
  const hasOwnProps = Object.keys(obj).some((k) => k !== "@graph");
  if (hasOwnProps) {
    result.push(entity);
  }

  // Flatten @graph children
  if (Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"] as unknown[]) {
      result.push(...flattenGraph(item));
    }
  }

  return result;
}

function selectOrganization(entities: unknown[]): OrganizationSchema | undefined {
  const orgs = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "Organization"
  );
  const first = orgs.at(0);
  if (!first) return undefined;
  const org = first as OrganizationSchema;
  // Normalize contactPoint to always be an array
  if (org.contactPoint && !Array.isArray(org.contactPoint)) {
    org.contactPoint = normalizeContactPoint(org.contactPoint);
  }
  return org;
}

function selectFaqPage(entities: unknown[]): FAQPageSchema | undefined {
  const faqs = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "FAQPage"
  );
  const first = faqs.at(0);
  if (!first) return undefined;
  return { mainEntity: (first as Record<string, unknown>)["mainEntity"] as FAQPageSchema["mainEntity"] ?? [] };
}

function selectWebsite(entities: unknown[]): WebSiteSchema | undefined {
  const sites = entities.filter(
    (e) => typeof e === "object" && e !== null && (e as Record<string, unknown>)["@type"] === "WebSite"
  );
  const first = sites.at(0);
  if (!first) return undefined;
  return first as WebSiteSchema;
}

export function extractStructuredData(html: string): ExtractedSchema {
  const rawJsonLd: unknown[] = [];
  let match: RegExpExecArray | null;

  JSON_LD_REGEX.lastIndex = 0;
  while ((match = JSON_LD_REGEX.exec(html)) !== null) {
    try {
      const content = match[1];
      if (!content) continue;
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
