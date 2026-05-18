import type { FileType, FileTier } from "@/lib/discovery/types";

export interface FileDescription {
  tier: FileTier;
  question: string;
  what: string;
  why: string;
  consequence: string;
}

export const FILE_DESCRIPTIONS: Record<FileType, FileDescription> = {
  "llms.txt": {
    tier: "essential",
    question: "Who are you and what do you do?",
    what:
      "The main AI discovery file that provides business identity and context in Markdown format, following the llmstxt.org convention. It is the primary file AI systems look for when discovering a website.",
    why:
      "AI systems use llms.txt to answer fundamental questions about your business. It establishes your identity, describes your services, and provides context that prevents misrepresentation.",
    consequence:
      "Without it, AI systems cannot reliably identify your business or understand what you offer — they may ignore your site entirely or generate inaccurate descriptions.",
  },

  "ai.txt": {
    tier: "essential",
    question: "How may AI use your content?",
    what:
      "A structured plain-text file declaring how AI systems should interact with, represent, and cite your business. It defines permissions (what AI may do) and restrictions (what AI must not do).",
    why:
      "It removes ambiguity about acceptable AI usage. Responsible AI systems check this file to understand how to properly handle your content.",
    consequence:
      "Without it, AI systems operate without explicit guidance — they may misrepresent your business, generate fake quotes, or use content in ways you would not approve.",
  },

  "identity.json": {
    tier: "recommended",
    question: "What is your machine-readable identity?",
    what:
      "A machine-readable JSON file providing structured canonical identity data aligned with Schema.org Organization vocabulary. It enables reliable programmatic extraction of business information.",
    why:
      "AI systems can extract identity data without parsing Markdown, reducing errors. Structured data is more reliable than text extraction.",
    consequence:
      "Without it, AI must parse unstructured text to extract identity — errors in extraction lead to incorrect business information in AI responses.",
  },

  "faq-ai.txt": {
    tier: "recommended",
    question: "What are common questions about your business?",
    what:
      "A structured Q&A file optimized for AI consumption. It provides authoritative, pre-written answers to common questions about your business, services, and policies.",
    why:
      "AI systems can cite direct, accurate answers rather than inferring responses that may be wrong or hallucinated.",
    consequence:
      "Without it, AI must generate answers from general knowledge — responses about your business may be inaccurate, incomplete, or fabricated.",
  },

  "brand.txt": {
    tier: "recommended",
    question: "How should AI name and describe you?",
    what:
      "A plain-text file declaring brand naming conventions, correct official names, incorrect variations to avoid, and representation guidance. It tells AI how to correctly spell, capitalise, and reference the brand.",
    why:
      "AI systems frequently misname brands through incorrect abbreviations, misspellings, or outdated names. This file provides authoritative guidance.",
    consequence:
      "Without it, AI may use unofficial names, wrong capitalisation, or confuse your brand with similar ones — damaging brand consistency across AI-generated content.",
  },

  "ai.json": {
    tier: "recommended",
    question: "What are your machine-readable permissions?",
    what:
      "The machine-readable equivalent of ai.txt, expressed in JSON Schema. It provides the same permissions and restrictions in a format AI systems can parse programmatically.",
    why:
      "Enables automated enforcement of usage rules. AI systems with JSON parsing capabilities can reliably interpret and follow your policies.",
    consequence:
      "Without it, AI must parse text to understand permissions — misinterpretation leads to violations of your content usage preferences.",
  },

  "llm.txt": {
    tier: "complete",
    question: "What is the singular-compatible redirect?",
    what:
      "A compatibility variant of llms.txt. It should redirect (301) to llms.txt. Some older AI systems and tools look for the singular form llm.txt instead of llms.txt.",
    why:
      "Ensures compatibility with AI systems that use the singular convention. Prevents silent failures where a compliant file exists but is not discovered.",
    consequence:
      "Without it, certain AI systems and crawlers fail to find your discovery files and fall back to general web scraping with reduced accuracy.",
  },

  "llms.html": {
    tier: "complete",
    question: "What is the human-readable version of your AI info?",
    what:
      "An HTML document that presents llms.txt content in a human-readable, styled format. It includes Schema.org JSON-LD structured data and serves as the browsable version of your AI information.",
    why:
      "Creates a discoverable, indexable page about your business while providing structured data that search engines and AI systems can extract reliably.",
    consequence:
      "Without it, human visitors who find your AI files see plain text only, and you miss the SEO benefit of Schema.org structured data.",
  },

  "developer-ai.txt": {
    tier: "complete",
    question: "What technical context should AI assistants know?",
    what:
      "A plain-text file providing technical context for AI systems that assist developers. It describes APIs, authentication requirements, platforms, and integration capabilities.",
    why:
      "AI coding assistants increasingly help developers integrate with third-party services. Without this file, AI cannot accurately advise on your APIs or technical products.",
    consequence:
      "Without it, AI may suggest non-existent integrations, provide outdated API information, or fail to help developers wanting to build on your platform.",
  },

  "robots-ai.txt": {
    tier: "complete",
    question: "What are your AI crawler-specific directives?",
    what:
      "A supplementary file following robots.txt syntax that declares AI crawler-specific access directives. It complements robots.txt with rules targeting AI training and inference crawlers (GPTBot, ClaudeBot, Google-Extended, etc.).",
    why:
      "Allows granular control over which AI companies can train on or retrieve your content. Standard robots.txt applies to all crawlers equally.",
    consequence:
      "Without it, all AI crawlers operate under the same rules as web crawlers — you cannot differentiate between AI search and AI training access policies.",
  },
};
