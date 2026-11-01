"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { FilterPill } from "../../components/ui/FilterPill";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import { SelectField, TextAreaField, TextField } from "../../components/ui/FormField";
import { ComboBox } from "../../components/ui/ComboBox";
import { CURRENT_DATE, ORDER_TYPES } from "../../lib/data";
import { nextOrderId } from "../../lib/id";
import { formatMobile, positiveInteger, required } from "../../lib/validation";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { useUrlState } from "../../hooks/useUrlState";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { Order } from "../../types";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "New", value: "New" },
  { label: "Design", value: "Design" },
  { label: "Printing", value: "Printing" },
  { label: "Binding", value: "Binding" },
  { label: "Ready", value: "Ready" },
  { label: "Delivered", value: "Delivered" },
  { label: "Bill Pending", value: "Pending for Bill" },
  { label: "Overdue", value: "Overdue" },
];
const COLOR_MODES = ["Color", "Black & White", "Spot Color"] as const;

interface OrderFormState {
  clientId: string;
  branchId: string;
  contactName: string;
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
  clientId: "", branchId: "", contactName: "", mobile: "",
  type: ORDER_TYPES[0], qty: "",
  orderDate: CURRENT_DATE, dueDate: "",
  paperType: "", size: "", colorMode: "Color", binding: "", notes: "",
};

export function Orders() {
  usePageTitle("Orders");
  const router = useRouter();
  const toast = useToast();
  const { orders, clients, staff, createOrder } = useAppData();

  const [search, setSearch] = useUrlState("q", "");
  const [statusFilter, setStatusFilter] = useUrlState("status", "All");
  const [advClient, setAdvClient] = useUrlState("client", "");
  const [advType, setAdvType] = useUrlState("otype", "");
  const [advStaff, setAdvStaff] = useUrlState("staff", "");
  const [advPaper, setAdvPaper] = useUrlState("paper", "");
  const [advColor, setAdvColor] = useUrlState("color", "");
  const [orderFrom, setOrderFrom] = useUrlState("orderFrom", "");
  const [orderTo, setOrderTo] = useUrlState("orderTo", "");
  const [dueFrom, setDueFrom] = useUrlState("dueFrom", "");
  const [dueTo, setDueTo] = useUrlState("dueTo", "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<OrderFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<"clientId" | "branchId" | "contactName" | "type" | "qty", string>>>({});

  const advancedActive = Boolean(
    advClient || advType || advStaff || advPaper || advColor || orderFrom || orderTo || dueFrom || dueTo
  );

  const filtered = orders.filter(o => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;

    const q = search.trim().toLowerCase();
    if (q) {
      const haystack = [o.id, o.client, o.type, o.staff, o.paperType, o.size, o.branch ?? "", o.contactName ?? ""]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (advClient && o.clientId !== Number(advClient)) return false;
    if (advType && o.type !== advType) return false;
    if (advStaff && o.staff !== advStaff) return false;
    if (advPaper && !o.paperType.toLowerCase().includes(advPaper.toLowerCase())) return false;
    if (advColor && o.colorMode !== advColor) return false;
    if (orderFrom && o.orderDate < orderFrom) return false;
    if (orderTo && o.orderDate > orderTo) return false;
    if (dueFrom && (o.dueDate === "TBD" || o.dueDate < dueFrom)) return false;
    if (dueTo && (o.dueDate === "TBD" || o.dueDate > dueTo)) return false;

    return true;
  });

  const selectedClient = clients.find(c => String(c.id) === form.clientId);
  const branches = selectedClient?.branches ?? [];
  const selectedBranch = branches.find(b => String(b.id) === form.branchId);

  const clientOptions = useMemo(
    () => clients.map(c => ({ value: String(c.id), label: c.org })).sort((a, b) => a.label.localeCompare(b.label)),
    [clients]
  );
  // Built-in types plus any custom types used on earlier orders or added in this form.
  const [addedTypes, setAddedTypes] = useState<string[]>([]);
  const typeOptions = useMemo(
    () => Array.from(new Set([...ORDER_TYPES, ...orders.map(o => o.type), ...addedTypes])).map(t => ({ value: t, label: t })),
    [orders, addedTypes]
  );
  const filterTypeOptions = useMemo(
    () => Array.from(new Set([...ORDER_TYPES, ...orders.map(o => o.type)])).sort().map(t => ({ value: t, label: t })),
    [orders]
  );
  const staffOptions = useMemo(
    () => staff.map(s => ({ value: s.name, label: s.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [staff]
  );

  function clearAdvanced() {
    setAdvClient("");
    setAdvType("");
    setAdvStaff("");
    setAdvPaper("");
    setAdvColor("");
    setOrderFrom("");
    setOrderTo("");
    setDueFrom("");
    setDueTo("");
  }

  function selectClient(clientId: string) {
    const c = clients.find(x => String(x.id) === clientId);
    setForm(p => ({ ...p, clientId, branchId: "", contactName: c?.name ?? "", mobile: c?.mobile ?? "" }));
    setErrors(p => ({ ...p, clientId: undefined, branchId: undefined, contactName: undefined }));
  }

  function selectBranch(branchId: string) {
    const b = branches.find(x => String(x.id) === branchId);
    // Branches have no contact person of their own, so keep the client's name and use the branch mobile.
    setForm(p => ({ ...p, branchId, contactName: selectedClient?.name ?? p.contactName, mobile: b?.mobile ?? selectedClient?.mobile ?? "" }));
    setErrors(p => ({ ...p, branchId: undefined }));
  }

  function addOrderType(label: string) {
    setAddedTypes(p => [...p, label]);
    setForm(p => ({ ...p, type: label }));
    setErrors(p => ({ ...p, type: undefined }));
  }

  async function handleCreate() {
    const nextErrors = {
      clientId: selectedClient ? undefined : "Select an organization.",
      branchId: branches.length > 0 && !selectedBranch ? "Select a branch." : undefined,
      contactName: required(form.contactName, "Contact name is required."),
      type: required(form.type, "Order type is required."),
      qty: positiveInteger(form.qty),
    };
    if (Object.values(nextErrors).some(Boolean) || !selectedClient) {
      setErrors(nextErrors);
      return;
    }

    const order: Order = {
      id: nextOrderId(orders), clientId: selectedClient.id, client: selectedClient.org,
      ...(selectedBranch ? { branchId: selectedBranch.id, branch: selectedBranch.name } : {}),
      contactName: form.contactName.trim(), contactMobile: form.mobile ? formatMobile(form.mobile) : "",
      type: form.type.trim(),
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
        subtitle={`${filtered.length} of ${orders.length} orders`}
        actions={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create Order</Button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative flex-1 min-w-[220px] max-w-[320px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="order-search" className="sr-only">Search orders</label>
          <input
            id="order-search"
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Search ID, client, type, staff..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            showAdvanced || advancedActive
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-white text-muted-foreground border-border hover:bg-muted"
          }`}
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal size={13} />
          Advanced
          <ChevronDown size={13} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
        {advancedActive && (
          <button
            type="button"
            onClick={clearAdvanced}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={12} /> Clear advanced
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectField
              label="Client"
              value={advClient}
              options={[{ value: "", label: "Any client" }, ...clientOptions]}
              onChange={setAdvClient}
            />
            <SelectField
              label="Order type"
              value={advType}
              options={[{ value: "", label: "Any type" }, ...filterTypeOptions]}
              onChange={setAdvType}
            />
            <SelectField
              label="Staff"
              value={advStaff}
              options={[{ value: "", label: "Any staff" }, ...staffOptions]}
              onChange={setAdvStaff}
            />
            <SelectField
              label="Color mode"
              value={advColor}
              options={[{ value: "", label: "Any color" }, ...COLOR_MODES.map(c => ({ value: c, label: c }))]}
              onChange={setAdvColor}
            />
            <TextField label="Paper type contains" value={advPaper} onChange={setAdvPaper} placeholder="e.g. Maplitho" />
            <TextField label="Order date from" type="date" value={orderFrom} onChange={setOrderFrom} />
            <TextField label="Order date to" type="date" value={orderTo} onChange={setOrderTo} />
            <TextField label="Due date from" type="date" value={dueFrom} onChange={setDueFrom} />
            <TextField label="Due date to" type="date" value={dueTo} onChange={setDueTo} />
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {STATUS_FILTERS.map(s => (
          <FilterPill
            key={s.value}
            label={s.label}
            active={statusFilter === s.value}
            onClick={() => setStatusFilter(s.value)}
          />
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={o => o.id}
        onRowClick={o => router.push(`/dashboard/orders/${o.id}`)}
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
                <ComboBox label="Organization *" placeholder="Search organization..." value={form.clientId} options={clientOptions} onChange={selectClient} error={errors.clientId} />
              </div>
              {branches.length > 0 && (
                <div className="col-span-2">
                  <ComboBox
                    label="Branch *"
                    placeholder="Search branch..."
                    value={form.branchId}
                    options={branches.map(b => ({ value: String(b.id), label: b.name }))}
                    onChange={selectBranch}
                    error={errors.branchId}
                  />
                </div>
              )}
              <TextField label="Contact Name *" placeholder="Contact person name" value={form.contactName} onChange={v => { setForm(p => ({ ...p, contactName: v })); setErrors(p => ({ ...p, contactName: undefined })); }} error={errors.contactName} />
              <TextField label="Mobile" type="tel" placeholder="98765 43210" value={form.mobile} onChange={v => setForm(p => ({ ...p, mobile: v }))} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Order & Print Specs</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <ComboBox
                  label="Order Type *"
                  placeholder="Search or add order type..."
                  value={form.type}
                  options={typeOptions}
                  onChange={v => { setForm(p => ({ ...p, type: v })); setErrors(p => ({ ...p, type: undefined })); }}
                  onCreate={addOrderType}
                  error={errors.type}
                />
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
