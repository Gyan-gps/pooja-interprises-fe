import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { FilterPill } from "../../components/common/FilterPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "../../components/common/DataTable";
import { SelectField, TextAreaField, TextField } from "../../components/common/FormField";
import { CURRENT_DATE, ORDER_TYPES } from "../../lib/data";
import { nextOrderId } from "../../lib/id";
import { positiveInteger, required } from "../../lib/validation";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { useUrlState } from "../../hooks/useUrlState";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { Order } from "../../types";

const STATUS_FILTERS = ["All", "New", "Design", "Printing", "Binding", "Packing", "Ready", "Delivered", "Overdue"];
const COLOR_MODES = ["Color", "Black & White", "Spot Color"] as const;

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
  orderDate: CURRENT_DATE, dueDate: "",
  paperType: "", size: "", colorMode: "Color", binding: "", notes: "",
};

export function Orders() {
  usePageTitle("Orders");
  const navigate = useNavigate();
  const toast = useToast();
  const { orders, createOrder } = useAppData();

  const [search, setSearch] = useUrlState("q", "");
  const [statusFilter, setStatusFilter] = useUrlState("status", "All");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<OrderFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<"client" | "qty", string>>>({});

  const filtered = orders.filter(o => {
    const ok = statusFilter === "All" || o.status === statusFilter;
    const q = search.toLowerCase();
    return ok && (o.client.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.type.toLowerCase().includes(q));
  });

  async function handleCreate() {
    const nextErrors = {
      client: required(form.client, "Client name is required."),
      qty: positiveInteger(form.qty),
    };
    if (nextErrors.client || nextErrors.qty) {
      setErrors(nextErrors);
      return;
    }

    const order: Order = {
      id: nextOrderId(orders), clientId: 0, client: form.org || form.client, type: form.type,
      qty: Number(form.qty), dueDate: form.dueDate || "TBD", orderDate: form.orderDate,
      status: "New", staff: "—",
      paperType: form.paperType, size: form.size, colorMode: form.colorMode,
      binding: form.binding, notes: form.notes,
      deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "",
      statusHistory: [{ status: "New", at: form.orderDate }],
    };
    const created = await createOrder(order);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setErrors({});
    toast.show(`Order ${created.id} created.`);
  }

  const columns: DataTableColumn<Order>[] = [
    { key: "id", header: "Order ID", sortValue: o => o.id, render: o => <span className="font-mono text-xs font-bold text-foreground">{o.id}</span> },
    { key: "client", header: "Client", sortValue: o => o.client, render: o => <span className="text-sm text-foreground">{o.client}</span> },
    { key: "type", header: "Type", render: o => <span className="text-xs text-muted-foreground">{o.type}</span> },
    { key: "qty", header: "Qty", sortValue: o => o.qty, render: o => <span className="font-mono text-xs text-foreground">{o.qty.toLocaleString()}</span> },
    { key: "spec", header: "Paper / Size", render: o => <span className="text-xs text-muted-foreground">{[o.paperType, o.size].filter(Boolean).join(" · ") || "—"}</span> },
    { key: "orderDate", header: "Order Date", sortValue: o => o.orderDate, render: o => <span className="font-mono text-xs text-muted-foreground">{o.orderDate}</span> },
    { key: "dueDate", header: "Due Date", sortValue: o => o.dueDate, render: o => <span className="font-mono text-xs text-muted-foreground">{o.dueDate}</span> },
    { key: "status", header: "Status", render: o => <StatusBadge label={o.status} /> },
    { key: "staff", header: "Staff", render: o => <span className="text-xs text-muted-foreground">{o.staff}</span> },
  ];

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

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={o => o.id}
        onRowClick={o => navigate(`/orders/${o.id}`)}
        emptyMessage="No orders match the current filter."
      />

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
              <div className="col-span-2">
                <TextField label="Client Name *" placeholder="Contact person name" value={form.client} onChange={v => { setForm(p => ({ ...p, client: v })); setErrors(p => ({ ...p, client: undefined })); }} error={errors.client} />
              </div>
              <div className="col-span-2">
                <TextField label="Organization" placeholder="School / Hospital / Academy" value={form.org} onChange={v => setForm(p => ({ ...p, org: v }))} />
              </div>
              <TextField label="Mobile" type="tel" placeholder="98765 43210" value={form.mobile} onChange={v => setForm(p => ({ ...p, mobile: v }))} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Order & Print Specs</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <SelectField label="Order Type *" value={form.type} options={ORDER_TYPES} onChange={v => setForm(p => ({ ...p, type: v }))} />
              </div>
              <TextField label="Quantity *" type="number" placeholder="500" value={form.qty} onChange={v => { setForm(p => ({ ...p, qty: v })); setErrors(p => ({ ...p, qty: undefined })); }} error={errors.qty} />
              <SelectField label="Color Mode" value={form.colorMode} options={COLOR_MODES} onChange={v => setForm(p => ({ ...p, colorMode: v }))} />
              <TextField label="Paper Type" placeholder="80 GSM Maplitho" value={form.paperType} onChange={v => setForm(p => ({ ...p, paperType: v }))} />
              <TextField label="Size" placeholder="A4, A3, 6×9" value={form.size} onChange={v => setForm(p => ({ ...p, size: v }))} />
              <TextField label="Binding Type" placeholder="Perfect / Spiral / Staple" value={form.binding} onChange={v => setForm(p => ({ ...p, binding: v }))} />
              <TextField label="Order Date" type="date" value={form.orderDate} onChange={v => setForm(p => ({ ...p, orderDate: v }))} />
              <TextField label="Delivery Date" type="date" value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} />
              <div className="col-span-2">
                <TextAreaField label="Special Instructions" placeholder="Any special requirements, design notes..." value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
