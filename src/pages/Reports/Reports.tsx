import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PageHeader } from "../../components/common/PageHeader";
import { FilterPill } from "../../components/common/FilterPill";
import { ORDER_TYPES, monthlyData } from "../../lib/data";
import { TYPE_CLS } from "../../lib/constants";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { Client, Order, StaffMember } from "../../types";

interface ReportsProps {
  orders: Order[];
  clients: Client[];
  staff: StaffMember[];
}

export function Reports({ orders, clients, staff }: ReportsProps) {
  usePageTitle("Reports");
  const [reportType, setReportType] = useState("orders");

  const byType = ORDER_TYPES.map(t => ({
    type: t,
    count: orders.filter(o => o.type === t).length,
    delivered: orders.filter(o => o.type === t && o.status === "Delivered").length,
  })).filter(r => r.count > 0).sort((a, b) => b.count - a.count);

  const byClient = clients.map(c => ({
    ...c,
    orderCount: orders.filter(o => o.clientId === c.id).length,
    delivered: orders.filter(o => o.clientId === c.id && o.status === "Delivered").length,
    active: orders.filter(o => o.clientId === c.id && !["Delivered", "Overdue"].includes(o.status)).length,
  })).sort((a, b) => b.orderCount - a.orderCount);

  const byStaff = staff.map(s => ({
    ...s,
    efficiency: s.completed > 0 ? Math.round((s.completed / (s.completed + s.active)) * 100) : 0,
  }));

  const tabs = [
    { key: "orders", label: "Order-wise" },
    { key: "clients", label: "Client-wise" },
    { key: "staff", label: "Staff Productivity" },
    { key: "monthly", label: "Monthly Trend" },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Reports" subtitle="Operations analytics & performance" />
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => <FilterPill key={t.key} label={t.label} active={reportType === t.key} onClick={() => setReportType(t.key)} />)}
      </div>

      {reportType === "monthly" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Monthly Order Volume — 2026</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#706C66", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#706C66", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E0DDD5", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [v, "Orders"]} />
              <Bar dataKey="orders" fill="#E84C1E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportType === "orders" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Order Type", "Total Orders", "Delivered", "In Progress", "Completion Rate"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byType.map(r => (
                  <tr key={r.type} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{r.type}</td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{r.count}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">{r.delivered}</td>
                    <td className="px-4 py-3 text-sm text-amber-600 font-semibold">{r.count - r.delivered}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[80px]">
                          <div className="h-1.5 rounded-full bg-[#E84C1E]" style={{ width: `${r.count > 0 ? Math.round((r.delivered / r.count) * 100) : 0}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold">{r.count > 0 ? Math.round((r.delivered / r.count) * 100) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === "clients" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Client", "Type", "Total Orders", "Delivered", "Active", "Completion"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byClient.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.org}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${TYPE_CLS[r.type]}`}>{r.type}</span></td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{r.orderCount}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">{r.delivered}</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-600">{r.active}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[80px]">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${r.orderCount > 0 ? Math.round((r.delivered / r.orderCount) * 100) : 0}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold">{r.orderCount > 0 ? Math.round((r.delivered / r.orderCount) * 100) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === "staff" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Staff Member", "Role", "Active Tasks", "Completed", "Efficiency"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byStaff.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{s.initials}</div>
                        <span className="text-sm font-semibold text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.role}</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-600">{s.active}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">{s.completed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[80px]">
                          <div className="h-1.5 rounded-full bg-[#E84C1E]" style={{ width: `${s.efficiency}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold">{s.efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
