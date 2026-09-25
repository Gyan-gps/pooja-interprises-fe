import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Value used for sorting when this column is clicked. Omit for non-sortable columns. */
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
}

const PAGE_SIZE_DEFAULT = 10;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyMessage = "No records found.",
  pageSize = PAGE_SIZE_DEFAULT,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find(c => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const withValues = rows.map(row => ({ row, value: col.sortValue!(row) }));
    withValues.sort((a, b) => {
      if (a.value < b.value) return sort.dir === "asc" ? -1 : 1;
      if (a.value > b.value) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return withValues.map(w => w.row);
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(col: DataTableColumn<T>) {
    if (!col.sortValue) return;
    setPage(1);
    setSort(prev => {
      if (prev?.key !== col.key) return { key: col.key, dir: "asc" };
      return { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${col.className ?? ""} ${col.sortValue ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                  onClick={() => toggleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sort?.key === col.key && (sort.dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? e => e.key === "Enter" && onRowClick(row) : undefined}
                className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages} · {sorted.length} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-border font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-border font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
