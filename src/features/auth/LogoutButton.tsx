"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      // Always clear local navigation state even if the request fails.
    } finally {
      router.replace("/login");
      router.refresh();
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSigningOut}
      className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-60"
    >
      <LogOut size={14} />
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
