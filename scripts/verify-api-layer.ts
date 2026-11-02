/**
 * Phase 7 HTTP smoke checks against a running app instance.
 * Usage: npx tsx scripts/verify-api-layer.ts
 * Optional: API_BASE_URL=http://localhost:3000
 */
import { readFileSync } from "node:fs";

function loadEnvFile(): void {
  try {
    const envFile = readFileSync(".env", "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional when variables are already in the environment.
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  loadEnvFile();

  const baseUrl = (process.env.API_BASE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin@2004";

  const healthResponse = await fetch(`${baseUrl}/api/v1/health`);
  const healthBody = (await healthResponse.json()) as {
    success: boolean;
    data?: { status: string };
  };
  assert(healthResponse.ok && healthBody.success, "Health check failed");
  assert(healthBody.data?.status === "ok", "Database is not healthy");

  const unauthorized = await fetch(`${baseUrl}/api/v1/clients`);
  assert(unauthorized.status === 401, "Clients should require auth");

  const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const loginBody = (await loginResponse.json()) as {
    success: boolean;
    data?: { user: { email: string; role: string } };
  };
  assert(loginResponse.ok && loginBody.success, "Login failed");
  assert(loginBody.data?.user.role === "Admin", "Expected Admin role");

  const setCookie = loginResponse.headers.getSetCookie?.() ?? [];
  const cookieHeader =
    setCookie
      .map((cookie) => cookie.split(";")[0])
      .filter(Boolean)
      .join("; ") ||
    (() => {
      const single = loginResponse.headers.get("set-cookie");
      return single ? single.split(";")[0] : "";
    })();

  assert(cookieHeader.includes("pe_session="), "Login did not set pe_session");

  const meResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meBody = (await meResponse.json()) as {
    success: boolean;
    data?: { user: { email: string } };
  };
  assert(meResponse.ok && meBody.success, "/auth/me failed");
  assert(
    meBody.data?.user.email === adminEmail.toLowerCase(),
    "Unexpected /auth/me email"
  );

  const clientsResponse = await fetch(
    `${baseUrl}/api/v1/clients?page=1&pageSize=5`,
    { headers: { Cookie: cookieHeader } }
  );
  const clientsBody = (await clientsResponse.json()) as { success: boolean };
  assert(clientsResponse.ok && clientsBody.success, "Authenticated clients list failed");

  const logoutResponse = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  const logoutBody = (await logoutResponse.json()) as { success: boolean };
  assert(logoutResponse.ok && logoutBody.success, "Logout failed");

  console.log("API layer verification passed.");
}

main().catch((error: unknown) => {
  console.error(
    "API layer verification failed:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
