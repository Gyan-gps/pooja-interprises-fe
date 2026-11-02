"use client";

import { apiRequest, toQueryString } from "@/lib/api/http";
import { mapApiTaskToUi } from "@/lib/api/mappers";
import type { ApiPaginated, ApiTask } from "@/lib/api/types";
import type { CreateTaskInput, Order, Task } from "@/types";

const LIST_PAGE_SIZE = 100;

export async function fetchTasks(
  orders: Array<Pick<Order, "id" | "orderNumber">> = []
): Promise<Task[]> {
  const data = await apiRequest<ApiPaginated<ApiTask>>(
    `/api/v1/tasks${toQueryString({ page: 1, pageSize: LIST_PAGE_SIZE })}`
  );
  return data.items.map((task) => mapApiTaskToUi(task, orders));
}

export async function createTaskApi(
  input: CreateTaskInput,
  orders: Array<Pick<Order, "id" | "orderNumber">> = []
): Promise<Task> {
  const created = await apiRequest<ApiTask>("/api/v1/tasks", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      orderId: input.orderId,
      staffId: input.staffId,
      priority: input.priority,
      dueDate: input.due,
      status: input.status,
    }),
  });
  return mapApiTaskToUi(created, orders);
}

export async function updateTaskApi(
  id: string,
  patch: Partial<Task>,
  orders: Array<Pick<Order, "id" | "orderNumber">> = []
): Promise<Task> {
  const updated = await apiRequest<ApiTask>(`/api/v1/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: patch.name,
      orderId: patch.orderId,
      staffId: patch.staffId,
      priority: patch.priority,
      dueDate: patch.due,
      status: patch.status,
    }),
  });
  return mapApiTaskToUi(updated, orders);
}

export async function deleteTaskApi(id: string): Promise<void> {
  await apiRequest(`/api/v1/tasks/${id}`, { method: "DELETE" });
}
