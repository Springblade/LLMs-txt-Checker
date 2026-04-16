import type { DiscoveredUrl } from "./types";

const AUTH_PATTERNS = [
  /\/login/i, /\/signup/i, /\/register/i, /\/logout/i,
  /\/sign-in/i, /\/sign-out/i, /\/reset-password/i,
  /\/forgot-password/i, /\/reset/i,
];

const ADMIN_PATTERNS = [
  /\/admin/i, /\/wp-admin/i, /\/dashboard\/?$/i, /\/manage/i, /\/backend/i,
];

const ASSET_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|ico)(\?|$)/i,
  /\/images?\//i, /\/static\//i, /\/assets?\//i,
  /\/\.well-known\//i, /\/media\//i, /\/uploads?\//i, /\/favicon/i,
];

const ARCHIVE_PATTERNS = [
  /\/[0-9]{4}\//i, /\/[0-9]{4}-[0-9]{2}\//i,
  /\/tag\//i, /\/tags\//i, /\/author\//i, /\/category\//i, /\/archive/i,
];

const PAGINATION_PATTERN = /\/(page|paged|cpage)\/\d+/i;

export function filterUrls(urls: DiscoveredUrl[], excludePaths: string[] = []): DiscoveredUrl[] {
  const originSet = new Set<string>();

  for (const url of urls) {
    try {
      originSet.add(new URL(url.url).origin);
    } catch {
      // skip invalid URLs
    }
  }

  const primaryOrigin = originSet.size > 0 ? Array.from(originSet)[0] : null;

  return urls.filter((url) => {
    if (!primaryOrigin) return false;

    try {
      const urlOrigin = new URL(url.url).origin;
      if (urlOrigin !== primaryOrigin) return false;
    } catch {
      return false;
    }

    const pathname = new URL(url.url).pathname;

    if (AUTH_PATTERNS.some((p) => p.test(pathname))) return false;
    if (ADMIN_PATTERNS.some((p) => p.test(pathname))) return false;
    if (ASSET_PATTERNS.some((p) => p.test(pathname))) return false;
    if (ARCHIVE_PATTERNS.some((p) => p.test(pathname))) return false;
    if (PAGINATION_PATTERN.test(pathname)) return false;
    if (excludePaths.some((p) => pathname.includes(p))) return false;

    return true;
  });
}