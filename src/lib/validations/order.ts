import { z } from "zod";
import {
  objectIdSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "@/lib/validations/common";

export const orderStatusSchema = z.enum([
  "New",
  "Design",
  "Printing",
  "Binding",
  "Ready",
  "Delivered",
  "Pending for Bill",
  "Overdue",
]);

export const listOrdersQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .extend({
    clientId: objectIdSchema.optional(),
    status: orderStatusSchema.optional(),
    assignedStaffId: objectIdSchema.optional(),
    orderType: z.string().trim().max(120).optional(),
  });

export const createOrderSchema = z.object({
  clientId: objectIdSchema,
  branchId: objectIdSchema.optional(),
  contactName: z.string().trim().max(120).optional(),
  contactMobile: z.string().trim().max(20).optional(),
  orderType: z.string().trim().min(1).max(120),
  quantity: z.number().int().positive(),
  paperType: z.string().trim().max(120).optional(),
  size: z.string().trim().max(80).optional(),
  colorMode: z.string().trim().max(40).optional(),
  binding: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(5000).optional(),
  orderDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assignedStaffId: objectIdSchema.optional(),
});

export const updateOrderSchema = z.object({
  branchId: objectIdSchema.nullable().optional(),
  contactName: z.string().trim().max(120).optional(),
  contactMobile: z.string().trim().max(20).optional(),
  orderType: z.string().trim().min(1).max(120).optional(),
  quantity: z.number().int().positive().optional(),
  paperType: z.string().trim().max(120).optional(),
  size: z.string().trim().max(80).optional(),
  colorMode: z.string().trim().max(40).optional(),
  binding: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(5000).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assignedStaffId: objectIdSchema.nullable().optional(),
  readyCount: z.number().int().min(0).nullable().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  assignedStaffId: objectIdSchema.optional(),
  readyCount: z.number().int().positive().optional(),
});

export const recordOrderDeliverySchema = z.object({
  receivedBy: z.string().trim().min(1).max(120),
  mobile: z.string().trim().max(20).optional(),
  deliveredAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
  acknowledgementUrl: z.string().trim().max(2048).optional(),
});

export const orderIdParamsSchema = z.object({
  id: objectIdSchema,
});
