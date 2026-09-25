import { useState } from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { SelectField, TextField } from "../../components/common/FormField";
import { nextNumericId } from "../../lib/id";
import { required, uniqueBy } from "../../lib/validation";
import type { StaffMember, StaffRole } from "../../types";

const STAFF_ROLES: StaffRole[] = ["Designer", "Machine Operator", "Binder", "Delivery Person", "Manager"];

/** Avatar colors, matching the palette already used by the seeded staff. */
const AVATAR_COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-slate-500",
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

interface AddStaffModalProps {
  existingStaff: StaffMember[];
  onClose: () => void;
  onCreate: (member: StaffMember) => void;
}

interface FormState {
  name: string;
  role: StaffRole;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export function AddStaffModal({ existingStaff, onClose, onCreate }: AddStaffModalProps) {
  const [form, setForm] = useState<FormState>({ name: "", role: "Designer" });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit() {
    const name = form.name.trim();
    const nameError = required(form.name, "Staff name is required.")
      ?? uniqueBy(form.name, existingStaff, s => s.name, "This staff member is already on the team.");
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    onCreate({
      id: nextNumericId(existingStaff),
      name,
      role: form.role,
      active: 0,
      completed: 0,
      initials: initialsOf(name),
      color: AVATAR_COLORS[existingStaff.length % AVATAR_COLORS.length],
    });
  }

  return (
    <Modal
      title="Add Staff"
      subtitle="Add a team member to assign production tasks to"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1 justify-center">Add Staff</Button>
        </>
      }
    >
      <TextField
        label="Full Name *"
        placeholder="e.g. Mohan Kumar"
        value={form.name}
        onChange={v => {
          setForm(p => ({ ...p, name: v }));
          setErrors({});
        }}
        error={errors.name}
      />
      <SelectField
        label="Role"
        value={form.role}
        options={STAFF_ROLES}
        onChange={v => setForm(p => ({ ...p, role: v as StaffRole }))}
      />
    </Modal>
  );
}
