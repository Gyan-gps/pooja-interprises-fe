import { NavLink } from "react-router-dom";
import { Printer, X } from "lucide-react";
import { NAV_ITEMS } from "../../lib/constants";

interface SidebarProps {
  /** Mobile drawer state — ignored on desktop, where the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-56 shrink-0 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#111827" }}
      >
        <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E84C1E] flex items-center justify-center shrink-0">
              <Printer size={14} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Pooja</div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Enterprises
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="text-white/60 hover:text-white lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, path, icon: Icon }) => (
            <NavLink
              key={id}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive ? "bg-[#E84C1E] text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#E84C1E] flex items-center justify-center text-white text-xs font-bold shrink-0">P</div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">Admin</div>
              <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>Pooja Enterprises</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
