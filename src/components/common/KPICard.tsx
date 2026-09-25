import type { ElementType } from "react";

interface KPICardProps {
  title: string;
  value: string;
  sub?: string;
  icon: ElementType;
  iconBg: string;
}

export function KPICard({ title, value, sub, icon: Icon, iconBg }: KPICardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
