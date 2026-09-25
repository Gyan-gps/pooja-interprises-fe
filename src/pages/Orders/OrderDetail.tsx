import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  CheckCircle2, Truck, AlertTriangle, FileText, Calendar,
  Upload, Check, ClipboardCheck, User, Phone, ArrowLeft, Info, X,
} from "lucide-react";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { WORKFLOW_STEPS } from "../../lib/data";
import { TYPE_CLS } from "../../lib/constants";
import type { Client, Order } from "../../types";

interface OrderDetailProps {
  order: Order;
  clients: Client[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  onBack: () => void;
}

export function OrderDetail({ order, clients, setOrders, onBack }: OrderDetailProps) {
  const [showDeliver, setShowDeliver] = useState(false);
  const [deliverForm, setDeliverForm] = useState({
    receiverName: "",
    receiverMobile: "",
    deliveryDate: "2026-06-23",
    notes: "",
    fileName: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const stepIdx = order.status === "Overdue" ? -1 : WORKFLOW_STEPS.indexOf(order.status);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setDeliverForm(p => ({ ...p, fileName: f.name }));
  }

  function handleDeliver() {
    if (!deliverForm.receiverName) return;
    setOrders(prev => prev.map(o =>
      o.id === order.id
        ? {
            ...o,
            status: "Delivered",
            deliveredTo: deliverForm.receiverName,
            deliveredMobile: deliverForm.receiverMobile,
            deliveredDate: deliverForm.deliveryDate,
            deliveryNotes: deliverForm.notes,
            acknowledgementFile: deliverForm.fileName || "acknowledgement_signed.pdf",
          }
        : o
    ));
    setShowDeliver(false);
    onBack();
  }

  const client = clients.find(c => c.id === order.clientId);

  return (
    <div className="p-6 space-y-4">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E84C1E]/10 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#E84C1E]" />
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-foreground">{order.id}</div>
                <div className="text-base font-semibold text-foreground">{order.client}</div>
                <div className="text-sm text-muted-foreground">{order.type} · {order.qty.toLocaleString()} pcs</div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge label={order.status} />
                  {order.staff !== "—" && (
                    <span className="text-xs text-muted-foreground">Staff: <span className="font-semibold text-foreground">{order.staff}</span></span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {order.status === "Ready" && (
                <button
                  type="button"
                  onClick={() => setShowDeliver(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Truck size={15} /> Record Delivery
                </button>
              )}
              {order.status === "Delivered" && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={14} /> Delivered
                </div>
              )}
              {order.status === "Overdue" && (
                <div className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700">
                  <AlertTriangle size={14} /> Overdue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-5">Production Workflow</h3>

        {order.status === "Overdue" && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle size={14} /> This order has passed its due date and requires immediate attention.
          </div>
        )}

        <div className="flex items-center overflow-x-auto pb-2">
          {WORKFLOW_STEPS.map((step, i) => {
            const done = stepIdx > i;
            const active = stepIdx === i;
            const isLast = i === WORKFLOW_STEPS.length - 1;
            return (
              <div key={step} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-[#E84C1E] text-white ring-4 ring-[#E84C1E]/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check size={14} /> : <span>{i + 1}</span>}
                  </div>
                  <div className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${active ? "text-[#E84C1E]" : done ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {step}
                  </div>
                </div>
                {!isLast && (
                  <div className={`h-0.5 w-10 mx-1 mb-4 rounded-full transition-all ${done ? "bg-emerald-400" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Order Details</h3>
          <div className="space-y-3">
            {[
              { label: "Order Type", value: order.type },
              { label: "Quantity", value: `${order.qty.toLocaleString()} pieces` },
              { label: "Paper Type", value: order.paperType || "—" },
              { label: "Size", value: order.size || "—" },
              { label: "Color Mode", value: order.colorMode || "—" },
              { label: "Binding", value: order.binding || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <span className="font-semibold text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Schedule & Client</h3>
          <div className="space-y-3">
            {[
              { label: "Order Date", value: order.orderDate },
              { label: "Due Date", value: order.dueDate },
              { label: "Assigned Staff", value: order.staff },
              { label: "Client", value: order.client },
              { label: "Contact", value: client?.mobile || "—" },
              { label: "Client Type", value: client?.type || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-muted-foreground shrink-0">{label}</span>
                <span className={`font-semibold text-foreground text-right ${label === "Client Type" && client ? `px-2 py-0.5 rounded text-xs ${TYPE_CLS[client.type]}` : ""}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><Info size={12} /> Special Instructions</h3>
          <p className="text-sm text-foreground leading-relaxed">{order.notes}</p>
        </div>
      )}

      {order.status === "Delivered" && order.deliveredTo && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <ClipboardCheck size={15} /> Delivery Acknowledgement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {[
                { label: "Received By", value: order.deliveredTo, icon: User },
                { label: "Mobile", value: order.deliveredMobile, icon: Phone },
                { label: "Delivery Date", value: order.deliveredDate, icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon size={12} className="text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{label}</div>
                    <div className="font-semibold text-emerald-900">{value || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {order.deliveryNotes && (
                <div>
                  <div className="text-[10px] text-emerald-600 font-semibold mb-1">Delivery Notes</div>
                  <p className="text-sm text-emerald-900">{order.deliveryNotes}</p>
                </div>
              )}
              {order.acknowledgementFile && (
                <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-200 flex items-center justify-center shrink-0">
                    <ClipboardCheck size={16} className="text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Proof Uploaded</div>
                    <div className="text-xs font-semibold text-emerald-900 truncate">{order.acknowledgementFile}</div>
                  </div>
                  <Check size={16} className="text-emerald-600 shrink-0 ml-auto" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeliver && (
        <Modal
          title="Record Delivery"
          subtitle={`${order.id} · ${order.client}`}
          icon={<Truck size={16} className="text-emerald-600" />}
          onClose={() => setShowDeliver(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeliver(false)} className="flex-1 justify-center">Cancel</Button>
              <button
                type="button"
                onClick={handleDeliver}
                disabled={!deliverForm.receiverName}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Check size={14} /> Confirm Delivery
              </button>
            </>
          }
        >
              <div className="bg-muted/40 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-muted-foreground">{order.id}</div>
                  <div className="text-sm font-semibold text-foreground">{order.type}</div>
                  <div className="text-xs text-muted-foreground">{order.qty.toLocaleString()} pcs · {order.client}</div>
                </div>
                <StatusBadge label="Ready" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Receiver Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="receiver-name" className="text-xs font-semibold text-muted-foreground block mb-1">Received By *</label>
                    <input
                      id="receiver-name"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Full name of receiver"
                      value={deliverForm.receiverName}
                      onChange={e => setDeliverForm(p => ({ ...p, receiverName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="receiver-mobile" className="text-xs font-semibold text-muted-foreground block mb-1">Mobile Number</label>
                    <input
                      id="receiver-mobile"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="98765 43210"
                      value={deliverForm.receiverMobile}
                      onChange={e => setDeliverForm(p => ({ ...p, receiverMobile: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="delivery-date" className="text-xs font-semibold text-muted-foreground block mb-1">Delivery Date</label>
                    <input
                      id="delivery-date"
                      type="date"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={deliverForm.deliveryDate}
                      onChange={e => setDeliverForm(p => ({ ...p, deliveryDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Acknowledgement Proof</p>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} aria-label="Upload acknowledgement proof" />
                {deliverForm.fileName ? (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <ClipboardCheck size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-emerald-700">File Attached</div>
                      <div className="text-sm font-semibold text-emerald-900 truncate">{deliverForm.fileName}</div>
                    </div>
                    <button type="button" aria-label="Remove file" onClick={() => setDeliverForm(p => ({ ...p, fileName: "" }))} className="text-emerald-600 hover:text-emerald-800 cursor-pointer"><X size={14} /></button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <Upload size={18} className="text-muted-foreground group-hover:text-emerald-600" />
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">Upload signed acknowledgement slip</div>
                    <div className="text-xs text-muted-foreground">Photo, scan, or PDF · Click to browse</div>
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="delivery-notes" className="text-xs font-semibold text-muted-foreground block mb-1">Delivery Notes / Remarks</label>
                <textarea
                  id="delivery-notes"
                  rows={3}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="e.g. Delivered at reception, goods checked by client..."
                  value={deliverForm.notes}
                  onChange={e => setDeliverForm(p => ({ ...p, notes: e.target.value }))}
                />
              </div>
        </Modal>
      )}
    </div>
  );
}
