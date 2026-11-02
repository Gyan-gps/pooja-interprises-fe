import { createSuccessResponse, handleApiError } from "@/server/utils/api-response";
import { getServerEnvironment } from "@/server/config/env";
import { SESSION_COOKIE_NAME } from "@/server/auth/session-token";
import { getRequestClientMetadata } from "@/server/auth/require-auth";
import { loginWithEmailPassword } from "@/server/services/auth-service";
import { loginRequestSchema } from "@/lib/validations/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const credentials = loginRequestSchema.parse(requestBody);
    const { ipAddress, userAgent } = await getRequestClientMetadata();

    const loginResult = await loginWithEmailPassword({
      email: credentials.email,
      password: credentials.password,
      ipAddress,
      userAgent,
    });

    const { NODE_ENV } = getServerEnvironment();
    const response = createSuccessResponse({
      user: loginResult.user,
    });

    response.cookies.set(SESSION_COOKIE_NAME, loginResult.sessionToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: loginResult.expiresAt,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
