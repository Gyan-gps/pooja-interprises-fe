/** Next sequential numeric id for a collection, e.g. new client/staff/task records. */
export function nextNumericId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

/** Next PJE-### order id, continuing from the highest existing numeric suffix. */
export function nextOrderId(orders: { id: string }[]): string {
  const highest = orders.reduce((max, o) => {
    const n = Number(o.id.replace(/^PJE-/, ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `PJE-${String(highest + 1).padStart(3, "0")}`;
}
