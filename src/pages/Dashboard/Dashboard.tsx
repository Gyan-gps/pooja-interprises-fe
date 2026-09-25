import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Activity, CheckCircle2, Truck, AlertTriangle,
  Calendar, Plus, Users, Layers, UserCheck, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { PageHeader } from "../../components/common/PageHeader";
import { KPICard } from "../../components/common/KPICard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { monthlyData, clientTypeDist } from "../../lib/data";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AssignTaskModal } from "../Staff/AssignTaskModal";
import type { Task } from "../../types";

const QUICK_ACTIONS = [
  { label: "Create Order", icon: Plus, action: "orders", bg: "bg-[#E84C1E]" },
  { label: "Add Client", icon: Users, action: "clients", bg: "bg-[#111827]" },
  { label: "Production Board", icon: Layers, action: "production", bg: "bg-purple-600" },
  { label: "Assign Task", icon: UserCheck, action: "assign-task", bg: "bg-amber-500" },
] as const;

export function Dashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const toast = useToast();
  const { orders, staff, tasks, createTask } = useAppData();
  const [showAssignTask, setShowAssignTask] = useState(false);

  const active = orders.filter(o => !["Delivered", "Overdue"].includes(o.status)).length;
  const completed = orders.filter(o => o.status === "Delivered").length;
  const overdue = orders.filter(o => o.status === "Overdue").length;
  const ready = orders.filter(o => o.status === "Ready").length;

  function handleQuickAction(action: (typeof QUICK_ACTIONS)[number]["action"]) {
    if (action === "assign-task") {
      setShowAssignTask(true);
    } else {
      navigate(`/${action}`);
    }
  }

  async function handleCreateTask(task: Task) {
    await createTask(task);
    setShowAssignTask(false);
    toast.show(`Task "${task.name}" assigned.`);
  }

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Dashboard"
        subtitle="Pooja Enterprises — Printing & Publishing, Pune"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-white border border-border rounded-lg px-3 py-2">
            <Calendar size={12} /> 23 Jun 2026
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Orders" value={String(orders.length)} sub="All time" icon={Package} iconBg="bg-slate-700" />
        <KPICard title="Active" value={String(active)} sub="In production" icon={Activity} iconBg="bg-[#E84C1E]" />
        <KPICard title="Delivered" value={String(completed)} sub="Completed" icon={CheckCircle2} iconBg="bg-emerald-600" />
        <KPICard title="Ready to Deliver" value={String(ready)} sub="Awaiting dispatch" icon={Truck} iconBg="bg-blue-600" />
        <KPICard title="Overdue" value={String(overdue)} sub="Needs attention" icon={AlertTriangle} iconBg="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground mb-4">Orders by Month — 2026</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#706C66", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#706C66", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E0DDD5", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [v, "Orders"]} />
              <Bar dataKey="orders" fill="#E84C1E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Client Distribution</h3>
          <ResponsiveContainer width="100%" height={148}>
            <PieChart>
              <Pie data={clientTypeDist} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" paddingAngle={2}>
                {clientTypeDist.map(entry => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E0DDD5", borderRadius: 8, fontSize: 12 }} formatter={(v: number, name: string) => [`${v}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {clientTypeDist.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-bold font-mono text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, action, bg }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickAction(action)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-white ${bg} hover:opacity-90 transition-opacity cursor-pointer`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {ready > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2"><Truck size={14} /> Ready for Delivery</h3>
            <button type="button" onClick={() => navigate("/orders")} className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer">View Orders →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {orders.filter(o => o.status === "Ready").map(o => (
              <button
                type="button"
                key={o.id}
                onClick={() => navigate(`/orders/${o.id}`)}
                className="bg-white border border-emerald-200 rounded-xl p-3 text-left hover:border-emerald-400 transition-colors cursor-pointer"
              >
                <div className="font-mono text-xs font-bold text-emerald-700">{o.id}</div>
                <div className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{o.client}</div>
                <div className="text-[10px] text-muted-foreground">{o.type} · {o.qty.toLocaleString()} pcs</div>
                <div className="text-[10px] font-mono text-emerald-600 mt-1">Due: {o.dueDate}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Recent Orders</h3>
          <button type="button" onClick={() => navigate("/orders")} className="text-xs text-[#E84C1E] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
            View All <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Order ID", "Client", "Type", "Qty", "Due Date", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{o.id}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{o.client}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{o.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.dueDate}</td>
                  <td className="px-4 py-3"><StatusBadge label={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignTask && (
        <AssignTaskModal
          orders={orders}
          staff={staff}
          existingTasks={tasks}
          onClose={() => setShowAssignTask(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}
