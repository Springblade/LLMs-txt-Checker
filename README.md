# Aivify

**Make Your Site AI-Discoverable**

Aivify scans websites for AI discovery files (`llms.txt`, `ai.txt`, `faq-ai.txt`, and more), validates them against published specs, and generates missing ones using Google Gemini AI.

---

## The Problem

AI agents don't browse like humans. They read files.

| Human Browsing | AI Agent Reading |
|---|---|
| Sees visual hierarchy and design | Only reads raw text content |
| Navigates through pages intuitively | Needs explicit file paths |
| Understands context from layout | Requires structured metadata |
| Forms opinions from aesthetics | Relies on `llms.txt`, `ai.txt`, etc. |
| Can ask follow-up questions instantly | Must trust documentation provided |

Without AI discovery files, agents miss or misinterpret your content. Aivify bridges that gap.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/aivify.git
cd aivify

# Install dependencies
npm install

# Set your Google API key (required for AI-powered generation)
export GOOGLE_API_KEY=your_gemini_api_key

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter any URL, and click **Scan Site**.

---

## Features

- **Scan** — Discover all AI discovery files on any website with a single URL
- **Validate** — Check files against published specs (`llmstxt.org`, `ai-visibility.org.uk`, and more)
- **Generate** — Create missing files using Google Gemini AI, powered by your site's own content
- **Audit** — Track which files exist, their health status, and actionable fix checklists
- **10+ file formats** — Essential, recommended, and complete-tier AI discovery files
- **Self-hosted** — No third-party service dependency. Run it on your own infrastructure.

---

## AI Discovery File Types

Aivify supports three tiers of AI discovery files, organized by importance:

### Essential

| File | Description |
|------|-------------|
| `llms.txt` | Primary machine-readable sitemap for AI agents |
| `ai.txt` | Declares how AI systems may use and represent your content |

### Recommended

| File | Description |
|------|-------------|
| `llm.txt` | Singular redirect variant for older AI systems |
| `faq-ai.txt` | Structured Q&A pairs for authoritative answers |
| `brand.txt` | Brand naming conventions and correct references |
| `identity.json` | Machine-readable Schema.org-aligned organization data |
| `ai.json` | Structured AI permissions in JSON Schema format |

### Complete

| File | Description |
|------|-------------|
| `llms.html` | HTML variant with Schema.org JSON-LD support |
| `developer-ai.txt` | Technical context for AI coding assistants |
| `robots-ai.txt` | AI-specific crawler directives |

---

## How It Works

```
Scan Your Site          Review Results         Generate Missing
─────────────────       ─────────────────      ─────────────────
Enter any URL    →      See found + missing  →   AI generates files
Aivify checks         Files ranked by tier      Ready to deploy
for existing files      with fix checklists
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **UI**: React 19 + Tailwind CSS
- **AI**: Google Gemini (`@google/generative-ai`)
- **Validation**: Zod v4
- **Testing**: Vitest + Playwright

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | For generation | Google Gemini API key. Supports comma-separated keys for failover. |

---

## Architecture

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── discover/           # Scan for AI discovery files
│   │   ├── validate/          # Validate file content
│   │   ├── analyze/           # Deep analysis of a file
│   │   ├── generate/          # AI-powered file generation
│   │   ├── crawl/             # Website content crawler
│   │   └── check-and-fix/     # Suggest fixes for invalid files
│   ├── page.tsx               # Landing page
│   └── results/page.tsx       # Scan results dashboard
├── components/
│   ├── landing/               # Landing page sections
│   ├── audit/                 # Audit and results components
│   └── ui/                    # shadcn/ui primitives
└── lib/
    ├── discovery/             # Discovery engine
    ├── generator/             # AI generation pipeline
    │   ├── crawler.ts         # Website crawling
    │   ├── ai-generator.ts    # Gemini AI integration
    │   ├── scoring.ts         # Quality scoring
    │   └── security.ts       # Content filtering
    └── analyzer/              # Content analysis
```
