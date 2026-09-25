import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";

export function NotFound() {
  usePageTitle("Page Not Found");

  return (
    <div className="p-6 flex flex-col items-center justify-center text-center min-h-[60vh] gap-4">
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
        to="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border bg-primary text-primary-foreground border-primary hover:opacity-90 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
