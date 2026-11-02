import { z } from "zod";
import {
  objectIdSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "@/lib/validations/common";

export const staffRoleSchema = z.enum([
  "Designer",
  "Machine Operator",
  "Binder",
  "Delivery Person",
  "Manager",
]);

export const listStaffQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .extend({
    role: staffRoleSchema.optional(),
  });

export const createStaffSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: staffRoleSchema.default("Designer"),
  initials: z.string().trim().min(1).max(4).optional(),
  avatarColor: z.string().trim().max(64).optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: staffRoleSchema.optional(),
  initials: z.string().trim().min(1).max(4).optional(),
  avatarColor: z.string().trim().max(64).optional(),
  reassignTasksToStaffId: objectIdSchema.optional(),
});

export const staffIdParamsSchema = z.object({
  id: objectIdSchema,
});
