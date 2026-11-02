import "server-only";

export const USER_ROLES = ["Admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CLIENT_STATUSES = ["Active", "Inactive"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const ORDER_STATUSES = [
  "New",
  "Design",
  "Printing",
  "Binding",
  "Ready",
  "Delivered",
  "Pending for Bill",
  "Overdue",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses that should not be auto-marked Overdue. */
export const ORDER_STATUSES_EXCLUDED_FROM_OVERDUE = [
  "Delivered",
  "Pending for Bill",
] as const;

export const STAFF_ROLES = [
  "Designer",
  "Machine Operator",
  "Binder",
  "Delivery Person",
  "Manager",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["Pending", "In Progress", "Completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const INVOICE_STATUSES = [
  "Draft",
  "Issued",
  "Paid",
  "Cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const COLOR_MODES = ["Color", "Black & White", "Spot Color"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
