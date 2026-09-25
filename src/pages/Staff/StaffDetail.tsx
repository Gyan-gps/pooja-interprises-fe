import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "../../components/common/DataTable";
import { SelectField, TextField } from "../../components/common/FormField";
import { required, uniqueBy } from "../../lib/validation";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AssignTaskModal } from "./AssignTaskModal";
import type { StaffRole, Task, TaskStatus } from "../../types";

const STAFF_ROLES: StaffRole[] = ["Designer", "Machine Operator", "Binder", "Delivery Person", "Manager"];
const TASK_STATUSES: TaskStatus[] = ["Pending", "In Progress", "Completed"];

interface EditForm {
  name: string;
  role: StaffRole;
}

export function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { staff, tasks, orders, updateStaff, deleteStaff, createTask, updateTask, deleteTask } = useAppData();

  const member = staff.find(s => s.id === Number(id));

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editError, setEditError] = useState<string | undefined>();
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [reassignTo, setReassignTo] = useState("");
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  usePageTitle(member ? member.name : "Staff not found");

  if (!member) {
    return (
      <div className="p-6">
        <Link to="/staff" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 w-fit">
          <ArrowLeft size={14} /> Back to Staff
        </Link>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No staff member found with id "{id}".</p>
        </div>
      </div>
    );
  }

  const memberTasks = tasks.filter(t => t.staffId === member.id);
  const activeTasks = memberTasks.filter(t => t.status !== "Completed");
  const otherStaff = staff.filter(s => s.id !== member.id);

  function startEdit() {
    setEditForm({ name: member!.name, role: member!.role });
    setEditError(undefined);
    setIsEditing(true);
  }

  async function saveEdit() {
    if (!editForm) return;
    const nameError = required(editForm.name, "Name is required.")
      ?? uniqueBy(editForm.name, otherStaff, s => s.name, "Another staff member already has this name.");
    if (nameError) {
      setEditError(nameError);
      return;
    }
    await updateStaff(member!.id, { name: editForm.name.trim(), role: editForm.role });
    setIsEditing(false);
    toast.show("Staff profile updated.");
  }

  async function handleCreateTask(task: Task) {
    await createTask(task);
    setShowAssignTask(false);
    toast.show(`Task "${task.name}" assigned to ${member!.name}.`);
  }

  async function handleDeleteTask() {
    if (!deletingTask) return;
    await deleteTask(deletingTask.id);
    toast.show("Task deleted.");
  }

  async function handleRemoveStaff() {
    if (activeTasks.length > 0 && reassignTo) {
      const targetId = Number(reassignTo);
      await Promise.all(activeTasks.map(t => updateTask(t.id, { staffId: targetId })));
    }
    await deleteStaff(member!.id);
    navigate("/staff");
    toast.show(`${member!.name} removed from the team.`);
  }

  const taskColumns: DataTableColumn<Task>[] = [
    { key: "name", header: "Task", render: t => <span className="text-sm font-medium text-foreground">{t.name}</span> },
    {
      key: "order", header: "Order",
      render: t => (
        <button type="button" onClick={() => navigate(`/orders/${t.order}`)} className="font-mono text-xs font-bold text-[#E84C1E] hover:underline cursor-pointer">
          {t.order}
        </button>
      ),
    },
    { key: "priority", header: "Priority", render: t => <StatusBadge label={t.priority} /> },
    { key: "due", header: "Due Date", sortValue: t => t.due, render: t => <span className="font-mono text-xs text-muted-foreground">{t.due}</span> },
    {
      key: "status", header: "Status",
      render: t => (
        <select
          value={t.status}
          onChange={e => updateTask(t.id, { status: e.target.value as TaskStatus })}
          className="text-xs font-semibold border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
        >
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      key: "actions", header: "",
      render: t => (
        <button type="button" aria-label={`Delete task ${t.name}`} onClick={() => setDeletingTask(t)} className="text-destructive/70 hover:text-destructive cursor-pointer">
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Link to="/staff" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 w-fit">
        <ArrowLeft size={14} /> Back to Staff
      </Link>

      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${member.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>{member.initials}</div>
            {isEditing && editForm ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <TextField label="Full Name *" value={editForm.name} onChange={v => { setEditForm(p => p && { ...p, name: v }); setEditError(undefined); }} error={editError} />
                <SelectField label="Role" value={editForm.role} options={STAFF_ROLES} onChange={v => setEditForm(p => p && { ...p, role: v as StaffRole })} />
              </div>
            ) : (
              <div>
                <h2 className="font-bold text-foreground text-base">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{member.active}</div>
              <div className="text-[10px] text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-600">{member.completed}</div>
              <div className="text-[10px] text-muted-foreground">Completed</div>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={saveEdit}>Save</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setShowAssignTask(true)}><UserPlus size={14} /> Assign Task</Button>
                <Button variant="secondary" onClick={startEdit}><Pencil size={13} /> Edit</Button>
                <button
                  type="button"
                  onClick={() => setShowRemove(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Assigned Tasks</h3>
        <span className="text-xs text-muted-foreground font-mono">{memberTasks.length} total</span>
      </div>
      <DataTable columns={taskColumns} rows={memberTasks} rowKey={t => t.id} emptyMessage="No tasks assigned to this team member yet." />

      {showAssignTask && (
        <AssignTaskModal
          orders={orders}
          staff={staff}
          existingTasks={tasks}
          defaultStaffId={member.id}
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

      {showRemove && (
        <ConfirmDialog
          title="Remove Staff Member"
          description={
            activeTasks.length > 0
              ? `${member.name} has ${activeTasks.length} active task${activeTasks.length !== 1 ? "s" : ""}. Choose who to reassign them to before removing.`
              : `This permanently removes ${member.name} from the team. This can't be undone.`
          }
          confirmLabel="Remove Staff"
          confirmDisabled={activeTasks.length > 0 && !reassignTo}
          onConfirm={handleRemoveStaff}
          onClose={() => { setShowRemove(false); setReassignTo(""); }}
        >
          {activeTasks.length > 0 && (
            <div className="mt-3">
              <SelectField
                label="Reassign active tasks to *"
                value={reassignTo}
                options={[{ value: "", label: "Select a team member…" }, ...otherStaff.map(s => ({ value: String(s.id), label: s.name }))]}
                onChange={setReassignTo}
              />
            </div>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
