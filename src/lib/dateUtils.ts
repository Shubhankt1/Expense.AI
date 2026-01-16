// lib/dateUtils.ts

/**
 * Convert date input to ISO string (midnight UTC)
 * Input: "2024-12-25" (from <input type="date">)
 * Output: "2024-12-25T00:00:00.000Z"
 */
export function dateInputToISO(dateInput: string): string {
  return dateInput + "T00:00:00.000Z";
}

/**
 * Convert ISO string to date input format
 * Input: "2024-12-25T00:00:00.000Z"
 * Output: "2024-12-25"
 */
export function isoToDateInput(isoString: string): string {
  return isoString.split("T")[0];
}

/**
 * Get today as ISO string (midnight UTC)
 * Output: "2024-12-25T00:00:00.000Z"
 */
export function getTodayISO(): string {
  const today = new Date();
  const date = today.toISOString().split("T")[0];
  return `${date}T00:00:00.000Z`;
}

/**
 * Extract month string from ISO date
 * Input: "2024-12-25T00:00:00.000Z"
 * Output: "2024-12"
 */
export function isoToMonthString(isoString: string): string {
  return isoString.substring(0, 7);
}

/**
 * Format ISO string for display
 * Input: "2024-12-25T00:00:00.000Z"
 * Output: "Dec 25, 2024"
 */
export function formatDate(isoString: string): string {
  const date = isoString.split("T")[0]; // Get just the date part
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMonthStartISO(month: string): string;
export function getMonthStartISO(date: Date): string;
/**
 * Get month start as ISO
 * Input: "2024-12"
 * Output: "2024-12-01T00:00:00.000Z"
 */
export function getMonthStartISO(input: string | Date): string {
  if (input instanceof Date) {
    return `${input.toISOString().substring(0, 7)}-01T00:00:00.000Z`;
  } else if (typeof input === "string") {
    return `${input}-01T00:00:00.000Z`;
  }
  throw new Error("Invalid input type");
}

export function getMonthEndISO(month: string): string;
export function getMonthEndISO(date: Date): string;
/**
 * Get month end as ISO
 * Input: "2024-12"
 * Output: "2024-12-31T23:59:59.999Z"
 */
export function getMonthEndISO(input: string | Date): string {
  if (input instanceof Date) {
    const lastDay = new Date(input.getFullYear(), input.getMonth() + 1, 0);
    return `${lastDay.toISOString().split("T")[0]}T23:59:59.999Z`;
  } else if (typeof input === "string") {
    const [year, monthNum] = input.split("-").map(Number);
    const lastDay = new Date(year, monthNum, 0);
    return `${lastDay.toISOString().split("T")[0]}T23:59:59.999Z`;
  }
  throw new Error("Invalid input type");
}

/**
 * Get current month in "YYYY-MM" format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return now.toISOString().substring(0, 7);
}

/**
 *
 * @param isoString
 * @returns Month and year
 * @example Input: "2024-12-25T00:00:00.000Z"
 * @example Output: "December 2024"
 */
export function dateToMonthLocaleString(isoString: string): string {
  if (isoString.includes("T")) {
    const [year, month, day] = isoString.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return formatMonthString(isoString.substring(0, 7));
}

/**
 * Format month string to readable format
 * Input: "2024-12"
 * Output: "December 2024"
 */
export function formatMonthString(month: string): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
