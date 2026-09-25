import { useState, type Dispatch, type SetStateAction } from "react";
import { Plus, Search, Eye } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { FilterPill } from "../../components/common/FilterPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ORDER_TYPES } from "../../lib/data";
import { usePageTitle } from "../../hooks/usePageTitle";
import { OrderDetail } from "./OrderDetail";
import type { Client, Order } from "../../types";

const STATUS_FILTERS = ["All", "New", "Design", "Printing", "Binding", "Packing", "Ready", "Delivered", "Overdue"];

interface OrderFormState {
  client: string;
  org: string;
  mobile: string;
  type: string;
  qty: string;
  orderDate: string;
  dueDate: string;
  paperType: string;
  size: string;
  colorMode: string;
  binding: string;
  notes: string;
}

const EMPTY_FORM: OrderFormState = {
  client: "", org: "", mobile: "",
  type: ORDER_TYPES[0], qty: "",
  orderDate: "2026-06-23", dueDate: "",
  paperType: "", size: "", colorMode: "Color", binding: "", notes: "",
};

interface OrdersProps {
  orders: Order[];
  clients: Client[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
}

export function Orders({ orders, clients, setOrders }: OrdersProps) {
  usePageTitle("Orders");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<OrderFormState>(EMPTY_FORM);

  // Keep viewingOrder in sync when orders update (e.g. after delivery)
  const liveOrder = viewingOrder ? orders.find(o => o.id === viewingOrder.id) ?? viewingOrder : null;

  if (liveOrder) {
    return <OrderDetail order={liveOrder} clients={clients} setOrders={setOrders} onBack={() => setViewingOrder(null)} />;
  }

  const filtered = orders.filter(o => {
    const ok = statusFilter === "All" || o.status === statusFilter;
    const q = search.toLowerCase();
    return ok && (o.client.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.type.toLowerCase().includes(q));
  });

  function handleCreate() {
    if (!form.client || !form.qty) return;
    const nextId = `PJE-${String(orders.length + 90).padStart(3, "0")}`;
    const o: Order = {
      id: nextId, clientId: 0, client: form.org || form.client, type: form.type,
      qty: Number(form.qty), dueDate: form.dueDate || "TBD", orderDate: form.orderDate,
      status: "New", staff: "—",
      paperType: form.paperType, size: form.size, colorMode: form.colorMode,
      binding: form.binding, notes: form.notes,
      deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "",
    };
    setOrders(prev => [o, ...prev]);
    setShowCreate(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create Order</Button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-[320px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="order-search" className="sr-only">Search orders</label>
          <input
            id="order-search"
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Search client, ID or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => <FilterPill key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Order ID", "Client", "Type", "Qty", "Paper / Size", "Order Date", "Due Date", "Status", "Staff", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr
                  key={o.id}
                  tabIndex={0}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${o.status === "Overdue" ? "bg-red-50/40" : ""}`}
                  onClick={() => setViewingOrder(o)}
                  onKeyDown={e => e.key === "Enter" && setViewingOrder(o)}
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{o.id}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{o.client}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{o.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{[o.paperType, o.size].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.orderDate}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.dueDate}</td>
                  <td className="px-4 py-3"><StatusBadge label={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.staff}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-[#E84C1E] font-semibold">
                      <Eye size={12} /> View
                      {o.status === "Ready" && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No orders match the current filter.</div>
        )}
      </div>

      {showCreate && (
        <Modal
          title="Create New Order"
          subtitle="Fill in client and print specifications"
          size="lg"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowCreate(false)} className="flex-1 justify-center">Cancel</Button>
              <Button variant="primary" onClick={handleCreate} className="flex-1 justify-center">Create Order</Button>
            </>
          }
        >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Client Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { label: "Client Name *", key: "client", placeholder: "Contact person name" },
                      { label: "Organization", key: "org", placeholder: "School / Hospital / Academy" },
                      { label: "Mobile", key: "mobile", placeholder: "98765 43210" },
                    ] as const
                  ).map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label htmlFor={`order-${key}`} className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
                      <input
                        id={`order-${key}`}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30"
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Order & Print Specs</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="order-type" className="text-xs font-semibold text-muted-foreground block mb-1">Order Type *</label>
                    <select id="order-type" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      {ORDER_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="order-qty" className="text-xs font-semibold text-muted-foreground block mb-1">Quantity *</label>
                    <input id="order-qty" type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="500" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="order-color" className="text-xs font-semibold text-muted-foreground block mb-1">Color Mode</label>
                    <select id="order-color" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={form.colorMode} onChange={e => setForm(p => ({ ...p, colorMode: e.target.value }))}>
                      <option>Color</option><option>Black & White</option><option>Spot Color</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="order-paper" className="text-xs font-semibold text-muted-foreground block mb-1">Paper Type</label>
                    <input id="order-paper" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="80 GSM Maplitho" value={form.paperType} onChange={e => setForm(p => ({ ...p, paperType: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="order-size" className="text-xs font-semibold text-muted-foreground block mb-1">Size</label>
                    <input id="order-size" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="A4, A3, 6×9" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="order-binding" className="text-xs font-semibold text-muted-foreground block mb-1">Binding Type</label>
                    <input id="order-binding" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="Perfect / Spiral / Staple" value={form.binding} onChange={e => setForm(p => ({ ...p, binding: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="order-order-date" className="text-xs font-semibold text-muted-foreground block mb-1">Order Date</label>
                    <input id="order-order-date" type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={form.orderDate} onChange={e => setForm(p => ({ ...p, orderDate: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="order-due-date" className="text-xs font-semibold text-muted-foreground block mb-1">Delivery Date</label>
                    <input id="order-due-date" type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="order-notes" className="text-xs font-semibold text-muted-foreground block mb-1">Special Instructions</label>
                    <textarea id="order-notes" rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" placeholder="Any special requirements, design notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>
        </Modal>
      )}
    </div>
  );
}
