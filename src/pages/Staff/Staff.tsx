import { useState, type Dispatch, type SetStateAction } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { TASKS } from "../../lib/data";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AddStaffModal } from "./AddStaffModal";
import type { StaffMember } from "../../types";

interface StaffProps {
  staff: StaffMember[];
  setStaff: Dispatch<SetStateAction<StaffMember[]>>;
}

export function Staff({ staff, setStaff }: StaffProps) {
  usePageTitle("Staff");
  const [activeTab, setActiveTab] = useState<"staff" | "tasks">("staff");
  const [showAddStaff, setShowAddStaff] = useState(false);

  function handleCreateStaff(member: StaffMember) {
    setStaff(prev => [...prev, member]);
    setShowAddStaff(false);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Staff"
        subtitle="Team management & task assignments"
        actions={<Button variant="primary" onClick={() => setShowAddStaff(true)}><Plus size={14} /> Add Staff</Button>}
      />
      <div className="flex border-b border-border mb-5">
        {(["staff", "tasks"] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === tab ? "border-b-2 border-[#E84C1E] text-[#E84C1E]" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "staff" ? "Staff List" : "Task Assignments"}
          </button>
        ))}
      </div>
      {activeTab === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>{s.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-sm">{s.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{s.role}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-foreground">{s.active}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase">Active</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-emerald-700">{s.completed}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold uppercase">Done</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === "tasks" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Task", "Order", "Assigned To", "Priority", "Due Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TASKS.map(t => {
                  const s = staff.find(st => st.id === t.staffId);
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#E84C1E]">{t.order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${s?.color ?? "bg-slate-300"} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{s?.initials ?? "?"}</div>
                          <span className="text-sm text-foreground">{s?.name ?? "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge label={t.priority} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.due}</td>
                      <td className="px-4 py-3"><StatusBadge label={t.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddStaff && (
        <AddStaffModal
          existingStaff={staff}
          onClose={() => setShowAddStaff(false)}
          onCreate={handleCreateStaff}
        />
      )}
    </div>
  );
}
