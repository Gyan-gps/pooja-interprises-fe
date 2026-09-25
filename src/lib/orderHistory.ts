import { CURRENT_DATE } from "./data";
import type { Order, OrderStatus, OrderStatusEvent } from "../types";

/** Appends a status-change event, but only when the status actually changed. */
export function withStatusChange(order: Order, nextStatus: OrderStatus): Pick<Order, "status" | "statusHistory"> {
  if (nextStatus === order.status) {
    return { status: order.status, statusHistory: order.statusHistory };
  }
  const event: OrderStatusEvent = { status: nextStatus, at: CURRENT_DATE };
  return { status: nextStatus, statusHistory: [...order.statusHistory, event] };
}
