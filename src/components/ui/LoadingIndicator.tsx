import { Printer } from "lucide-react";

interface LoadingIndicatorProps {
  label: string;
  className?: string;
}

export function LoadingIndicator({ label, className = "" }: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      className={`flex min-h-36 flex-col items-center justify-center gap-4 p-4 text-center ${className}`}
    >
      <div aria-hidden="true" className="relative grid size-16 place-items-center">
        <div className="absolute inset-0 rounded-full border-2 border-[#E84C1E]/15" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#E84C1E] motion-safe:animate-spin" />
        <div className="grid size-11 place-items-center rounded-xl bg-[#E84C1E]/10 text-[#E84C1E]">
          <Printer size={22} strokeWidth={1.8} />
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
    </div>
  );
}
