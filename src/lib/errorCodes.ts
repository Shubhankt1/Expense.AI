/**
 * Centralized error codes for the application
 * Use these constants when throwing ConvexError to ensure consistency
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
 * User-friendly error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.UNAUTHENTICATED]: "Please sign in to continue.",
  [ERROR_CODES.UNAUTHORIZED]:
    "You don't have permission to perform this action.",
  [ERROR_CODES.NOT_FOUND]: "The requested item was not found.",
  [ERROR_CODES.INVALID_INPUT]: "Please check your input and try again.",
  [ERROR_CODES.NO_DATA]: "No data available to process.",
  [ERROR_CODES.NO_UNREAD_INSIGHTS]: "No unread insights found.",
  [ERROR_CODES.AI_ERROR]: "AI service error. Please try again later.",
};

/**
 * Helper type for ConvexError data structure
 */
export interface ConvexErrorData {
  code: ErrorCode;
  message: string;
}
