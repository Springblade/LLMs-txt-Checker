# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-04-10

### Added

- `POST /api/validate` endpoint accepting `{ url: string }`
- `ValidationResult` response with errors, warnings, parsed data, and link results
- **7 validation rules:**
  - `markdown_format` — required, checks non-empty content with readable characters
  - `h1_title` — required, checks presence of H1 heading
  - `quote_block` — optional, checks blockquote description
  - `description_paragraphs` — optional, checks detailed paragraphs after blockquote
  - `project_details` — optional, checks H2+ headings and link count
  - `file_list_format` — optional, checks list item format
  - `link_validation` — optional, checks HTTP 2xx on all links
- **12 error codes** covering network failures, HTTP errors, content issues
- **9 charset decoding** support: UTF-8, ISO-8859-1, Windows-1252, GBK, GB2312, Big5, Shift_JIS, EUC-KR, US-ASCII
- **WAF / anti-bot detection** — detects Cloudflare, Incapsula, PerimeterX challenge pages
- **MIME whitelist enforcement** — rejects HTML, PDF, JSON, image, video, audio content types
- **Async link checker** — validates up to 20 links concurrently with `Promise.allSettled` and 5s per-link timeout
- **DoS protection** — 20-link cap prevents resource exhaustion from malicious URLs
- **UI:** URL input form, results page with error/warning/link tabs, markdown preview, validation checklist
- **Test suite** with Vitest covering charset-decoder, content-sniffer, markdown-parser, network-error-mapper
- `validation-checklist.ts` — UI state transformer mapping `ValidationResult` to display-friendly checks
- `results-error-panel.tsx` — error code display with descriptive messages and links
- `error-boundary.tsx` — React error boundary for graceful UI failure handling