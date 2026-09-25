import { useState } from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { SelectField, TextField } from "../../components/common/FormField";
import type { Client, ClientType } from "../../types";

const CLIENT_TYPES: ClientType[] = ["School", "Hospital", "Coaching", "College", "Corporate"];

interface AddClientModalProps {
  existingClients: Client[];
  onClose: () => void;
  onCreate: (client: Client) => void;
}

interface FormState {
  name: string;
  org: string;
  type: ClientType;
  mobile: string;
}

const EMPTY_FORM: FormState = { name: "", org: "", type: "School", mobile: "" };

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState, existingClients: Client[]): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Contact name is required.";
  if (!form.org.trim()) errors.org = "Organization is required.";
  else if (existingClients.some(c => c.org.toLowerCase() === form.org.trim().toLowerCase())) {
    errors.org = "A client with this organization already exists.";
  }

  const digits = form.mobile.replace(/\D/g, "");
  if (!digits) errors.mobile = "Mobile number is required.";
  else if (digits.length !== 10) errors.mobile = "Enter a 10-digit mobile number.";

  return errors;
}

export function AddClientModal({ existingClients, onClose, onCreate }: AddClientModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }

  function handleSubmit() {
    const nextErrors = validate(form, existingClients);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const digits = form.mobile.replace(/\D/g, "");
    onCreate({
      id: Math.max(0, ...existingClients.map(c => c.id)) + 1,
      name: form.name.trim(),
      org: form.org.trim(),
      type: form.type,
      mobile: `${digits.slice(0, 5)} ${digits.slice(5)}`,
      orders: 0,
      lastOrder: "—",
      status: "Active",
    });
  }

  return (
    <Modal
      title="Add Client"
      subtitle="Register a new school, hospital, academy or business"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1 justify-center">Add Client</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <TextField
            label="Contact Person *"
            placeholder="e.g. Rajesh Kumar"
            value={form.name}
            onChange={v => update("name", v)}
            error={errors.name}
          />
        </div>
        <div className="col-span-2">
          <TextField
            label="Organization *"
            placeholder="e.g. St. Mary's High School"
            value={form.org}
            onChange={v => update("org", v)}
            error={errors.org}
          />
        </div>
        <TextField
          label="Mobile *"
          type="tel"
          placeholder="98765 43210"
          value={form.mobile}
          onChange={v => update("mobile", v)}
          error={errors.mobile}
        />
        <SelectField
          label="Client Type"
          value={form.type}
          options={CLIENT_TYPES}
          onChange={v => update("type", v as ClientType)}
        />
      </div>
    </Modal>
  );
}
