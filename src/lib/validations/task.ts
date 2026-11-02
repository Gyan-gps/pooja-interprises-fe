import { z } from "zod";
import {
  objectIdSchema,
  paginationQuerySchema,
} from "@/lib/validations/common";

export const taskPrioritySchema = z.enum(["High", "Medium", "Low"]);
export const taskStatusSchema = z.enum([
  "Pending",
  "In Progress",
  "Completed",
]);

export const listTasksQuerySchema = paginationQuerySchema.extend({
  staffId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  status: taskStatusSchema.optional(),
});

export const createTaskSchema = z.object({
  name: z.string().trim().min(1).max(200),
  orderId: objectIdSchema,
  staffId: objectIdSchema,
  priority: taskPrioritySchema.optional(),
  dueDate: z.coerce.date(),
  status: taskStatusSchema.optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParamsSchema = z.object({
  id: objectIdSchema,
});
