import { useState } from "react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { TextField } from "../../components/common/FormField";
import { ComboBox } from "../../components/common/ComboBox";
import { clientTypeOptions } from "../../lib/constants";
import { nextNumericId } from "../../lib/id";
import { formatMobile, mobileNumber, required, uniqueBy } from "../../lib/validation";
import type { Client, ClientType } from "../../types";
import { BranchFields, hasBranchErrors, toBranches, validateBranches, type BranchDraft, type BranchErrors } from "./BranchFields";

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
  return {
    name: required(form.name, "Contact name is required."),
    org: required(form.org, "Organization is required.") ?? uniqueBy(form.org, existingClients, c => c.org, "A client with this organization already exists."),
    mobile: mobileNumber(form.mobile),
  };
}

export function AddClientModal({ existingClients, onClose, onCreate }: AddClientModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [branches, setBranches] = useState<BranchDraft[]>([]);
  const [branchErrors, setBranchErrors] = useState<BranchErrors[]>([]);

  function updateBranches(next: BranchDraft[], changedIndex?: number) {
    setBranches(next);
    setBranchErrors(prev => (changedIndex === undefined ? [] : prev.map((e, i) => (i === changedIndex ? {} : e))));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }

  function handleSubmit() {
    const nextErrors = validate(form, existingClients);
    const nextBranchErrors = validateBranches(branches);
    if (Object.values(nextErrors).some(Boolean) || hasBranchErrors(nextBranchErrors)) {
      setErrors(nextErrors);
      setBranchErrors(nextBranchErrors);
      return;
    }

    onCreate({
      id: nextNumericId(existingClients),
      name: form.name.trim(),
      org: form.org.trim(),
      type: form.type,
      mobile: formatMobile(form.mobile),
      orders: 0,
      lastOrder: "—",
      status: "Active",
      branches: toBranches(branches),
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
        <ComboBox
          label="Client Type"
          placeholder="Search or add type..."
          value={form.type}
          options={clientTypeOptions(existingClients, [form.type])}
          onChange={v => update("type", v)}
          onCreate={v => update("type", v.trim())}
        />
        <div className="col-span-2 pt-2 border-t border-border">
          <BranchFields branches={branches} errors={branchErrors} onChange={updateBranches} />
        </div>
      </div>
    </Modal>
  );
}
