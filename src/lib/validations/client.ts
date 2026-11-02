import { z } from "zod";
import {
  objectIdSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "@/lib/validations/common";

const clientBranchSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mobile: z.string().trim().min(1).max(20),
  address: z.string().trim().max(300).optional(),
});

export const listClientsQuerySchema = paginationQuerySchema
  .merge(searchQuerySchema)
  .extend({
    type: z.string().trim().max(80).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  });

export const createClientSchema = z.object({
  contactName: z.string().trim().min(1).max(120),
  organizationName: z.string().trim().min(1).max(200),
  mobile: z.string().trim().min(1).max(20),
  type: z.string().trim().min(1).max(80).default("School"),
  status: z.enum(["Active", "Inactive"]).optional(),
  branches: z.array(clientBranchSchema).optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const addClientNoteSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const clientIdParamsSchema = z.object({
  id: objectIdSchema,
});
