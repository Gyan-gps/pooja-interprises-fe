import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from "@/server/utils/api-response";
import { getRequestAuthContext } from "@/server/auth/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authContext = await getRequestAuthContext();

    if (!authContext) {
      return createErrorResponse(
        {
          code: "UNAUTHENTICATED",
          message: "Authentication required.",
        },
        401
      );
    }

    return createSuccessResponse({
      user: authContext.user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
