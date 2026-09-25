import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NAV_ITEMS } from "../../lib/constants";

export function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Match "/orders/123" to the "/orders" nav item, not just an exact path.
  const activeNav = NAV_ITEMS.find(n =>
    n.path === "/" ? pathname === "/" : pathname === n.path || pathname.startsWith(`${n.path}/`)
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        <Header sectionLabel={activeNav?.label ?? "Not Found"} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
