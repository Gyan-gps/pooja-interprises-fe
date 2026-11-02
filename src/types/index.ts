export type OrderStatus =
  | "New"
  | "Design"
  | "Printing"
  | "Binding"
  | "Ready"
  | "Delivered"
  | "Pending for Bill"
  | "Overdue";

/** Built-in types are "School" | "Hospital" | "Coaching" | "College" | "Corporate"; users can add their own. */
export type ClientType = string;

export interface Branch {
  id: string;
  name: string;
  mobile: string;
  address?: string;
}

export interface Client {
  id: string;
  name: string;
  org: string;
  type: ClientType;
  mobile: string;
  orders: number;
  lastOrder: string;
  status: "Active" | "Inactive";
  branches?: Branch[];
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  /** MongoDB ObjectId used for routing and API calls. */
  id: string;
  /** Human-readable order code, e.g. PJE-2026-001. */
  orderNumber: string;
  clientId: string;
  client: string;
  branchId?: string;
  branch?: string;
  contactName?: string;
  contactMobile?: string;
  type: string;
  qty: number;
  dueDate: string;
  orderDate: string;
  status: OrderStatus;
  staff: string;
  staffId?: string;
  paperType: string;
  size: string;
  colorMode: string;
  binding: string;
  notes: string;
  deliveredTo: string;
  deliveredMobile: string;
  deliveredDate: string;
  deliveryNotes: string;
  acknowledgementFile: string;
  statusHistory: OrderStatusEvent[];
  /** Pieces confirmed when moving Binding → Ready. */
  readyCount?: number;
}

export type StaffRole =
  | "Designer"
  | "Machine Operator"
  | "Binder"
  | "Delivery Person"
  | "Manager";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  active: number;
  completed: number;
  initials: string;
  /** Tailwind background class used for the avatar chip. */
  color: string;
}

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface Task {
  id: string;
  name: string;
  /** MongoDB order id. */
  orderId: string;
  /** Display/link label (order number). */
  order: string;
  staffId: string;
  priority: TaskPriority;
  due: string;
  status: TaskStatus;
}

export interface BusinessSettings {
  businessName: string;
  owner: string;
  gstNumber: string;
  contactNumber: string;
  cityState: string;
  financialYear: string;
}

export interface CreateClientInput {
  name: string;
  org: string;
  mobile: string;
  type: string;
  status?: "Active" | "Inactive";
  branches?: Array<{ name: string; mobile: string; address?: string }>;
}

export interface CreateStaffInput {
  name: string;
  role: StaffRole;
  initials?: string;
  color?: string;
}

export interface CreateOrderInput {
  clientId: string;
  branchId?: string;
  contactName?: string;
  contactMobile?: string;
  type: string;
  qty: number;
  orderDate?: string;
  dueDate?: string;
  paperType?: string;
  size?: string;
  colorMode?: string;
  binding?: string;
  notes?: string;
  staffId?: string;
}

export interface CreateTaskInput {
  name: string;
  orderId: string;
  staffId: string;
  priority?: TaskPriority;
  due: string;
  status?: TaskStatus;
}
