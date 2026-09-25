import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { BusinessSettings } from "../../types";

const FIELDS: { key: keyof BusinessSettings; id: string; label: string }[] = [
  { key: "businessName", id: "business-name", label: "Business Name" },
  { key: "owner", id: "owner", label: "Owner / Proprietor" },
  { key: "gstNumber", id: "gst", label: "GST Number" },
  { key: "contactNumber", id: "contact", label: "Contact Number" },
  { key: "cityState", id: "city", label: "City / State" },
  { key: "financialYear", id: "financial-year", label: "Financial Year" },
];

export function Settings() {
  usePageTitle("Settings");
  const toast = useToast();
  const { settings, saveSettings } = useAppData();
  const [form, setForm] = useState<BusinessSettings>(settings);

  // Keep the form in sync if settings are ever updated elsewhere (e.g. another tab).
  useEffect(() => setForm(settings), [settings]);

  const isDirty = FIELDS.some(({ key }) => form[key] !== settings[key]);

  async function handleSave() {
    await saveSettings(form);
    toast.show("Settings saved.");
  }

  return (
    <div className="p-6">
      <PageHeader title="Settings" subtitle="Business configuration & preferences" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {FIELDS.map(({ key, id, label }) => (
          <div key={id} className="bg-card border border-border rounded-xl p-4">
            <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{label}</label>
            <input
              id={id}
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              className="w-full text-sm font-semibold text-foreground bg-transparent border-b border-border focus:outline-none focus:border-ring pb-1 transition-colors"
            />
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Button variant="primary" onClick={handleSave} className={isDirty ? "" : "opacity-50 pointer-events-none"}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
