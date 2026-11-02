import { z } from "zod";

export const updateBusinessSettingsSchema = z.object({
  businessName: z.string().trim().min(1).max(200).optional(),
  owner: z.string().trim().max(200).optional(),
  gstNumber: z.string().trim().max(32).optional(),
  contactNumber: z.string().trim().max(32).optional(),
  cityState: z.string().trim().max(120).optional(),
  financialYear: z.string().trim().max(32).optional(),
});
