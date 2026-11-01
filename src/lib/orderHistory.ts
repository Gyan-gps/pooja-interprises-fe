import { CURRENT_DATE } from "./data";
import type { Order, OrderStatus, OrderStatusEvent } from "../types";

/** Maps removed statuses (e.g. Packing) onto the current workflow. */
export function normalizeOrderStatus(status: string): OrderStatus {
  if (status === "Packing") return "Ready";
  return status as OrderStatus;
}

export function migrateOrder(order: Order): Order {
  const status = normalizeOrderStatus(order.status);
  if (status === order.status) return order;
  return { ...order, status };
}

/** Appends a status-change event, but only when the status actually changed. */
export function withStatusChange(order: Order, nextStatus: OrderStatus): Pick<Order, "status" | "statusHistory"> {
  if (nextStatus === order.status) {
    return { status: order.status, statusHistory: order.statusHistory };
  }
  const event: OrderStatusEvent = { status: nextStatus, at: CURRENT_DATE };
  return { status: nextStatus, statusHistory: [...order.statusHistory, event] };
}
