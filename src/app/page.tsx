import { redirect } from "next/navigation";

/** Public website is future work — send visitors to the dashboard for now. */
export default function HomePage() {
  redirect("/dashboard");
}
