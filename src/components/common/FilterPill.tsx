interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
        active ? "bg-primary text-primary-foreground" : "bg-white border border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
