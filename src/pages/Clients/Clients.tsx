import { useState, type Dispatch, type SetStateAction } from "react";
import { Plus, Search, Eye } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { FilterPill } from "../../components/common/FilterPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { TYPE_CLS } from "../../lib/constants";
import { usePageTitle } from "../../hooks/usePageTitle";
import { ClientDetail } from "./ClientDetail";
import { AddClientModal } from "./AddClientModal";
import type { Client, Order } from "../../types";

const TYPE_FILTERS = ["All", "School", "Hospital", "Coaching", "College", "Corporate"];

interface ClientsProps {
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  clients: Client[];
  setClients: Dispatch<SetStateAction<Client[]>>;
}

export function Clients({ orders, setOrders, clients, setClients }: ClientsProps) {
  usePageTitle("Clients");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);

  if (selectedClient) {
    return (
      <ClientDetail
        client={clients.find(c => c.id === selectedClient.id) ?? selectedClient}
        orders={orders}
        setOrders={setOrders}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  const filtered = clients.filter(c => {
    const ok = typeFilter === "All" || c.type === typeFilter;
    const q = search.toLowerCase();
    return ok && (c.name.toLowerCase().includes(q) || c.org.toLowerCase().includes(q));
  });

  function handleCreateClient(client: Client) {
    setClients(prev => [client, ...prev]);
    setShowAddClient(false);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} registered clients`}
        actions={<Button variant="primary" onClick={() => setShowAddClient(true)}><Plus size={14} /> Add Client</Button>}
      />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="client-search" className="sr-only">Search clients</label>
          <input
            id="client-search"
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring/30"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(t => <FilterPill key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />)}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Client Name", "Organization", "Type", "Mobile", "Orders", "Last Order", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#E84C1E] text-white flex items-center justify-center text-xs font-bold shrink-0">{c.name.charAt(0)}</div>
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.org}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${TYPE_CLS[c.type]}`}>{c.type}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{c.mobile}</td>
                  <td className="px-4 py-3 text-sm font-bold text-center text-foreground">{c.orders}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.lastOrder}</td>
                  <td className="px-4 py-3"><StatusBadge label={c.status} /></td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelectedClient(c)} className="flex items-center gap-1 text-xs text-[#E84C1E] font-semibold hover:underline cursor-pointer">
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No clients found.</div>}
      </div>

      {showAddClient && (
        <AddClientModal
          existingClients={clients}
          onClose={() => setShowAddClient(false)}
          onCreate={handleCreateClient}
        />
      )}
    </div>
  );
}
