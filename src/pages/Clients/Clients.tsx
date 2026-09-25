import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { FilterPill } from "../../components/common/FilterPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "../../components/common/DataTable";
import { TYPE_CLS } from "../../lib/constants";
import { useAppData } from "../../lib/appDataContext";
import { useToast } from "../../lib/toast";
import { useUrlState } from "../../hooks/useUrlState";
import { usePageTitle } from "../../hooks/usePageTitle";
import { AddClientModal } from "./AddClientModal";
import type { Client } from "../../types";

const TYPE_FILTERS = ["All", "School", "Hospital", "Coaching", "College", "Corporate"];

export function Clients() {
  usePageTitle("Clients");
  const navigate = useNavigate();
  const toast = useToast();
  const { clients, createClient } = useAppData();

  const [search, setSearch] = useUrlState("q", "");
  const [typeFilter, setTypeFilter] = useUrlState("type", "All");
  const [showAddClient, setShowAddClient] = useState(false);

  const filtered = clients.filter(c => {
    const ok = typeFilter === "All" || c.type === typeFilter;
    const q = search.toLowerCase();
    return ok && (c.name.toLowerCase().includes(q) || c.org.toLowerCase().includes(q));
  });

  async function handleCreateClient(client: Client) {
    await createClient(client);
    setShowAddClient(false);
    toast.show(`${client.name} added.`);
  }

  const columns: DataTableColumn<Client>[] = [
    {
      key: "name", header: "Client Name", sortValue: c => c.name,
      render: c => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E84C1E] text-white flex items-center justify-center text-xs font-bold shrink-0">{c.name.charAt(0)}</div>
          <span className="text-sm font-semibold text-foreground">{c.name}</span>
        </div>
      ),
    },
    { key: "org", header: "Organization", sortValue: c => c.org, render: c => <span className="text-sm text-muted-foreground">{c.org}</span> },
    { key: "type", header: "Type", render: c => <span className={`px-2 py-0.5 rounded text-xs font-semibold ${TYPE_CLS[c.type]}`}>{c.type}</span> },
    { key: "mobile", header: "Mobile", render: c => <span className="font-mono text-xs text-foreground">{c.mobile}</span> },
    { key: "orders", header: "Orders", sortValue: c => c.orders, render: c => <span className="text-sm font-bold text-center block text-foreground">{c.orders}</span> },
    { key: "lastOrder", header: "Last Order", sortValue: c => c.lastOrder, render: c => <span className="font-mono text-xs text-muted-foreground">{c.lastOrder}</span> },
    { key: "status", header: "Status", render: c => <StatusBadge label={c.status} /> },
  ];

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

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={c => c.id}
        onRowClick={c => navigate(`/clients/${c.id}`)}
        emptyMessage="No clients found."
      />

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
