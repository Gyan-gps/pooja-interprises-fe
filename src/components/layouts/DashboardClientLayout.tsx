"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NAV_ITEMS } from "@/lib/constants";
import { useZoom } from "@/hooks/useZoom";
import { AppDataProvider } from "@/lib/appDataContext";

export function DashboardClientLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { containerRef } = useZoom();

  const activeNav = NAV_ITEMS.find(n =>
    n.path === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === n.path || pathname.startsWith(`${n.path}/`)
  );

  return (
    <AppDataProvider>
      <div
        ref={containerRef}
        className="flex h-screen overflow-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
          <Header
            sectionLabel={activeNav?.label ?? "Not Found"}
            onMenuClick={() => setMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full">{children}</div>
          </main>
        </div>
      </div>
    </AppDataProvider>
  );
}
