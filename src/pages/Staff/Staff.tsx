import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { DataTable, type DataTableColumn } from "../../components/common/DataTable";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AddStaffModal } from "./AddStaffModal";
import { AssignTaskModal } from "./AssignTaskModal";
import type { StaffMember, Task, TaskStatus } from "../../types";

const TASK_STATUSES: TaskStatus[] = ["Pending", "In Progress", "Completed"];

export function Staff() {
  usePageTitle("Staff");
  const navigate = useNavigate();
  const toast = useToast();
  const { staff, tasks, orders, createStaff, createTask, updateTask, deleteTask } = useAppData();

  const [activeTab, setActiveTab] = useState<"staff" | "tasks">("staff");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  async function handleCreateStaff(member: StaffMember) {
    await createStaff(member);
    setShowAddStaff(false);
    toast.show(`${member.name} added to the team.`);
  }

  async function handleCreateTask(task: Task) {
    await createTask(task);
    setShowAssignTask(false);
    toast.show(`Task "${task.name}" assigned.`);
  }

  async function handleDeleteTask() {
    if (!deletingTask) return;
    await deleteTask(deletingTask.id);
    toast.show("Task deleted.");
  }

  const taskColumns: DataTableColumn<Task>[] = [
    { key: "name", header: "Task", sortValue: t => t.name, render: t => <span className="text-sm font-medium text-foreground">{t.name}</span> },
    {
      key: "order", header: "Order",
      render: t => (
        <button type="button" onClick={() => navigate(`/orders/${t.order}`)} className="font-mono text-xs font-bold text-[#E84C1E] hover:underline cursor-pointer">
          {t.order}
        </button>
      ),
    },
    {
      key: "staff", header: "Assigned To",
      render: t => {
        const s = staff.find(st => st.id === t.staffId);
        return (
          <button type="button" onClick={() => s && navigate(`/staff/${s.id}`)} className="flex items-center gap-2 cursor-pointer">
            <div className={`w-6 h-6 rounded-full ${s?.color ?? "bg-slate-300"} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{s?.initials ?? "?"}</div>
            <span className="text-sm text-foreground">{s?.name ?? "Unassigned"}</span>
          </button>
        );
      },
    },
    { key: "priority", header: "Priority", render: t => <StatusBadge label={t.priority} /> },
    { key: "due", header: "Due Date", sortValue: t => t.due, render: t => <span className="font-mono text-xs text-muted-foreground">{t.due}</span> },
    {
      key: "status", header: "Status",
      render: t => (
        <select
          value={t.status}
          onChange={e => updateTask(t.id, { status: e.target.value as TaskStatus })}
          onClick={e => e.stopPropagation()}
          className="text-xs font-semibold border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
        >
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      key: "actions", header: "",
      render: t => (
        <button
          type="button"
          aria-label={`Delete task ${t.name}`}
          onClick={() => setDeletingTask(t)}
          className="text-destructive/70 hover:text-destructive cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Staff"
        subtitle="Team management & task assignments"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowAssignTask(true)}><UserPlus size={14} /> Assign Task</Button>
            <Button variant="primary" onClick={() => setShowAddStaff(true)}><Plus size={14} /> Add Staff</Button>
          </div>
        }
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
            <button
              key={s.id}
              type="button"
              onClick={() => navigate(`/staff/${s.id}`)}
              className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 text-left hover:border-[#E84C1E]/40 hover:shadow-sm transition-all cursor-pointer"
            >
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
            </button>
          ))}
        </div>
      )}
      {activeTab === "tasks" && (
        <DataTable columns={taskColumns} rows={tasks} rowKey={t => t.id} emptyMessage="No tasks assigned yet." />
      )}

      {showAddStaff && (
        <AddStaffModal existingStaff={staff} onClose={() => setShowAddStaff(false)} onCreate={handleCreateStaff} />
      )}

      {showAssignTask && (
        <AssignTaskModal
          orders={orders}
          staff={staff}
          existingTasks={tasks}
          onClose={() => setShowAssignTask(false)}
          onCreate={handleCreateTask}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete Task"
          description={`This removes "${deletingTask.name}" from the task board. This can't be undone.`}
          confirmLabel="Delete Task"
          onConfirm={handleDeleteTask}
          onClose={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}
