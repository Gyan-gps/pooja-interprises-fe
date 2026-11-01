import { STATUS_CLS } from "../../lib/constants";

export function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
        STATUS_CLS[label] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}
