import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from "@/server/utils/api-response";
import { getDatabaseHealth } from "@/server/database/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const databaseHealth = await getDatabaseHealth();

    if (databaseHealth.status !== "ok") {
      return createErrorResponse(
        {
          code: "DATABASE_UNAVAILABLE",
          message: "Database is unavailable.",
        },
        503
      );
    }

    return createSuccessResponse({
      status: "ok" as const,
      database: {
        status: databaseHealth.status,
        latencyMilliseconds: databaseHealth.latencyMilliseconds,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
