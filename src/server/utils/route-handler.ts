import "server-only";

import type { NextResponse } from "next/server";
import { requireRequestAdmin } from "@/server/auth/require-auth";
import type { AuthContext } from "@/server/services/auth-service";
import { handleApiError } from "@/server/utils/api-response";

/**
 * Admin-protected route wrapper that forwards the original Request.
 */
export async function handleAdminRequest(
  request: Request,
  handler: (authContext: AuthContext, request: Request) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authContext = await requireRequestAdmin();
    return await handler(authContext, request);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function handleAdminAction(
  handler: (authContext: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authContext = await requireRequestAdmin();
    return await handler(authContext);
  } catch (error) {
    return handleApiError(error);
  }
}
