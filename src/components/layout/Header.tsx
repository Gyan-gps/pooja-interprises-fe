import { ChevronRight, Bell, Menu } from "lucide-react";

interface HeaderProps {
  sectionLabel: string;
  onMenuClick: () => void;
}

export function Header({ sectionLabel, onMenuClick }: HeaderProps) {
  return (
    <header
      className="bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0"
      style={{ height: "52px" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground lg:hidden cursor-pointer shrink-0"
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="text-muted-foreground hidden sm:inline">Pooja Enterprises</span>
          <ChevronRight size={12} className="text-muted-foreground hidden sm:inline" />
          <span className="font-bold text-foreground truncate">{sectionLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors cursor-pointer"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E84C1E] rounded-full" />
        </button>
        <div className="w-7 h-7 rounded-full bg-[#E84C1E] flex items-center justify-center text-white text-xs font-bold">P</div>
      </div>
    </header>
  );
}
