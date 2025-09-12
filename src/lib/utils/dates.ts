// src/lib/utils/dates.ts

/** Format a date string or Date object for display in tables (e.g. 'Sep 9, 2025')
 */
export function formatBookingDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a time string (e.g. '14:30') for display (e.g. '2:30 PM')
 */
export function formatBookingTime(time: string): string {
  // Accepts 'HH:mm' or 'HH:mm:ss'
  const [h, m] = time.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m), 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Returns true if the date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Returns true if the date is in the current week (Sunday-Saturday)
 */
export function isThisWeek(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return d >= startOfWeek && d <= endOfWeek;
}

/**
 * Parse a date range (from/to) and return Date objects or undefined
 */
export function parseDateRange(
  from?: string,
  to?: string
): { from?: Date; to?: Date } {
  const result: { from?: Date; to?: Date } = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d.getTime())) result.from = d;
  }
  if (to) {
    const d = new Date(to);
    if (!isNaN(d.getTime())) result.to = d;
  }
  return result;
}


/**
 *  Convert db serviceDuration minutes to hours
 */

export function minutesToHours(minutes?: number) {
  if (!minutes) return 2;
  return minutes / 60;
}