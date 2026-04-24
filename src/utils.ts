// ---------------------------------------------------------------------------
// Shared utility functions
// ---------------------------------------------------------------------------

import dayjs from "dayjs";

/**
 * Formats an ISO timestamp to a human-readable local date-time string.
 * Returns "—" for null/empty input.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Formats a numeric hours value to a human-readable string.
 * e.g. 1.5 → "1.5h", 8 → "8h", null → null
 */
export function formatHours(hours: number | null | undefined): string | null {
  if (hours == null) return null;
  return `${hours}h`;
}

/**
 * Truncates a string to the given max length, appending "…" if truncated.
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

/**
 * Returns today's date in yyyy-MM-dd format using the local timezone.
 */
export function todayLocalDate(): string {
  return dayjs().format("YYYY-MM-DD");
}
