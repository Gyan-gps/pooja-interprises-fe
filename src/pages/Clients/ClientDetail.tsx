import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { FilterPill } from "../../components/common/FilterPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { SelectField, TextAreaField, TextField } from "../../components/common/FormField";
import { ComboBox } from "../../components/common/ComboBox";
import { CURRENT_DATE, ORDER_TYPES } from "../../lib/data";
import { clientTypeOptions, typeCls } from "../../lib/constants";
import { nextOrderId } from "../../lib/id";
import { formatMobile, mobileNumber, required } from "../../lib/validation";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { ClientType, Order } from "../../types";
import { BranchFields, hasBranchErrors, toBranchDrafts, toBranches, validateBranches, type BranchDraft, type BranchErrors } from "./BranchFields";

const CLIENT_TABS = ["overview", "orders", "notes"] as const;
type ClientTab = (typeof CLIENT_TABS)[number];
const COLOR_MODES = ["Color", "Black & White", "Spot Color"] as const;

const CLIENT_NOTES: Record<string, string> = {
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
  type: ORDER_TYPES[0], qty: "", orderDate: CURRENT_DATE, dueDate: "",
  colorMode: "Color", paperType: "", size: "", binding: "", notes: "",
};

interface EditForm {
  name: string;
  org: string;
  mobile: string;
  type: ClientType;
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { clients, orders, createOrder, updateClient, deleteClient } = useAppData();

  const client = clients.find(c => c.id === Number(id));

  const [activeTab, setActiveTab] = useState<ClientTab>("overview");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orderYearFilter, setOrderYearFilter] = useState("All");
  const [orderForm, setOrderForm] = useState<OrderFormState>(EMPTY_ORDER_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [editBranches, setEditBranches] = useState<BranchDraft[]>([]);
  const [editBranchErrors, setEditBranchErrors] = useState<BranchErrors[]>([]);
  const [showDelete, setShowDelete] = useState(false);

  usePageTitle(client ? client.name : "Client not found");

  if (!client) {
    return (
      <div className="p-6">
        <Link to="/clients" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 w-fit">
          <ArrowLeft size={14} /> Back to Clients
        </Link>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No client found with id "{id}".</p>
        </div>
      </div>
    );
  }

  const clientOrders = orders.filter(o => o.clientId === client.id);
  const orderYears = Array.from(new Set(clientOrders.map(o => o.orderDate.slice(0, 4)))).sort((a, b) => Number(b) - Number(a));
  const visibleOrders = orderYearFilter === "All" ? clientOrders : clientOrders.filter(o => o.orderDate.startsWith(orderYearFilter));

  async function handleCreateOrder() {
    if (!orderForm.qty) return;
    const order: Order = {
      id: nextOrderId(orders), clientId: client!.id, client: client!.org,
      type: orderForm.type, qty: Number(orderForm.qty),
      dueDate: orderForm.dueDate || "TBD", orderDate: orderForm.orderDate,
      status: "New", staff: "—",
      paperType: orderForm.paperType, size: orderForm.size,
      colorMode: orderForm.colorMode, binding: orderForm.binding, notes: orderForm.notes,
      deliveredTo: "", deliveredMobile: "", deliveredDate: "", deliveryNotes: "", acknowledgementFile: "",
      statusHistory: [{ status: "New", at: orderForm.orderDate }],
    };
    const created = await createOrder(order);
    setShowCreateOrder(false);
    setOrderForm(EMPTY_ORDER_FORM);
    setActiveTab("orders");
    toast.show(`Order ${created.id} created for ${client!.name}.`);
  }

  function startEdit() {
    setEditForm({ name: client!.name, org: client!.org, mobile: client!.mobile, type: client!.type });
    setEditBranches(toBranchDrafts(client!.branches));
    setEditBranchErrors([]);
    setEditErrors({});
    setIsEditing(true);
  }

  async function saveEdit() {
    if (!editForm) return;
    const nextErrors = {
      name: required(editForm.name, "Contact name is required."),
      org: required(editForm.org, "Organization is required."),
      mobile: mobileNumber(editForm.mobile),
    };
    const nextBranchErrors = validateBranches(editBranches);
    if (nextErrors.name || nextErrors.org || nextErrors.mobile || hasBranchErrors(nextBranchErrors)) {
      setEditErrors(nextErrors);
      setEditBranchErrors(nextBranchErrors);
      return;
    }
    await updateClient(client!.id, {
      name: editForm.name.trim(),
      org: editForm.org.trim(),
      mobile: formatMobile(editForm.mobile),
      type: editForm.type,
      branches: toBranches(editBranches),
    });
    setIsEditing(false);
    toast.show("Client updated.");
  }

  async function toggleActive() {
    const nextStatus = client!.status === "Active" ? "Inactive" : "Active";
    await updateClient(client!.id, { status: nextStatus });
    toast.show(`${client!.name} marked ${nextStatus.toLowerCase()}.`);
  }

  async function handleDelete() {
    await deleteClient(client!.id);
    navigate("/clients");
    toast.show(`${client!.name} deleted.`);
  }

  return (
    <div className="p-6">
      <Link to="/clients" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 w-fit">
        <ArrowLeft size={14} /> Back to Clients
      </Link>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E84C1E] flex items-center justify-center text-white font-bold text-lg shrink-0">{client.name.charAt(0)}</div>
            <div>
              <h2 className="font-bold text-foreground text-base">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{client.org}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeCls(client.type)}`}>{client.type}</span>
                <StatusBadge label={client.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
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
            {!isEditing && (
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => setShowCreateOrder(true)}><Plus size={14} /> New Order</Button>
                <Button variant="secondary" onClick={startEdit}><Pencil size={13} /> Edit</Button>
                <button
                  type="button"
                  onClick={toggleActive}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-foreground border border-border hover:bg-muted transition-colors cursor-pointer"
                >
                  <Power size={13} /> {client.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && editForm ? (
          <div className="p-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Edit Client</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
              <TextField label="Contact Person *" value={editForm.name} onChange={v => { setEditForm(p => p && { ...p, name: v }); setEditErrors(p => ({ ...p, name: undefined })); }} error={editErrors.name} />
              <TextField label="Organization *" value={editForm.org} onChange={v => { setEditForm(p => p && { ...p, org: v }); setEditErrors(p => ({ ...p, org: undefined })); }} error={editErrors.org} />
              <TextField label="Mobile *" type="tel" value={editForm.mobile} onChange={v => { setEditForm(p => p && { ...p, mobile: v }); setEditErrors(p => ({ ...p, mobile: undefined })); }} error={editErrors.mobile} />
              <ComboBox label="Client Type" placeholder="Search or add type..." value={editForm.type} options={clientTypeOptions(clients, [editForm.type])} onChange={v => setEditForm(p => p && { ...p, type: v })} onCreate={v => setEditForm(p => p && { ...p, type: v.trim() })} />
            </div>
            <div className="max-w-xl mt-5 pt-4 border-t border-border">
              <BranchFields
                branches={editBranches}
                errors={editBranchErrors}
                onChange={(next, changedIndex) => {
                  setEditBranches(next);
                  setEditBranchErrors(prev => (changedIndex === undefined ? [] : prev.map((e, i) => (i === changedIndex ? {} : e))));
                }}
              />
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <>
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
                  <div className="md:col-span-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Branches ({client.branches?.length ?? 0})
                    </h4>
                    {client.branches?.length ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            {["Branch", "Mobile", "Address"].map(h => (
                              <th key={h} className="pb-2.5 text-left text-xs text-muted-foreground font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {client.branches.map(b => (
                            <tr key={b.id} className="border-b border-border last:border-0">
                              <td className="py-2.5 font-medium">{b.name}</td>
                              <td className="py-2.5 font-mono text-xs">{b.mobile}</td>
                              <td className="py-2.5 text-xs text-muted-foreground">{b.address || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-muted-foreground">No branches. Use Edit to add one.</p>
                    )}
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
                          <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
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
                    {CLIENT_NOTES[client.type] ?? "No special instructions for this client type."}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
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
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${typeCls(client.type)}`}>{client.type}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <SelectField label="Order Type *" value={orderForm.type} options={ORDER_TYPES} onChange={v => setOrderForm(p => ({ ...p, type: v }))} />
            </div>
            <TextField label="Quantity *" type="number" placeholder="500" value={orderForm.qty} onChange={v => setOrderForm(p => ({ ...p, qty: v }))} />
            <SelectField label="Color Mode" value={orderForm.colorMode} options={COLOR_MODES} onChange={v => setOrderForm(p => ({ ...p, colorMode: v }))} />
            <TextField label="Paper Type" placeholder="80 GSM Maplitho" value={orderForm.paperType} onChange={v => setOrderForm(p => ({ ...p, paperType: v }))} />
            <TextField label="Size" placeholder="A4, A3, 6×9" value={orderForm.size} onChange={v => setOrderForm(p => ({ ...p, size: v }))} />
            <TextField label="Order Date" type="date" value={orderForm.orderDate} onChange={v => setOrderForm(p => ({ ...p, orderDate: v }))} />
            <TextField label="Delivery Date" type="date" value={orderForm.dueDate} onChange={v => setOrderForm(p => ({ ...p, dueDate: v }))} />
            <div className="col-span-2">
              <TextAreaField label="Special Instructions" rows={2} placeholder="Any special requirements..." value={orderForm.notes} onChange={v => setOrderForm(p => ({ ...p, notes: v }))} />
            </div>
          </div>
        </Modal>
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete Client"
          description={
            clientOrders.length > 0
              ? `${client.name} has ${clientOrders.length} order${clientOrders.length !== 1 ? "s" : ""} on record. Deleting the client keeps those orders (they'll still show "${client.org}"), but removes the client profile permanently.`
              : `This permanently removes ${client.name} (${client.org}). This can't be undone.`
          }
          confirmLabel="Delete Client"
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
