export interface QuotaSnapshot {
  pct6h: number;
  reset6hText: string;
  pctWeekly: number;
  resetWeeklyText: string;
}

export function parseUtcMs(isoString: string | null | undefined): number {
  if (!isoString) return NaN;
  const trimmed = isoString.trim();
  const hasTimezone =
    trimmed.endsWith("Z") || /[+-]\d{2}(?::?\d{2})?$/.test(trimmed);
  const normalized = hasTimezone ? trimmed : `${trimmed}Z`;
  return new Date(normalized).getTime();
}

export function formatCountdown(
  isoString: string | null | undefined,
  nowMs: number,
): string {
  if (!isoString) return "Resets soon";
  const target = parseUtcMs(isoString);
  if (Number.isNaN(target)) return "Resets soon";
  const diff = target - nowMs;
  if (diff <= 0) return "Resets soon";

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return `resets in ${parts.join(" ")}`;
}

export function formatPreciseCountdown(
  isoString: string | null | undefined,
  nowMs: number,
): { formatted: string; isExpired: boolean; totalSeconds: number } {
  if (!isoString) {
    return { formatted: "Resets soon", isExpired: true, totalSeconds: 0 };
  }
  const target = parseUtcMs(isoString);
  const diff = target - nowMs;
  if (diff <= 0 || Number.isNaN(diff)) {
    return { formatted: "Resets soon", isExpired: true, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${String(hours).padStart(2, "0")}h`);
  parts.push(`${String(minutes).padStart(2, "0")}m`);
  parts.push(`${String(seconds).padStart(2, "0")}s`);

  return { formatted: parts.join(" "), isExpired: false, totalSeconds };
}

export function getQuotaSnapshot(
  profile: any,
  nowMs: number,
): QuotaSnapshot {
  const reset6h = profile?.resetAt ?? profile?.reset_at;
  const resetWeekly = profile?.weeklyResetAt ?? profile?.weekly_reset_at;

  const is6hExpired = reset6h ? parseUtcMs(reset6h) <= nowMs : false;
  const isWeeklyExpired = resetWeekly ? parseUtcMs(resetWeekly) <= nowMs : false;

  const pct6h = is6hExpired ? 0 : (profile?.pct6h ?? profile?.pct_6h ?? 0);
  const pctWeekly = isWeeklyExpired
    ? 0
    : (profile?.pctWeekly ?? profile?.pct_weekly ?? 0);

  return {
    pct6h,
    reset6hText: is6hExpired ? "Resets soon" : formatCountdown(reset6h, nowMs),
    pctWeekly,
    resetWeeklyText: isWeeklyExpired
      ? "Resets soon"
      : formatCountdown(resetWeekly, nowMs),
  };
}
