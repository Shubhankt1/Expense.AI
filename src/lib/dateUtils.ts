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
 * Format ISO string for display
 * Input: "2024-12-25T00:00:00.000Z"
 * Output: "Dec 25, 2024"
 */
export function formatDate(isoString: string): string {
  const date = isoString.split("T")[0]; // Get just the date part
  return new Date(date + "T12:00:00.000Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get month start as ISO
 * Input: "2024-12"
 * Output: "2024-12-01T00:00:00.000Z"
 */
export function getMonthStartISO(month: string): string {
  return `${month}-01T00:00:00.000Z`;
}

/**
 * Get month end as ISO
 * Input: "2024-12"
 * Output: "2024-12-31T23:59:59.999Z"
 */
export function getMonthEndISO(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();
  return `${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;
}

/**
 * Get current month in "YYYY-MM" format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
