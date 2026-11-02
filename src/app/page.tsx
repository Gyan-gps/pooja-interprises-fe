import { redirect } from "next/navigation";
import { getRequestAuthContext } from "@/server/auth/require-auth";

/** Public website is future work — route home based on auth. */
export default async function HomePage() {
  const authContext = await getRequestAuthContext();
  redirect(authContext ? "/dashboard" : "/login");
}
