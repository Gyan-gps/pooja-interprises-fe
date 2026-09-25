import type { ElementType } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  UserCheck,
  BarChart2,
  Settings,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
  { id: "clients", label: "Clients", path: "/clients", icon: Users },
  { id: "orders", label: "Orders", path: "/orders", icon: Package },
  { id: "production", label: "Production", path: "/production", icon: Layers },
  { id: "staff", label: "Staff", path: "/staff", icon: UserCheck },
  { id: "reports", label: "Reports", path: "/reports", icon: BarChart2 },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
];

export const STATUS_CLS: Record<string, string> = {
  New: "bg-slate-100 text-slate-700",
  Design: "bg-blue-50 text-blue-700",
  Printing: "bg-orange-50 text-orange-700",
  Binding: "bg-purple-50 text-purple-700",
  Packing: "bg-yellow-50 text-yellow-700",
  Ready: "bg-emerald-50 text-emerald-700",
  Delivered: "bg-green-50 text-green-700",
  Overdue: "bg-red-50 text-red-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Pending: "bg-yellow-50 text-yellow-700",
  Completed: "bg-green-50 text-green-700",
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
  High: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

export const TYPE_CLS: Record<string, string> = {
  School: "bg-orange-50 text-orange-700",
  Hospital: "bg-blue-50 text-blue-700",
  Coaching: "bg-purple-50 text-purple-700",
  College: "bg-emerald-50 text-emerald-700",
  Corporate: "bg-slate-100 text-slate-700",
};

export const KANBAN_COLORS: Record<string, string> = {
  New: "#6B7280",
  Design: "#3B82F6",
  Printing: "#E84C1E",
  Binding: "#8B5CF6",
  Packing: "#F59E0B",
  Ready: "#10B981",
  Delivered: "#059669",
};
