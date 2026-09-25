import { useState } from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { SelectField, TextField } from "../../components/common/FormField";
import { required } from "../../lib/validation";
import type { Order, StaffMember, Task, TaskPriority } from "../../types";

const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];

interface AssignTaskModalProps {
  orders: Order[];
  staff: StaffMember[];
  existingTasks: Task[];
  /** Preselects the order this task is for, when opened from an order's context. */
  defaultOrderId?: string;
  /** Preselects the assignee, when opened from a staff member's profile. */
  defaultStaffId?: number;
  onClose: () => void;
  onCreate: (task: Task) => void;
}

interface FormState {
  name: string;
  order: string;
  staffId: string;
  priority: TaskPriority;
  due: string;
}

export function AssignTaskModal({ orders, staff, existingTasks, defaultOrderId, defaultStaffId, onClose, onCreate }: AssignTaskModalProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    order: defaultOrderId ?? orders[0]?.id ?? "",
    staffId: defaultStaffId ? String(defaultStaffId) : (staff[0] ? String(staff[0].id) : ""),
    priority: "Medium",
    due: "",
  });
  const [errors, setErrors] = useState<Partial<Record<"name" | "due", string>>>({});

  function handleSubmit() {
    const nextErrors = {
      name: required(form.name, "Task name is required."),
      due: required(form.due, "Due date is required."),
    };
    if (nextErrors.name || nextErrors.due) {
      setErrors(nextErrors);
      return;
    }

    onCreate({
      id: Math.max(0, ...existingTasks.map(t => t.id)) + 1,
      name: form.name.trim(),
      order: form.order,
      staffId: Number(form.staffId),
      priority: form.priority,
      due: form.due,
      status: "Pending",
    });
  }

  return (
    <Modal
      title="Assign Task"
      subtitle="Create a production task and assign it to a team member"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1 justify-center">Assign Task</Button>
        </>
      }
    >
      <TextField
        label="Task Name *"
        placeholder="e.g. Proof review — Hospital Forms"
        value={form.name}
        onChange={v => { setForm(p => ({ ...p, name: v })); setErrors(p => ({ ...p, name: undefined })); }}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Related Order"
          value={form.order}
          options={orders.map(o => o.id)}
          onChange={v => setForm(p => ({ ...p, order: v }))}
        />
        <SelectField
          label="Assign To"
          value={form.staffId}
          options={staff.map(s => ({ value: String(s.id), label: s.name }))}
          onChange={v => setForm(p => ({ ...p, staffId: v }))}
        />
        <SelectField
          label="Priority"
          value={form.priority}
          options={PRIORITIES}
          onChange={v => setForm(p => ({ ...p, priority: v as TaskPriority }))}
        />
        <TextField
          label="Due Date *"
          type="date"
          value={form.due}
          onChange={v => { setForm(p => ({ ...p, due: v })); setErrors(p => ({ ...p, due: undefined })); }}
          error={errors.due}
        />
      </div>
    </Modal>
  );
}
