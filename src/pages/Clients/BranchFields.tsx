import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/common/Button";
import { TextField } from "../../components/common/FormField";
import { formatMobile, mobileNumber, required } from "../../lib/validation";
import type { Branch } from "../../types";

export interface BranchDraft {
  /** Existing branch id, or undefined for a branch added in this form. */
  id?: number;
  /** Stable React key, independent of id. */
  key: string;
  name: string;
  mobile: string;
  address: string;
}

export interface BranchErrors {
  name?: string;
  mobile?: string;
}

let draftSeq = 0;
function newKey() {
  draftSeq += 1;
  return `branch-${draftSeq}`;
}

export function emptyBranchDraft(): BranchDraft {
  return { key: newKey(), name: "", mobile: "", address: "" };
}

export function toBranchDrafts(branches: Branch[] = []): BranchDraft[] {
  return branches.map(b => ({ id: b.id, key: newKey(), name: b.name, mobile: b.mobile, address: b.address ?? "" }));
}

export function validateBranches(drafts: BranchDraft[]): BranchErrors[] {
  const seen = new Set<string>();
  return drafts.map(d => {
    const normalized = d.name.trim().toLowerCase();
    let name = required(d.name, "Branch name is required.");
    if (!name && seen.has(normalized)) name = "Branch names must be unique.";
    seen.add(normalized);
    return { name, mobile: mobileNumber(d.mobile) };
  });
}

export function hasBranchErrors(errors: BranchErrors[]): boolean {
  return errors.some(e => e.name || e.mobile);
}

/** Converts drafts to saved branches, keeping existing ids and assigning new ones after the highest. */
export function toBranches(drafts: BranchDraft[]): Branch[] {
  let maxId = drafts.reduce((max, d) => Math.max(max, d.id ?? 0), 0);
  return drafts.map(d => ({
    id: d.id ?? ++maxId,
    name: d.name.trim(),
    mobile: formatMobile(d.mobile),
    ...(d.address.trim() ? { address: d.address.trim() } : {}),
  }));
}

interface BranchFieldsProps {
  branches: BranchDraft[];
  errors: BranchErrors[];
  onChange: (branches: BranchDraft[], changedIndex?: number) => void;
}

export function BranchFields({ branches, errors, onChange }: BranchFieldsProps) {
  function update(index: number, patch: Partial<BranchDraft>) {
    onChange(branches.map((b, i) => (i === index ? { ...b, ...patch } : b)), index);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Branches {branches.length > 0 && `(${branches.length})`}
        </h4>
        <Button variant="secondary" onClick={() => onChange([...branches, emptyBranchDraft()])}>
          <Plus size={13} /> Add New Branch
        </Button>
      </div>
      {branches.length === 0 && <p className="text-xs text-muted-foreground">No branches added.</p>}
      <div className="space-y-3">
        {branches.map((b, i) => (
          <div key={b.key} className="border border-border rounded-lg p-3 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">Branch {i + 1}</span>
              <button
                type="button"
                aria-label={`Remove branch ${i + 1}`}
                onClick={() => onChange(branches.filter((_, j) => j !== i))}
                className="p-1 rounded text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Branch Name *" placeholder="e.g. North Campus" value={b.name} onChange={v => update(i, { name: v })} error={errors[i]?.name} />
              <TextField label="Mobile *" type="tel" placeholder="98765 43210" value={b.mobile} onChange={v => update(i, { mobile: v })} error={errors[i]?.mobile} />
              <div className="col-span-2">
                <TextField label="Address" placeholder="Optional" value={b.address} onChange={v => update(i, { address: v })} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
