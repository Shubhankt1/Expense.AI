/**
 * Centralized error codes for Convex functions
 * Use these constants when throwing ConvexError to ensure consistency
 *
 * @example
 * import { ConvexError } from "convex/values";
 * import { ERROR_CODES } from "./errorCodes";
 *
 * throw new ConvexError({
 *   code: ERROR_CODES.UNAUTHENTICATED,
 *   message: "You must be signed in to perform this action."
 * });
 */

export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  INVALID_INPUT: "INVALID_INPUT",
  NO_DATA: "NO_DATA",
  NO_UNREAD_INSIGHTS: "NO_UNREAD_INSIGHTS",
  AI_ERROR: "AI_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Helper type for ConvexError data structure
 */
export interface ConvexErrorData {
  code: ErrorCode;
  message: string;
}
