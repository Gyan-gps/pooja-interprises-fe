import "server-only";

import { Error as MongooseError } from "mongoose";
import { ApiError } from "@/server/errors/api-error";

interface MongoServerErrorLike {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
  message?: string;
}

function isDuplicateKeyError(error: unknown): error is MongoServerErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as MongoServerErrorLike).code === 11000
  );
}

function getDuplicateFieldName(error: MongoServerErrorLike): string {
  if (error.keyPattern) {
    const [fieldName] = Object.keys(error.keyPattern);
    if (fieldName) {
      return fieldName;
    }
  }

  return "field";
}

/**
 * Maps Mongoose / MongoDB errors to safe ApiError instances.
 */
export function mapMongoError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (isDuplicateKeyError(error)) {
    const fieldName = getDuplicateFieldName(error);
    throw new ApiError(`A record with this ${fieldName} already exists.`, {
      statusCode: 409,
      code: "DUPLICATE_KEY",
      details: {
        fieldName,
        keyValue: error.keyValue,
      },
      cause: error,
    });
  }

  if (error instanceof MongooseError.ValidationError) {
    throw new ApiError("Database validation failed.", {
      statusCode: 400,
      code: "DATABASE_VALIDATION_ERROR",
      details: Object.fromEntries(
        Object.entries(error.errors).map(([fieldName, fieldError]) => [
          fieldName,
          fieldError.message,
        ])
      ),
      cause: error,
    });
  }

  if (error instanceof MongooseError.CastError) {
    throw new ApiError(`Invalid value for ${error.path}.`, {
      statusCode: 400,
      code: "INVALID_ID",
      details: {
        path: error.path,
      },
      cause: error,
    });
  }

  throw error;
}

export async function withMongoErrorMapping<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    mapMongoError(error);
  }
}
