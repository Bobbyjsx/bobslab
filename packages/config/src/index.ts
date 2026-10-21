export const THEME_COLORS = {
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  background: "var(--background)",
  foreground: "var(--foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
} as const;

export const RADII = {
  none: "0",
  sm: "var(--radius-sm, 0.25rem)",
  md: "var(--radius-md, 0.375rem)",
  lg: "var(--radius-lg, 0.5rem)",
  xl: "var(--radius-xl, 0.75rem)",
  "2xl": "var(--radius-2xl, 1rem)",
  full: "9999px",
} as const;

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export interface AppConfig {
  name: string;
  description?: string;
  url?: string;
}

export function createConfig<T extends AppConfig>(config: T): T {
  return Object.freeze({ ...config });
}

export function getRequiredEnv(key: string, fallback?: string): string {
  const value = typeof process !== "undefined" ? process.env?.[key] : undefined;
  if (value !== undefined && value !== "") {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`[Bobslab Config] Missing required environment variable: ${key}`);
}
