import "server-only";

import mongoose from "mongoose";
import { getServerEnvironment } from "@/server/config/env";

interface MongooseConnectionCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var -- required for Next.js hot-reload cache
  var mongooseConnectionCache: MongooseConnectionCache | undefined;
}

const mongooseConnectionCache: MongooseConnectionCache =
  global.mongooseConnectionCache ?? {
    connection: null,
    promise: null,
  };

// Always attach to globalThis so hot reload and serverless warm instances reuse one connection.
global.mongooseConnectionCache = mongooseConnectionCache;

/**
 * Returns a shared Mongoose connection.
 * Connection is created on first call only (not at module import).
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongooseConnectionCache.connection) {
    return mongooseConnectionCache.connection;
  }

  if (!mongooseConnectionCache.promise) {
    const { NEXT_MONGODB_URL: mongodbUrl } = getServerEnvironment();

    mongooseConnectionCache.promise = mongoose.connect(mongodbUrl, {
      bufferCommands: false,
    });
  }

  try {
    mongooseConnectionCache.connection = await mongooseConnectionCache.promise;
  } catch (connectionError) {
    mongooseConnectionCache.promise = null;
    throw connectionError;
  }

  return mongooseConnectionCache.connection;
}

export type DatabaseHealthStatus = "ok" | "unavailable";

export interface DatabaseHealth {
  status: DatabaseHealthStatus;
  latencyMilliseconds: number | null;
}

/**
 * Lightweight database reachability check via admin ping.
 * Never throws; returns an accurate status for health endpoints.
 */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const startedAt = Date.now();

  try {
    const mongooseInstance = await connectToDatabase();
    const database = mongooseInstance.connection.db;

    if (!database) {
      return {
        status: "unavailable",
        latencyMilliseconds: null,
      };
    }

    await database.admin().ping();

    return {
      status: "ok",
      latencyMilliseconds: Date.now() - startedAt,
    };
  } catch (healthCheckError) {
    const safeMessage =
      healthCheckError instanceof Error
        ? healthCheckError.message.replace(
            /mongodb(\+srv)?:\/\/[^\s@]+@/gi,
            "mongodb$1://***@"
          )
        : "Unknown database health error";

    console.error("Database health check failed:", safeMessage);

    return {
      status: "unavailable",
      latencyMilliseconds: null,
    };
  }
}
