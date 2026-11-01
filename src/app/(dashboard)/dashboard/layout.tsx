import { Suspense, type ReactNode } from "react";
import { DashboardClientLayout } from "@/components/layouts/DashboardClientLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardClientLayout>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
        {children}
      </Suspense>
    </DashboardClientLayout>
  );
}
