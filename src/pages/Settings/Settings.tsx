import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { usePageTitle } from "../../hooks/usePageTitle";

const BUSINESS_FIELDS = [
  { id: "business-name", label: "Business Name", value: "Pooja Enterprises" },
  { id: "owner", label: "Owner / Proprietor", value: "Proprietor" },
  { id: "gst", label: "GST Number", value: "27ABCDE1234F1Z5" },
  { id: "contact", label: "Contact Number", value: "+91 98765 43210" },
  { id: "city", label: "City / State", value: "Pune, Maharashtra" },
  { id: "financial-year", label: "Financial Year", value: "2026–27" },
];

export function Settings() {
  usePageTitle("Settings");

  return (
    <div className="p-6">
      <PageHeader title="Settings" subtitle="Business configuration & preferences" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {BUSINESS_FIELDS.map(({ id, label, value }) => (
          <div key={id} className="bg-card border border-border rounded-xl p-4">
            <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{label}</label>
            <input
              id={id}
              defaultValue={value}
              className="w-full text-sm font-semibold text-foreground bg-transparent border-b border-border focus:outline-none focus:border-ring pb-1 transition-colors"
            />
          </div>
        ))}
      </div>
      <div className="mt-5"><Button variant="primary">Save Settings</Button></div>
    </div>
  );
}
