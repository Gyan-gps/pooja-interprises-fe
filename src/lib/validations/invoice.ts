import { z } from "zod";
import {
  objectIdSchema,
  paginationQuerySchema,
} from "@/lib/validations/common";

export const invoiceStatusSchema = z.enum([
  "Draft",
  "Issued",
  "Paid",
  "Cancelled",
]);

const invoiceLineItemInputSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
});

export const listInvoicesQuerySchema = paginationQuerySchema.extend({
  clientId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  status: invoiceStatusSchema.optional(),
});

export const createInvoiceSchema = z.object({
  orderId: objectIdSchema,
  lineItems: z.array(invoiceLineItemInputSchema).min(1),
  gstRate: z.number().min(0).max(100).default(0),
  status: invoiceStatusSchema.optional(),
  issuedAt: z.coerce.date().optional(),
  dueAt: z.coerce.date().optional(),
});

export const updateInvoiceSchema = z.object({
  lineItems: z.array(invoiceLineItemInputSchema).min(1).optional(),
  gstRate: z.number().min(0).max(100).optional(),
  status: invoiceStatusSchema.optional(),
  issuedAt: z.coerce.date().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  paidAt: z.coerce.date().nullable().optional(),
});

export const invoiceIdParamsSchema = z.object({
  id: objectIdSchema,
});
