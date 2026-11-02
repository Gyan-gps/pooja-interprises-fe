import type {
  BusinessSettings,
  Client,
  Order,
  OrderStatus,
  StaffMember,
  StaffRole,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types";
import type {
  ApiClient,
  ApiOrder,
  ApiSettings,
  ApiStaff,
  ApiTask,
} from "@/lib/api/types";

function toDateInput(value: string | null | undefined): string {
  if (!value) return "TBD";
  return value.slice(0, 10);
}

export function mapApiClientToUi(
  client: ApiClient,
  orders: Order[] = []
): Client {
  const clientOrders = orders.filter((order) => order.clientId === client.id);
  const lastOrder = clientOrders
    .map((order) => order.orderDate)
    .sort()
    .at(-1);

  return {
    id: client.id,
    name: client.contactName,
    org: client.organizationName,
    type: client.type,
    mobile: client.mobile,
    orders: clientOrders.length,
    lastOrder: lastOrder ?? "",
    status: client.status,
    branches: client.branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      mobile: branch.mobile,
      address: branch.address || undefined,
    })),
  };
}

export function mapApiStaffToUi(
  staff: ApiStaff,
  tasks: Task[] = []
): StaffMember {
  const staffTasks = tasks.filter((task) => task.staffId === staff.id);
  const active = staffTasks.filter((task) => task.status !== "Completed").length;
  const completed = staffTasks.filter((task) => task.status === "Completed").length;

  return {
    id: staff.id,
    name: staff.name,
    role: staff.role as StaffRole,
    active,
    completed,
    initials: staff.initials,
    color: staff.avatarColor,
  };
}

export function mapApiOrderToUi(
  order: ApiOrder,
  clients: Array<Pick<Client, "id" | "org">> = []
): Order {
  const clientName =
    clients.find((client) => client.id === order.clientId)?.org ||
    order.contactName ||
    "Unknown client";

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    clientId: order.clientId,
    client: clientName,
    branchId: order.branchId,
    branch: order.branchName || undefined,
    contactName: order.contactName || undefined,
    contactMobile: order.contactMobile || undefined,
    type: order.orderType,
    qty: order.quantity,
    dueDate: toDateInput(order.dueDate),
    orderDate: toDateInput(order.orderDate),
    status: order.status as OrderStatus,
    staff: order.assignedStaffName || "—",
    staffId: order.assignedStaffId,
    paperType: order.paperType,
    size: order.size,
    colorMode: order.colorMode,
    binding: order.binding,
    notes: order.notes,
    deliveredTo: order.delivery?.receivedBy ?? "",
    deliveredMobile: order.delivery?.mobile ?? "",
    deliveredDate: order.delivery ? toDateInput(order.delivery.deliveredAt) : "",
    deliveryNotes: order.delivery?.notes ?? "",
    acknowledgementFile: order.delivery?.acknowledgementUrl ?? "",
    statusHistory: order.statusHistory.map((event) => ({
      status: event.status as OrderStatus,
      at: toDateInput(event.at),
    })),
    readyCount: order.readyCount,
  };
}

export function mapApiTaskToUi(
  task: ApiTask,
  orders: Array<Pick<Order, "id" | "orderNumber">> = []
): Task {
  const order = orders.find((item) => item.id === task.orderId);

  return {
    id: task.id,
    name: task.name,
    orderId: task.orderId,
    order: order?.orderNumber ?? task.orderId,
    staffId: task.staffId,
    priority: task.priority as TaskPriority,
    due: toDateInput(task.dueDate),
    status: task.status as TaskStatus,
  };
}

export function mapApiSettingsToUi(settings: ApiSettings): BusinessSettings {
  return {
    businessName: settings.businessName,
    owner: settings.owner,
    gstNumber: settings.gstNumber,
    contactNumber: settings.contactNumber,
    cityState: settings.cityState,
    financialYear: settings.financialYear,
  };
}
