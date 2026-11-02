import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardClientLayout } from "@/components/layouts/DashboardClientLayout";
import { getRequestAuthContext } from "@/server/auth/require-auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authContext = await getRequestAuthContext();

  if (!authContext) {
    redirect("/login?next=/dashboard");
  }

  return (
    <DashboardClientLayout>
      <Suspense
        fallback={
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        }
      >
        {children}
      </Suspense>
    </DashboardClientLayout>
  );
}
