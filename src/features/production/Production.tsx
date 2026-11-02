"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { KANBAN_COLORS } from "../../lib/constants";
import { KANBAN_COLS } from "../../lib/data";
import { useAppData } from "../../lib/appDataContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useUrlState } from "../../hooks/useUrlState";
import { useToast } from "../../lib/toast";
import { MovePhaseModal } from "./MovePhaseModal";
import type { Order, OrderStatus } from "../../types";

const COLUMN_BODY_HEIGHT = "min(520px, calc(100vh - 22rem))";

interface PendingMove {
  order: Order;
  toStatus: OrderStatus;
}

export function Production() {
  usePageTitle("Production");
  const router = useRouter();
  const toast = useToast();
  const { orders, staff, updateOrder } = useAppData();
  const [search, setSearch] = useUrlState("q", "");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [didDrag, setDidDrag] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  const query = search.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!query) return orders;
    return orders.filter(o =>
      [o.orderNumber, o.client, o.type, o.staff, o.status].some(v => v.toLowerCase().includes(query))
    );
  }, [orders, query]);

  const boardOrders = filteredOrders.filter(o => o.status !== "Overdue");
  const overdueOrders = filteredOrders.filter(o => o.status === "Overdue");

  function handleDrop(col: OrderStatus) {
    const order = orders.find(o => o.id === dragging);
    setDragging(null);
    setDragOver(null);
    if (!order || order.status === col) return;
    setPendingMove({ order, toStatus: col });
  }

  async function confirmMove(staffName: string, readyCount?: number) {
    if (!pendingMove) return;
    const { order, toStatus } = pendingMove;
    const patch: Partial<Order> = {
      status: toStatus,
      staff: staffName,
    };
    if (readyCount !== undefined) patch.readyCount = readyCount;
    await updateOrder(order.id, patch);
    setPendingMove(null);
    toast.show(`${order.orderNumber} moved to ${toStatus} · assigned ${staffName}`);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Production Tracker"
        subtitle="Drag a card to the next phase — you’ll confirm the move and assign staff before it updates"
        actions={
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-full border border-border rounded-lg pl-8 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30"
              aria-label="Search production orders"
            />
          </div>
        }
      />

      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-2">
        {KANBAN_COLS.map((col, i) => (
          <div key={col} className="flex items-center gap-1 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: KANBAN_COLORS[col] + "18", color: KANBAN_COLORS[col] }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: KANBAN_COLORS[col] }} />
              {col}
            </div>
            {i < KANBAN_COLS.length - 1 && <ChevronRight size={12} className="text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1200px]">
          {KANBAN_COLS.map(col => {
            const colOrders = boardOrders.filter(o => o.status === col);
            const isOver = dragOver === col;
            return (
              <div
                key={col}
                className={`flex-1 min-w-[148px] rounded-xl transition-all flex flex-col ${isOver ? "ring-2 ring-primary bg-primary/5" : ""}`}
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(col);
                }}
                onDragLeave={e => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                }}
                onDrop={() => handleDrop(col)}
              >
                <div
                  className="rounded-t-xl px-3 py-2.5 flex items-center justify-between shrink-0"
                  style={{ background: KANBAN_COLORS[col] + "15", borderBottom: `2px solid ${KANBAN_COLORS[col]}` }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: KANBAN_COLORS[col] }}>
                    {col}
                  </span>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: KANBAN_COLORS[col] }}
                  >
                    {colOrders.length}
                  </span>
                </div>

                <div
                  className="space-y-2 px-1 py-2 overflow-y-auto overscroll-contain"
                  style={{ height: COLUMN_BODY_HEIGHT }}
                >
                  {colOrders.map(o => (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={() => {
                        setDragging(o.id);
                        setDidDrag(false);
                      }}
                      onDrag={() => setDidDrag(true)}
                      onDragEnd={() => {
                        setDragging(null);
                        setDragOver(null);
                      }}
                      onClick={() => {
                        if (didDrag) {
                          setDidDrag(false);
                          return;
                        }
                        router.push(`/dashboard/orders/${o.id}`);
                      }}
                      className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none shadow-sm hover:shadow-md hover:border-[#E84C1E]/40 transition-all ${
                        dragging === o.id ? "opacity-40 scale-95" : ""
                      }`}
                    >
                      <div className="font-mono text-[10px] font-bold text-muted-foreground mb-1">{o.orderNumber}</div>
                      <div className="text-xs font-bold text-foreground leading-snug mb-1">{o.client}</div>
                      <div className="text-[10px] text-muted-foreground mb-2">{o.type}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-foreground">
                          {(o.readyCount ?? o.qty).toLocaleString()} pcs
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{o.dueDate.slice(5)}</span>
                      </div>
                      {o.staff !== "—" && (
                        <div className="mt-2 font-mono text-[9px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 truncate">
                          {o.staff}
                        </div>
                      )}
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div
                      className={`flex items-center justify-center h-20 text-[10px] font-semibold ${
                        isOver ? "text-primary" : "text-muted-foreground/40"
                      }`}
                    >
                      {isOver ? "Drop here" : "Empty"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {overdueOrders.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Overdue Orders
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {overdueOrders.map(o => (
              <button
                type="button"
                key={o.id}
                onClick={() => router.push(`/dashboard/orders/${o.id}`)}
                className="bg-white border border-red-200 rounded-xl p-3 text-left hover:border-red-400 transition-colors cursor-pointer"
              >
                <div className="font-mono text-xs font-bold text-red-600">{o.orderNumber}</div>
                <div className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{o.client}</div>
                <div className="text-[10px] text-muted-foreground">{o.type}</div>
                <div className="text-xs font-bold text-red-600 mt-1.5">Due: {o.dueDate}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {pendingMove && (
        <MovePhaseModal
          order={pendingMove.order}
          fromStatus={pendingMove.order.status}
          toStatus={pendingMove.toStatus}
          staff={staff}
          onCancel={() => setPendingMove(null)}
          onConfirm={confirmMove}
        />
      )}
    </div>
  );
}
