"use client";

import type { ReactNode } from "react";
import { AppDataProvider } from "@/lib/appDataContext";
import { ToastProvider } from "@/lib/toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppDataProvider>{children}</AppDataProvider>
    </ToastProvider>
  );
}
