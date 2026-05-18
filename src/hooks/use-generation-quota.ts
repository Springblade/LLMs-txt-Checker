"use client";

const STORAGE_KEY = "aivify_generation_counts";
const FREE_GENERATION_LIMIT = 2;

interface GenerationCounts {
  [origin: string]: number;
}

function readCounts(): GenerationCounts {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as GenerationCounts;
  } catch {
    return {};
  }
}

function writeCounts(counts: GenerationCounts): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    // localStorage unavailable — fail silently
  }
}

/** Returns the number of generations already used for a given origin URL. */
export function getGenerationCount(originUrl: string): number {
  return readCounts()[originUrl] ?? 0;
}

/** Returns true when the user has exhausted their free generations. */
export function isOverGenerationLimit(originUrl: string): boolean {
  return getGenerationCount(originUrl) >= FREE_GENERATION_LIMIT;
}

/** Increments the generation counter for a given origin URL. */
export function incrementGenerationCount(originUrl: string): void {
  const counts = readCounts();
  counts[originUrl] = (counts[originUrl] ?? 0) + 1;
  writeCounts(counts);
}

/** Resets the generation counter for a given origin URL. */
export function resetGenerationCount(originUrl: string): void {
  const counts = readCounts();
  delete counts[originUrl];
  writeCounts(counts);
}

export const GENERATION_LIMIT = FREE_GENERATION_LIMIT;
