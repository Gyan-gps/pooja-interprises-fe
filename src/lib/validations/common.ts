import { z } from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid id.");

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const searchQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
});

export function parseSearchParams(
  url: string
): Record<string, string | undefined> {
  const { searchParams } = new URL(url);
  const result: Record<string, string | undefined> = {};

  for (const key of searchParams.keys()) {
    result[key] = searchParams.get(key) ?? undefined;
  }

  return result;
}
