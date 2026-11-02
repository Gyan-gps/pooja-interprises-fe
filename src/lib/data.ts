import type { OrderStatus } from "../types";

/** Default "today" for date fields in create forms. */
export const CURRENT_DATE = new Date().toISOString().slice(0, 10);

export const monthlyData = [
  { month: "Jan", orders: 45 },
  { month: "Feb", orders: 52 },
  { month: "Mar", orders: 48 },
  { month: "Apr", orders: 61 },
  { month: "May", orders: 58 },
  { month: "Jun", orders: 42 },
];

export const clientTypeDist = [
  { name: "School", value: 38, color: "#E84C1E" },
  { name: "Hospital", value: 22, color: "#3B82F6" },
  { name: "Coaching", value: 18, color: "#8B5CF6" },
  { name: "College", value: 14, color: "#10B981" },
  { name: "Other", value: 8, color: "#F59E0B" },
];

export const ORDER_TYPES = [
  "School Books", "Notebooks", "Registers", "Question Papers", "Answer Sheets",
  "Banners", "Certificates", "Hospital Forms", "Prescription Pads",
  "Brochures", "Visiting Cards", "Custom Print",
];

export const KANBAN_COLS: OrderStatus[] = [
  "New",
  "Design",
  "Printing",
  "Binding",
  "Ready",
  "Delivered",
  "Pending for Bill",
];

export const WORKFLOW_STEPS: OrderStatus[] = [
  "New",
  "Design",
  "Printing",
  "Binding",
  "Ready",
  "Delivered",
  "Pending for Bill",
];
