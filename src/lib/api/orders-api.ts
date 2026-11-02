"use client";

import { apiRequest, toQueryString } from "@/lib/api/http";
import { mapApiOrderToUi } from "@/lib/api/mappers";
import type { ApiOrder, ApiPaginated } from "@/lib/api/types";
import type { Client, CreateOrderInput, Order, OrderStatus } from "@/types";

const LIST_PAGE_SIZE = 100;

function dueDateForApi(dueDate?: string): string | null | undefined {
  if (dueDate === undefined) return undefined;
  if (!dueDate || dueDate === "TBD") return null;
  return dueDate;
}

export async function fetchOrders(
  clients: Array<Pick<Client, "id" | "org">> = []
): Promise<Order[]> {
  const data = await apiRequest<ApiPaginated<ApiOrder>>(
    `/api/v1/orders${toQueryString({ page: 1, pageSize: LIST_PAGE_SIZE })}`
  );
  return data.items.map((order) => mapApiOrderToUi(order, clients));
}

export async function createOrderApi(
  input: CreateOrderInput,
  clients: Array<Pick<Client, "id" | "org">> = []
): Promise<Order> {
  const created = await apiRequest<ApiOrder>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify({
      clientId: input.clientId,
      branchId: input.branchId,
      contactName: input.contactName,
      contactMobile: input.contactMobile,
      orderType: input.type,
      quantity: input.qty,
      orderDate: input.orderDate,
      dueDate: dueDateForApi(input.dueDate),
      paperType: input.paperType,
      size: input.size,
      colorMode: input.colorMode,
      binding: input.binding,
      notes: input.notes,
      assignedStaffId: input.staffId,
    }),
  });
  return mapApiOrderToUi(created, clients);
}

export async function updateOrderApi(
  id: string,
  patch: Partial<Order>,
  clients: Array<Pick<Client, "id" | "org">> = []
): Promise<Order> {
  // Status-only updates go through the status endpoint.
  if (patch.status && Object.keys(patch).every((key) =>
    ["status", "staff", "staffId", "readyCount"].includes(key)
  )) {
    return updateOrderStatusApi(
      id,
      {
        status: patch.status,
        staffId: patch.staffId,
        readyCount: patch.readyCount,
      },
      clients
    );
  }

  if (patch.deliveredTo) {
    const delivered = await apiRequest<ApiOrder>(`/api/v1/orders/${id}/delivery`, {
      method: "POST",
      body: JSON.stringify({
        receivedBy: patch.deliveredTo,
        mobile: patch.deliveredMobile,
        deliveredAt: patch.deliveredDate || undefined,
        notes: patch.deliveryNotes,
        acknowledgementUrl: patch.acknowledgementFile,
      }),
    });
    return mapApiOrderToUi(delivered, clients);
  }

  const updated = await apiRequest<ApiOrder>(`/api/v1/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      branchId: patch.branchId,
      contactName: patch.contactName,
      contactMobile: patch.contactMobile,
      orderType: patch.type,
      quantity: patch.qty,
      paperType: patch.paperType,
      size: patch.size,
      colorMode: patch.colorMode,
      binding: patch.binding,
      notes: patch.notes,
      dueDate: dueDateForApi(patch.dueDate),
      assignedStaffId: patch.staffId,
      readyCount: patch.readyCount,
    }),
  });
  return mapApiOrderToUi(updated, clients);
}

export async function updateOrderStatusApi(
  id: string,
  input: {
    status: OrderStatus;
    staffId?: string;
    readyCount?: number;
  },
  clients: Array<Pick<Client, "id" | "org">> = []
): Promise<Order> {
  const updated = await apiRequest<ApiOrder>(`/api/v1/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: input.status,
      assignedStaffId: input.staffId,
      readyCount: input.readyCount,
    }),
  });
  return mapApiOrderToUi(updated, clients);
}

export async function deleteOrderApi(id: string): Promise<void> {
  await apiRequest(`/api/v1/orders/${id}`, { method: "DELETE" });
}
