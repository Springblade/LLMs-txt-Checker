export type TemplateFileType =
  | "llms.txt"
  | "llm.txt"
  | "ai.txt"
  | "faq-ai.txt"
  | "brand.txt"
  | "developer-ai.txt"
  | "llms.html"
  | "robots-ai.txt"
  | "identity.json"
  | "ai.json";

export interface FileTemplate {
  title: string;
  description: string;
  content: string;
}

const TEMPLATES: Record<TemplateFileType, FileTemplate> = {
  "llms.txt": {
    title: "llms.txt",
    description: "For main AI discovery file",
    content: `# My Project

> A brief description of what this project does and who it's for.

## Getting Started

- [Documentation](https://example.com/docs)
- [API Reference](https://example.com/api)

## Features

- Feature 1: Describe what makes this special
- Feature 2: Key capability or integration
- Feature 3: Standout benefit

## Contact

- [Email](mailto:hello@example.com)
- [GitHub](https://github.com/example)
- [Twitter](https://twitter.com/example)`,
  },

  "llm.txt": {
    title: "llm.txt",
    description: "For redirect compatibility",
    content: `https://example.com/llms.txt`,
  },

  "ai.txt": {
    title: "ai.txt",
    description: "For AI policies and terms",
    content: `[identity]
name = My Project
url = https://example.com
email = hello@example.com

[permissions]
llms.txt

[restrictions]
/example/admin
/example/private

[contact]
email = hello@example.com`,
  },

  "faq-ai.txt": {
    title: "faq-ai.txt",
    description: "For AI-friendly FAQ responses",
    content: `# Frequently Asked Questions

Q: What is My Project?
A: My Project is a tool that helps developers build better applications faster with AI-powered features.

Q: How do I get started?
A: Visit our documentation at https://example.com/docs to learn how to integrate My Project into your workflow.

Q: Is My Project free to use?
A: Yes, My Project offers a free tier with essential features. Paid plans are available for teams requiring advanced capabilities.`,
  },

  "brand.txt": {
    title: "brand.txt",
    description: "For AI brand guidelines",
    content: `brand-name: My Project
project-url: https://example.com
official-name: My Project Inc.

do-not-use: MyProjectPro, MyProjectApp, unofficial-my-project
`,
  },

  "developer-ai.txt": {
    title: "developer-ai.txt",
    description: "For developer documentation",
    content: `# Developer Documentation

## Overview

This document provides technical details for developers integrating with My Project.

## Authentication

All API requests require an API key passed in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### GET /api/resource

Returns a list of resources.

### POST /api/resource

Creates a new resource.

## Rate Limits

- Free tier: 100 requests per minute
- Pro tier: 1,000 requests per minute
- Enterprise: Custom limits

## Support

For technical support, open an issue at https://github.com/example/project/issues`,
  },

  "llms.html": {
    title: "llms.html",
    description: "For HTML-based AI discovery",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta property="og:title" content="My Project">
  <meta property="og:url" content="https://example.com">
  <meta property="og:type" content="website">
  <title>My Project</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "My Project",
    "url": "https://example.com",
    "description": "A brief description of what this project does.",
    "applicationCategory": "DeveloperApplication"
  }
  </script>
</head>
<body>
  <h1>My Project</h1>
  <p>A brief description of what this project does and who it's for.</p>

  <h2>Getting Started</h2>
  <ul>
    <li><a href="https://example.com/docs">Documentation</a></li>
    <li><a href="https://example.com/api">API Reference</a></li>
  </ul>
</body>
</html>`,
  },

  "robots-ai.txt": {
    title: "robots-ai.txt",
    description: "For AI crawler access control",
    content: `# robots-ai.txt - AI Crawler Access Control

User-agent: *
Allow: /

User-agent: GPTBot
Allow: /public/
Disallow: /admin/
Disallow: /private/

User-agent: Claude-Web
Allow: /public/
Disallow: /admin/
Disallow: /private/

User-agent: CCBot
Allow: /public/
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml`,
  },

  "identity.json": {
    title: "identity.json",
    description: "For machine-readable identity",
    content: `{
  "name": "My Project",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "A brief description of what this project does.",
  "category": "software",
  "tags": ["developer-tools", "api", "open-source"]
}`,
  },

  "ai.json": {
    title: "ai.json",
    description: "For AI interaction guidelines",
    content: `{
  "format_version": "1.0",
  "interaction_model": "conversational",
  "guidelines": {
    "tone": "professional and helpful",
    "response_format": "concise with code examples when applicable"
  },
  "capabilities": [
    "answer questions about the project",
    "provide code examples",
    "explain integration steps",
    "troubleshoot common issues"
  ],
  "limitations": [
    "cannot access user-specific data",
    "cannot modify project settings",
    "cannot execute code on behalf of users"
  ]
}`,
  },
};

export function getTemplate(fileType: TemplateFileType): FileTemplate {
  return TEMPLATES[fileType];
}

export function downloadTemplate(fileType: TemplateFileType): void {
  const template = TEMPLATES[fileType];
  const blob = new Blob([template.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = fileType;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const FILE_TYPE_META: Record<
  TemplateFileType,
  { bg: string; text: string; headerBg: string; headerText: string }
> = {
  "llms.txt": {
    bg: "bg-red-50",
    text: "text-red-700",
    headerBg: "bg-red-600",
    headerText: "text-white",
  },
  "llm.txt": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    headerBg: "bg-blue-600",
    headerText: "text-white",
  },
  "ai.txt": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    headerBg: "bg-purple-600",
    headerText: "text-white",
  },
  "faq-ai.txt": {
    bg: "bg-green-50",
    text: "text-green-700",
    headerBg: "bg-green-600",
    headerText: "text-white",
  },
  "brand.txt": {
    bg: "bg-pink-50",
    text: "text-pink-700",
    headerBg: "bg-pink-600",
    headerText: "text-white",
  },
  "developer-ai.txt": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    headerBg: "bg-cyan-600",
    headerText: "text-white",
  },
  "llms.html": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    headerBg: "bg-orange-600",
    headerText: "text-white",
  },
  "robots-ai.txt": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    headerBg: "bg-teal-600",
    headerText: "text-white",
  },
  "identity.json": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    headerBg: "bg-indigo-600",
    headerText: "text-white",
  },
  "ai.json": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    headerBg: "bg-violet-600",
    headerText: "text-white",
  },
};
