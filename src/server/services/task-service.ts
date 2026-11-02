import "server-only";

import { ApiError } from "@/server/errors/api-error";
import { findOrderById } from "@/server/repositories/order-repository";
import { findStaffById } from "@/server/repositories/staff-repository";
import {
  createTask,
  findTaskById,
  listTasks,
  softDeleteTask,
  updateTask,
} from "@/server/repositories/task-repository";
import type { TaskPriority, TaskStatus } from "@/server/models/enums";
import { serializeTask } from "@/server/utils/serializers";
import type { PaginatedResult } from "@/server/utils/pagination";

export async function listTasksForApi(filter: {
  page?: number;
  pageSize?: number;
  staffId?: string;
  orderId?: string;
  status?: TaskStatus;
}) {
  const result = await listTasks(filter);
  return mapPaginated(result, serializeTask);
}

export async function getTaskForApi(taskId: string) {
  const task = await findTaskById(taskId);
  if (!task) {
    throw new ApiError("Task not found.", {
      statusCode: 404,
      code: "TASK_NOT_FOUND",
    });
  }
  return serializeTask(task);
}

export async function createTaskForApi(input: {
  name: string;
  orderId: string;
  staffId: string;
  priority?: TaskPriority;
  dueDate: Date;
  status?: TaskStatus;
}) {
  const [order, staff] = await Promise.all([
    findOrderById(input.orderId),
    findStaffById(input.staffId),
  ]);

  if (!order) {
    throw new ApiError("Order not found.", {
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  }

  if (!staff) {
    throw new ApiError("Staff member not found.", {
      statusCode: 404,
      code: "STAFF_NOT_FOUND",
    });
  }

  const task = await createTask(input);
  return serializeTask(task);
}

export async function updateTaskForApi(
  taskId: string,
  input: {
    name?: string;
    orderId?: string;
    staffId?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    status?: TaskStatus;
  }
) {
  if (input.orderId) {
    const order = await findOrderById(input.orderId);
    if (!order) {
      throw new ApiError("Order not found.", {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }
  }

  if (input.staffId) {
    const staff = await findStaffById(input.staffId);
    if (!staff) {
      throw new ApiError("Staff member not found.", {
        statusCode: 404,
        code: "STAFF_NOT_FOUND",
      });
    }
  }

  const task = await updateTask(taskId, input);
  return serializeTask(task);
}

export async function deleteTaskForApi(taskId: string) {
  const task = await softDeleteTask(taskId);
  return serializeTask(task);
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
