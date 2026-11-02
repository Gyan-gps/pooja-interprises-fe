import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Pooja Enterprises operations dashboard.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#FFF0EB_0%,#F8F6F2_45%,#EEF2FF_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E84C1E] text-white text-lg font-bold">
            P
          </div>
          <h1 className="font-[family-name:var(--font-sans)] text-3xl font-bold tracking-tight text-foreground">
            Pooja Enterprises
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Operations dashboard sign in
          </p>
        </div>
        <Suspense fallback={<div className="rounded-2xl border border-border bg-white/90 p-6 text-sm text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
