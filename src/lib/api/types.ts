export interface ApiPaginated<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiClient {
  id: string;
  contactName: string;
  organizationName: string;
  mobile: string;
  type: string;
  status: "Active" | "Inactive";
  branches: Array<{
    id: string;
    name: string;
    mobile: string;
    address: string;
  }>;
  notes: Array<{
    id: string;
    body: string;
    createdAt: string;
    createdBy?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStaff {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  branchId?: string;
  branchName: string;
  contactName: string;
  contactMobile: string;
  orderType: string;
  quantity: number;
  paperType: string;
  size: string;
  colorMode: string;
  binding: string;
  notes: string;
  orderDate: string;
  dueDate: string | null;
  status: string;
  assignedStaffId?: string;
  assignedStaffName: string;
  readyCount?: number;
  delivery: {
    receivedBy: string;
    mobile: string;
    deliveredAt: string;
    notes: string;
    acknowledgementUrl: string;
  } | null;
  statusHistory: Array<{ status: string; at: string }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTask {
  id: string;
  name: string;
  orderId: string;
  staffId: string;
  priority: string;
  dueDate: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSettings {
  id?: string;
  businessName: string;
  owner: string;
  gstNumber: string;
  contactNumber: string;
  cityState: string;
  financialYear: string;
  updatedAt?: string;
}
