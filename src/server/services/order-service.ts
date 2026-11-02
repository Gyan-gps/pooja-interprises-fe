import "server-only";

import { ApiError } from "@/server/errors/api-error";
import { findClientById } from "@/server/repositories/client-repository";
import { findStaffById } from "@/server/repositories/staff-repository";
import {
  createOrder,
  findOrderById,
  listOrders,
  listOrdersPastDue,
  recordOrderDelivery,
  softDeleteOrder,
  updateOrder,
  updateOrderStatus,
} from "@/server/repositories/order-repository";
import type { OrderStatus } from "@/server/models/enums";
import { serializeOrder } from "@/server/utils/serializers";
import type { PaginatedResult } from "@/server/utils/pagination";

async function syncOverdueOrders(referenceDate = new Date()): Promise<number> {
  const pastDueOrders = await listOrdersPastDue(referenceDate);
  let updatedCount = 0;

  for (const order of pastDueOrders) {
    await updateOrderStatus(order._id, {
      status: "Overdue",
      changedAt: referenceDate,
    });
    updatedCount += 1;
  }

  return updatedCount;
}

async function resolveAssignedStaff(assignedStaffId?: string | null) {
  if (!assignedStaffId) {
    return {
      assignedStaffId: undefined as string | undefined,
      assignedStaffName: "—",
    };
  }

  const staff = await findStaffById(assignedStaffId);
  if (!staff) {
    throw new ApiError("Assigned staff member not found.", {
      statusCode: 404,
      code: "STAFF_NOT_FOUND",
    });
  }

  return {
    assignedStaffId: staff._id.toString(),
    assignedStaffName: staff.name,
  };
}

export async function listOrdersForApi(filter: {
  page?: number;
  pageSize?: number;
  search?: string;
  clientId?: string;
  status?: OrderStatus;
  assignedStaffId?: string;
  orderType?: string;
}) {
  await syncOverdueOrders();
  const result = await listOrders(filter);
  return mapPaginated(result, serializeOrder);
}

export async function getOrderForApi(orderId: string) {
  await syncOverdueOrders();
  const order = await findOrderById(orderId);
  if (!order) {
    throw new ApiError("Order not found.", {
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  }
  return serializeOrder(order);
}

export async function createOrderForApi(input: {
  clientId: string;
  branchId?: string;
  contactName?: string;
  contactMobile?: string;
  orderType: string;
  quantity: number;
  paperType?: string;
  size?: string;
  colorMode?: string;
  binding?: string;
  notes?: string;
  orderDate?: Date;
  dueDate?: Date | null;
  assignedStaffId?: string;
}) {
  const client = await findClientById(input.clientId);
  if (!client) {
    throw new ApiError("Client not found.", {
      statusCode: 404,
      code: "CLIENT_NOT_FOUND",
    });
  }

  let branchName = "";
  if (input.branchId) {
    const branch = client.branches.find(
      (item) => item._id.toString() === input.branchId
    );
    if (!branch) {
      throw new ApiError("Branch not found for this client.", {
        statusCode: 400,
        code: "BRANCH_NOT_FOUND",
      });
    }
    branchName = branch.name;
  } else if (client.branches.length > 0) {
    throw new ApiError("branchId is required when the client has branches.", {
      statusCode: 400,
      code: "BRANCH_REQUIRED",
    });
  }

  const staffAssignment = await resolveAssignedStaff(input.assignedStaffId);

  const order = await createOrder({
    clientId: client._id,
    branchId: input.branchId,
    branchName,
    contactName: input.contactName ?? client.contactName,
    contactMobile: input.contactMobile ?? client.mobile,
    orderType: input.orderType,
    quantity: input.quantity,
    paperType: input.paperType,
    size: input.size,
    colorMode: input.colorMode,
    binding: input.binding,
    notes: input.notes,
    orderDate: input.orderDate ?? new Date(),
    dueDate: input.dueDate ?? null,
    assignedStaffId: staffAssignment.assignedStaffId,
    assignedStaffName: staffAssignment.assignedStaffName,
  });

  return serializeOrder(order);
}

export async function updateOrderForApi(
  orderId: string,
  input: {
    branchId?: string | null;
    contactName?: string;
    contactMobile?: string;
    orderType?: string;
    quantity?: number;
    paperType?: string;
    size?: string;
    colorMode?: string;
    binding?: string;
    notes?: string;
    dueDate?: Date | null;
    assignedStaffId?: string | null;
    readyCount?: number | null;
  }
) {
  const existingOrder = await findOrderById(orderId);
  if (!existingOrder) {
    throw new ApiError("Order not found.", {
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  }

  let branchName: string | undefined;
  let branchId = input.branchId;

  if (input.branchId) {
    const client = await findClientById(existingOrder.clientId);
    if (!client) {
      throw new ApiError("Client not found.", {
        statusCode: 404,
        code: "CLIENT_NOT_FOUND",
      });
    }
    const branch = client.branches.find(
      (item) => item._id.toString() === input.branchId
    );
    if (!branch) {
      throw new ApiError("Branch not found for this client.", {
        statusCode: 400,
        code: "BRANCH_NOT_FOUND",
      });
    }
    branchName = branch.name;
  } else if (input.branchId === null) {
    branchName = "";
    branchId = null;
  }

  const staffAssignment =
    input.assignedStaffId === undefined
      ? null
      : await resolveAssignedStaff(input.assignedStaffId);

  const order = await updateOrder(orderId, {
    branchId,
    branchName,
    contactName: input.contactName,
    contactMobile: input.contactMobile,
    orderType: input.orderType,
    quantity: input.quantity,
    paperType: input.paperType,
    size: input.size,
    colorMode: input.colorMode,
    binding: input.binding,
    notes: input.notes,
    dueDate: input.dueDate,
    assignedStaffId: staffAssignment
      ? staffAssignment.assignedStaffId ?? null
      : undefined,
    assignedStaffName: staffAssignment
      ? staffAssignment.assignedStaffName
      : undefined,
    readyCount: input.readyCount,
  });

  return serializeOrder(order);
}

export async function updateOrderStatusForApi(
  orderId: string,
  input: {
    status: OrderStatus;
    assignedStaffId?: string;
    readyCount?: number;
  }
) {
  const existingOrder = await findOrderById(orderId);
  if (!existingOrder) {
    throw new ApiError("Order not found.", {
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  }

  if (
    existingOrder.status === "Binding" &&
    input.status === "Ready" &&
    (input.readyCount === undefined || input.readyCount <= 0)
  ) {
    throw new ApiError("readyCount is required when moving Binding → Ready.", {
      statusCode: 400,
      code: "READY_COUNT_REQUIRED",
    });
  }

  const staffAssignment = input.assignedStaffId
    ? await resolveAssignedStaff(input.assignedStaffId)
    : null;

  if (!staffAssignment && input.status !== existingOrder.status) {
    // Phase moves in UI require staff; keep that rule on the API.
    throw new ApiError("assignedStaffId is required for status changes.", {
      statusCode: 400,
      code: "STAFF_REQUIRED",
    });
  }

  const order = await updateOrderStatus(orderId, {
    status: input.status,
    assignedStaffId: staffAssignment?.assignedStaffId,
    assignedStaffName: staffAssignment?.assignedStaffName,
    readyCount: input.readyCount,
  });

  return serializeOrder(order);
}

export async function recordOrderDeliveryForApi(
  orderId: string,
  input: {
    receivedBy: string;
    mobile?: string;
    deliveredAt?: Date;
    notes?: string;
    acknowledgementUrl?: string;
  }
) {
  const existingOrder = await findOrderById(orderId);
  if (!existingOrder) {
    throw new ApiError("Order not found.", {
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  }

  if (existingOrder.status !== "Ready") {
    throw new ApiError("Only Ready orders can be marked Delivered.", {
      statusCode: 400,
      code: "INVALID_DELIVERY_STATUS",
    });
  }

  const order = await recordOrderDelivery(orderId, {
    receivedBy: input.receivedBy.trim(),
    mobile: input.mobile?.trim() ?? "",
    deliveredAt: input.deliveredAt ?? new Date(),
    notes: input.notes?.trim() ?? "",
    acknowledgementUrl: input.acknowledgementUrl?.trim() ?? "",
  });

  return serializeOrder(order);
}

export async function deleteOrderForApi(orderId: string) {
  const order = await softDeleteOrder(orderId);
  return serializeOrder(order);
}

function mapPaginated<T, R>(
  result: PaginatedResult<T>,
  mapper: (item: T) => R
) {
  return {
    items: result.items.map(mapper),
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}
