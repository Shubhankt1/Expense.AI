import { ConvexError } from "convex/values";
import { ERROR_MESSAGES, type ConvexErrorData } from "./errorCodes";

/**
 * Extract a user-friendly error message from a Convex error
 * Handles both ConvexError with structured data and regular errors
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data as ConvexErrorData | string | undefined;

    // If data is a string, use it directly
    if (typeof data === "string") {
      return data;
    }

    // If data has a message field, use it
    if (data?.message) {
      return data.message;
    }

    // Map error codes to user-friendly messages
    if (data?.code) {
      return ERROR_MESSAGES[data.code] || "An error occurred.";
    }

    return "An error occurred.";
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    // Try to extract clean error message from Convex error format
    const match = error.message.match(/Uncaught Error: (.+?)(?:\n|at handler)/);
    if (match) {
      return match[1].trim();
    }
    return error.message;
  }

  // Fallback for unknown error types
  return "An unexpected error occurred.";
}
