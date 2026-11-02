import "server-only";

/**
 * Lightweight filter object type for Mongoose 9 (FilterQuery was removed).
 */
export type MongoFilter = Record<string, unknown>;
