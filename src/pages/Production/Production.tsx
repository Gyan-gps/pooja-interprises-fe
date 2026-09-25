import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { KANBAN_COLORS } from "../../lib/constants";
import { KANBAN_COLS } from "../../lib/data";
import { withStatusChange } from "../../lib/orderHistory";
import { useAppData } from "../../lib/appDataContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { OrderStatus } from "../../types";

export function Production() {
  usePageTitle("Production");
  const navigate = useNavigate();
  const { orders, updateOrder } = useAppData();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const activeOrders = orders.filter(o => o.status !== "Overdue");

  function handleDrop(col: OrderStatus) {
    const order = orders.find(o => o.id === dragging);
    if (order) updateOrder(order.id, withStatusChange(order, col));
    setDragging(null);
    setDragOver(null);
  }

  const overdueOrders = orders.filter(o => o.status === "Overdue");

  return (
    <div className="p-6">
      <PageHeader title="Production Tracker" subtitle="Drag cards between columns to update workflow status, or click one to open it" />
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-2">
        {KANBAN_COLS.map((col, i) => (
          <div key={col} className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: KANBAN_COLORS[col] + "18", color: KANBAN_COLORS[col] }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: KANBAN_COLORS[col] }} />{col}
            </div>
            {i < KANBAN_COLS.length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1100px]">
          {KANBAN_COLS.map(col => {
            const colOrders = activeOrders.filter(o => o.status === col);
            const isOver = dragOver === col;
            return (
              <div key={col} className={`flex-1 min-w-[148px] rounded-xl transition-all ${isOver ? "ring-2 ring-primary bg-primary/5" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragOver(col); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
                onDrop={() => handleDrop(col)}
              >
                <div className="rounded-t-xl px-3 py-2.5 mb-2 flex items-center justify-between" style={{ background: KANBAN_COLORS[col] + "15", borderBottom: `2px solid ${KANBAN_COLORS[col]}` }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: KANBAN_COLORS[col] }}>{col}</span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: KANBAN_COLORS[col] }}>{colOrders.length}</span>
                </div>
                <div className="space-y-2 px-1 pb-2 min-h-[180px]">
                  {colOrders.map(o => (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={() => setDragging(o.id)}
                      onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      onClick={() => navigate(`/orders/${o.id}`)}
                      className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none shadow-sm hover:shadow-md hover:border-[#E84C1E]/40 transition-all ${dragging === o.id ? "opacity-40 scale-95" : ""}`}
                    >
                      <div className="font-mono text-[10px] font-bold text-muted-foreground mb-1">{o.id}</div>
                      <div className="text-xs font-bold text-foreground leading-snug mb-1">{o.client}</div>
                      <div className="text-[10px] text-muted-foreground mb-2">{o.type}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-foreground">{o.qty.toLocaleString()} pcs</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{o.dueDate.slice(5)}</span>
                      </div>
                      {o.staff !== "—" && <div className="mt-2 font-mono text-[9px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 truncate">{o.staff}</div>}
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div className={`flex items-center justify-center h-20 text-[10px] font-semibold ${isOver ? "text-primary" : "text-muted-foreground/40"}`}>{isOver ? "Drop here" : "Empty"}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {overdueOrders.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Overdue Orders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {overdueOrders.map(o => (
              <button
                type="button"
                key={o.id}
                onClick={() => navigate(`/orders/${o.id}`)}
                className="bg-white border border-red-200 rounded-xl p-3 text-left hover:border-red-400 transition-colors cursor-pointer"
              >
                <div className="font-mono text-xs font-bold text-red-600">{o.id}</div>
                <div className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{o.client}</div>
                <div className="text-[10px] text-muted-foreground">{o.type}</div>
                <div className="text-xs font-bold text-red-600 mt-1.5">Due: {o.dueDate}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
