import { ZoomIn } from "lucide-react";

interface ZoomToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

/**
 * Accessible on/off switch for cursor-based zoom, styled from the app's
 * existing tokens (the same orange accent as active nav/status states, the
 * same border/muted colors as every other header control) — no new switch
 * design introduced.
 */
export function ZoomToggle({ enabled, onChange }: ZoomToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={`Zoom, switch, ${enabled ? "on" : "off"}`}
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full border border-border hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <ZoomIn size={13} className="text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Zoom</span>
      <span
        aria-hidden="true"
        className={`relative w-8 h-[18px] rounded-full transition-colors ${enabled ? "bg-[#E84C1E]" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-[14px]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
