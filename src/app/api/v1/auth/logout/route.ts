import { createSuccessResponse, handleApiError } from "@/server/utils/api-response";
import { readSessionCookie } from "@/server/auth/cookies";
import { SESSION_COOKIE_NAME } from "@/server/auth/session-token";
import { logoutCurrentSession } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const sessionToken = await readSessionCookie();
    await logoutCurrentSession(sessionToken);

    const response = createSuccessResponse({ signedOut: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
