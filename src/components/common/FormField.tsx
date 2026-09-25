import { useId, type ReactNode } from "react";

const CONTROL_CLS =
  "w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring/30";

interface FieldShellProps {
  label: string;
  error?: string;
  children: (id: string) => ReactNode;
}

function FieldShell({ label, error, children }: FieldShellProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground block mb-1">
        {label}
      </label>
      {children(id)}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "date" | "tel";
  error?: string;
}

export function TextField({ label, value, onChange, placeholder, type = "text", error }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error}>
      {id => (
        <input
          id={id}
          type={type}
          className={`${CONTROL_CLS} ${error ? "border-destructive" : ""}`}
          placeholder={placeholder}
          value={value}
          aria-invalid={Boolean(error)}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <FieldShell label={label}>
      {id => (
        <select id={id} className={CONTROL_CLS} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
