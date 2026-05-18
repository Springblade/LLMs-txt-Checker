/**
 * Aivify design tokens — dark theme values.
 * All components reference these via CSS variables; this file documents
 * the intent behind each token value.
 */

export const colors = {
  bg: "#09090e",
  bgSecondary: "#111118",
  bgTertiary: "#18181f",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#e4e4e7",
  textMuted: "#71717a",
  textSubtle: "#52525b",
  blue: "#1456f0",
  blueLight: "#3b82f6",
  pink: "#ea5ec1",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
} as const;

export const tierInfo = {
  essential: {
    label: "Essential",
    color: "#10b981",
    description: "Core discovery files every site needs",
  },
  recommended: {
    label: "Recommended",
    color: "#f59e0b",
    description: "Enhances AI understanding of your content",
  },
  complete: {
    label: "Complete",
    color: "#8b5cf6",
    description: "Full implementation for maximum AI understanding",
  },
} as const;

export type Tier = keyof typeof tierInfo;

export const layout = {
  sidebarWidth: 244,
  rightPanelWidth: 288,
  headerHeight: 46,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;
