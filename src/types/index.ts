export type OrderStatus =
  | "New"
  | "Design"
  | "Printing"
  | "Binding"
  | "Packing"
  | "Ready"
  | "Delivered"
  | "Overdue";

export type ClientType = "School" | "Hospital" | "Coaching" | "College" | "Corporate";

export interface Client {
  id: number;
  name: string;
  org: string;
  type: ClientType;
  mobile: string;
  orders: number;
  lastOrder: string;
  status: "Active" | "Inactive";
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  clientId: number;
  client: string;
  type: string;
  qty: number;
  dueDate: string;
  orderDate: string;
  status: OrderStatus;
  staff: string;
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
}

export type StaffRole =
  | "Designer"
  | "Machine Operator"
  | "Binder"
  | "Delivery Person"
  | "Manager";

export interface StaffMember {
  id: number;
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
  id: number;
  name: string;
  order: string;
  staffId: number;
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
