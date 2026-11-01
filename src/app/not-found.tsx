import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-6 bg-background">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <FileQuestion size={24} className="text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border bg-primary text-primary-foreground border-primary hover:opacity-90 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
