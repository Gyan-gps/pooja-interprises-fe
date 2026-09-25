import { useState, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { FilterPill } from "../../components/common/FilterPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ORDER_TYPES } from "../../lib/data";
import { TYPE_CLS } from "../../lib/constants";
import type { Client, Order } from "../../types";

const CLIENT_TABS = ["overview", "orders", "notes"] as const;
type ClientTab = (typeof CLIENT_TABS)[number];

const CLIENT_NOTES: Record<Client["type"], string> = {
  School: "Prefers delivery before exam season. Quality paper (80 GSM) required for all books. Always include a delivery challan.",
  Hospital: "Requires NCR (carbon copy) forms. Strict deadline compliance. Medical content must be proof-read by client before printing.",
  Coaching: "Bulk orders preferred. Quick turnaround needed especially before scheduled test dates. Confirm quantities 48 hrs before print start.",
  College: "Certificates require gold foil embossing and A3 art paper. Prior written approval from principal required before print.",
  Corporate: "Premium matte/gloss finish required. Brand Pantone color accuracy is critical — use color proof before full run.",
};

interface OrderFormState {
  type: string;
  qty: string;
  orderDate: string;
  dueDate: string;
  colorMode: string;
  paperType: string;
  size: string;
  binding: string;
  notes: string;
}

const EMPTY_ORDER_FORM: OrderFormState = {
  type: ORDER_TYPES[0], qty: "", orderDate: "2026-06-23", dueDate: "",
  colorMode: "Color", paperType: "", size: "", binding: "", notes: "",
};

interface ClientDetailProps {
  client: Client;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  onBack: () => void;
}

export function ClientDetail({ client, orders, setOrders, onBack }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<ClientTab>("overview");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orderYearFilter, setOrderYearFilter] = useState("All");
  const [orderForm, setOrderForm] = useState<OrderFormState>(EMPTY_ORDER_FORM);

  const clientOrders = orders.filter(o => o.clientId === client.id);
  const orderYears = Array.from(new Set(clientOrders.map(o => o.orderDate.slice(0, 4)))).sort((a, b) => Number(b) - Number(a));
  const visibleOrders = orderYearFilter === "All" ? clientOrders : clientOrders.filter(o => o.orderDate.startsWith(orderYearFilter));

  function handleCreateOrder() {
    if (!orderForm.qty) return;
    const nextId = `PJE-${String(orders.length + 90).padStart(3, "0")}`;
    const o: Order = {
      id: nextId, clientId: client.id, client: client.org,
      type: orderForm.type, qty: Number(orderForm.qty),
      dueDate: orderForm.dueDate || "TBD", orderDate: orderForm.orderDate,
      status: "New", staff: "—",
      paperType: orderForm.paperType, size: orderForm.size,
      colorMode: orderForm.colorMode, binding: orderForm.binding, notes: orderForm.notes,
      deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "",
    };
    setOrders(prev => [o, ...prev]);
    setShowCreateOrder(false);
    setOrderForm(EMPTY_ORDER_FORM);
    setActiveTab("orders");
  }

  return (
    <div className="p-6">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 cursor-pointer">
        <ArrowLeft size={14} /> Back to Clients
      </button>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E84C1E] flex items-center justify-center text-white font-bold text-lg shrink-0">{client.name.charAt(0)}</div>
            <div>
              <h2 className="font-bold text-foreground text-base">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{client.org}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${TYPE_CLS[client.type]}`}>{client.type}</span>
                <StatusBadge label={client.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{clientOrders.length || client.orders}</div>
              <div className="text-[10px] text-muted-foreground">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-600">{clientOrders.filter(o => o.status === "Delivered").length}</div>
              <div className="text-[10px] text-muted-foreground">Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">{clientOrders.filter(o => !["Delivered", "Overdue"].includes(o.status)).length}</div>
              <div className="text-[10px] text-muted-foreground">Active</div>
            </div>
            <Button variant="primary" onClick={() => setShowCreateOrder(true)}><Plus size={14} /> New Order</Button>
          </div>
        </div>

        <div className="flex border-b border-border">
          {CLIENT_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors cursor-pointer ${activeTab === tab ? "border-b-2 border-[#E84C1E] text-[#E84C1E]" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
              {tab === "orders" && clientOrders.length > 0 && (
                <span className="ml-1.5 font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{clientOrders.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Contact Information</h4>
                <div className="space-y-2.5 text-sm">
                  {[
                    { l: "Mobile", v: client.mobile, mono: true },
                    { l: "Organization", v: client.org, mono: false },
                    { l: "Last Order", v: client.lastOrder, mono: true },
                    { l: "Status", v: client.status, mono: false },
                  ].map(({ l, v, mono }) => (
                    <div key={l} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-28 text-xs">{l}</span>
                      <span className={`font-medium ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Orders", val: clientOrders.length || client.orders, bg: "bg-muted/40", cls: "text-foreground" },
                  { label: "Delivered", val: clientOrders.filter(o => o.status === "Delivered").length, bg: "bg-emerald-50", cls: "text-emerald-700" },
                  { label: "Active", val: clientOrders.filter(o => !["Delivered", "Overdue"].includes(o.status)).length, bg: "bg-orange-50", cls: "text-orange-700" },
                  { label: "Overdue", val: clientOrders.filter(o => o.status === "Overdue").length, bg: "bg-red-50", cls: "text-red-700" },
                ].map(({ label, val, bg, cls }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <div className={`text-2xl font-bold ${cls}`}>{val}</div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year:</span>
                  {["All", ...orderYears].map(yr => (
                    <FilterPill key={yr} label={yr} active={orderYearFilter === yr} onClick={() => setOrderYearFilter(yr)} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {visibleOrders.length} order{visibleOrders.length !== 1 ? "s" : ""}{orderYearFilter !== "All" ? ` in ${orderYearFilter}` : ""}
                </span>
              </div>

              {visibleOrders.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No orders found{orderYearFilter !== "All" ? ` for ${orderYearFilter}` : ""}.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Order ID", "Type", "Qty", "Paper / Size", "Order Date", "Due Date", "Status"].map(h => (
                        <th key={h} className="pb-2.5 text-left text-xs text-muted-foreground font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map(o => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 font-mono text-xs font-bold text-foreground">{o.id}</td>
                        <td className="py-3 text-xs text-muted-foreground">{o.type}</td>
                        <td className="py-3 font-mono text-xs">{o.qty.toLocaleString()}</td>
                        <td className="py-3 text-xs text-muted-foreground">{[o.paperType, o.size].filter(Boolean).join(" · ") || "—"}</td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">{o.orderDate}</td>
                        <td className="py-3 font-mono text-xs text-muted-foreground">{o.dueDate}</td>
                        <td className="py-3"><StatusBadge label={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {orderYearFilter === "All" && orderYears.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Year-wise Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {orderYears.map(yr => {
                      const yrOrders = clientOrders.filter(o => o.orderDate.startsWith(yr));
                      return (
                        <button key={yr} type="button" onClick={() => setOrderYearFilter(yr)} className="bg-muted/40 hover:bg-muted/80 rounded-xl p-3 text-left transition-colors cursor-pointer">
                          <div className="font-mono text-sm font-bold text-foreground">{yr}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{yrOrders.length} orders</div>
                          <div className="text-xs font-bold text-emerald-600 mt-1">{yrOrders.filter(o => o.status === "Delivered").length} delivered</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Special Instructions</h4>
              <div className="bg-muted/40 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
                {CLIENT_NOTES[client.type]}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateOrder && (
        <Modal
          title="New Order"
          subtitle={`for ${client.name} · ${client.org}`}
          onClose={() => setShowCreateOrder(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowCreateOrder(false)} className="flex-1 justify-center">Cancel</Button>
              <Button variant="primary" onClick={handleCreateOrder} className="flex-1 justify-center">Create Order</Button>
            </>
          }
        >
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#E84C1E] flex items-center justify-center text-white font-bold text-sm shrink-0">{client.name.charAt(0)}</div>
                <div>
                  <div className="text-sm font-bold text-foreground">{client.name}</div>
                  <div className="text-xs text-muted-foreground">{client.org} · {client.mobile}</div>
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${TYPE_CLS[client.type]}`}>{client.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label htmlFor="co-type" className="text-xs font-semibold text-muted-foreground block mb-1">Order Type *</label>
                  <select id="co-type" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={orderForm.type} onChange={e => setOrderForm(p => ({ ...p, type: e.target.value }))}>
                    {ORDER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="co-qty" className="text-xs font-semibold text-muted-foreground block mb-1">Quantity *</label>
                  <input id="co-qty" type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="500" value={orderForm.qty} onChange={e => setOrderForm(p => ({ ...p, qty: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="co-color" className="text-xs font-semibold text-muted-foreground block mb-1">Color Mode</label>
                  <select id="co-color" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={orderForm.colorMode} onChange={e => setOrderForm(p => ({ ...p, colorMode: e.target.value }))}>
                    <option>Color</option><option>Black & White</option><option>Spot Color</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="co-paper" className="text-xs font-semibold text-muted-foreground block mb-1">Paper Type</label>
                  <input id="co-paper" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="80 GSM Maplitho" value={orderForm.paperType} onChange={e => setOrderForm(p => ({ ...p, paperType: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="co-size" className="text-xs font-semibold text-muted-foreground block mb-1">Size</label>
                  <input id="co-size" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="A4, A3, 6×9" value={orderForm.size} onChange={e => setOrderForm(p => ({ ...p, size: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="co-order-date" className="text-xs font-semibold text-muted-foreground block mb-1">Order Date</label>
                  <input id="co-order-date" type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={orderForm.orderDate} onChange={e => setOrderForm(p => ({ ...p, orderDate: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="co-due-date" className="text-xs font-semibold text-muted-foreground block mb-1">Delivery Date</label>
                  <input id="co-due-date" type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={orderForm.dueDate} onChange={e => setOrderForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label htmlFor="co-notes" className="text-xs font-semibold text-muted-foreground block mb-1">Special Instructions</label>
                  <textarea id="co-notes" rows={2} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" placeholder="Any special requirements..." value={orderForm.notes} onChange={e => setOrderForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
        </Modal>
      )}
    </div>
  );
}
