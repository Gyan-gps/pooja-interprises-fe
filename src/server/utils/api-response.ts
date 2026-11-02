import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/server/errors/api-error";

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function createSuccessResponse<T>(
  data: T,
  init?: ResponseInit
): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json(
    { success: true, data },
    { status: 200, ...init }
  );
}

export function createErrorResponse(
  error: {
    code: string;
    message: string;
    details?: unknown;
  },
  statusCode: number
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    },
    { status: statusCode }
  );
}

/**
 * Maps known errors to safe HTTP responses.
 * Does not expose stack traces or internal secrets.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ApiError) {
    return createErrorResponse(
      {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      error.statusCode
    );
  }

  if (error instanceof ZodError) {
    return createErrorResponse(
      {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.flatten(),
      },
      400
    );
  }

  const safeMessage =
    error instanceof Error ? error.message : "Unknown error";
  console.error("Unhandled API error:", safeMessage);

  return createErrorResponse(
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
    500
  );
}
