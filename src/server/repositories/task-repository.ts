import "server-only";

import type { Types } from "mongoose";
import type { MongoFilter } from "@/server/utils/mongo-filter";
import { connectToDatabase } from "@/server/database/mongodb";
import { Task, type TaskDocument } from "@/server/models/task";
import type { TaskPriority, TaskStatus } from "@/server/models/enums";
import { ApiError } from "@/server/errors/api-error";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";
import {
  createPaginatedResult,
  normalizePagination,
  type PaginatedResult,
  type PaginationInput,
} from "@/server/utils/pagination";

export interface CreateTaskInput {
  name: string;
  orderId: string | Types.ObjectId;
  staffId: string | Types.ObjectId;
  priority?: TaskPriority;
  dueDate: Date;
  status?: TaskStatus;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface ListTasksFilter extends PaginationInput {
  staffId?: string | Types.ObjectId;
  orderId?: string | Types.ObjectId;
  status?: TaskStatus;
  includeInactive?: boolean;
}

export async function listTasks(
  filter: ListTasksFilter = {}
): Promise<PaginatedResult<TaskDocument>> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const { page, pageSize, skip } = normalizePagination(filter);
    const query: MongoFilter = {};

    if (!filter.includeInactive) {
      query.isActive = true;
    }

    if (filter.staffId) {
      query.staffId = filter.staffId;
    }

    if (filter.orderId) {
      query.orderId = filter.orderId;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    const [items, totalCount] = await Promise.all([
      Task.find(query)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      Task.countDocuments(query).exec(),
    ]);

    return createPaginatedResult(items, totalCount, page, pageSize);
  });
}

export async function findTaskById(
  taskId: string | Types.ObjectId,
  options: { includeInactive?: boolean } = {}
): Promise<TaskDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const query: MongoFilter = { _id: taskId };
    if (!options.includeInactive) {
      query.isActive = true;
    }

    return Task.findOne(query).lean().exec();
  });
}

export async function createTask(
  input: CreateTaskInput
): Promise<TaskDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const createdTask = await Task.create({
      name: input.name.trim(),
      orderId: input.orderId,
      staffId: input.staffId,
      priority: input.priority ?? "Medium",
      dueDate: input.dueDate,
      status: input.status ?? "Pending",
      isActive: true,
    });

    return createdTask.toObject();
  });
}

export async function updateTask(
  taskId: string | Types.ObjectId,
  input: UpdateTaskInput
): Promise<TaskDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatePayload: Record<string, unknown> = {};

    if (input.name !== undefined) {
      updatePayload.name = input.name.trim();
    }
    if (input.orderId !== undefined) {
      updatePayload.orderId = input.orderId;
    }
    if (input.staffId !== undefined) {
      updatePayload.staffId = input.staffId;
    }
    if (input.priority !== undefined) {
      updatePayload.priority = input.priority;
    }
    if (input.dueDate !== undefined) {
      updatePayload.dueDate = input.dueDate;
    }
    if (input.status !== undefined) {
      updatePayload.status = input.status;
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, isActive: true },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedTask) {
      throw new ApiError("Task not found.", {
        statusCode: 404,
        code: "TASK_NOT_FOUND",
      });
    }

    return updatedTask;
  });
}

export async function reassignActiveTasks(
  fromStaffId: string | Types.ObjectId,
  toStaffId: string | Types.ObjectId
): Promise<number> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const result = await Task.updateMany(
      {
        staffId: fromStaffId,
        isActive: true,
        status: { $ne: "Completed" },
      },
      { $set: { staffId: toStaffId } }
    ).exec();

    return result.modifiedCount;
  });
}

export async function softDeleteTask(
  taskId: string | Types.ObjectId
): Promise<TaskDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    )
      .lean()
      .exec();

    if (!updatedTask) {
      throw new ApiError("Task not found.", {
        statusCode: 404,
        code: "TASK_NOT_FOUND",
      });
    }

    return updatedTask;
  });
}
