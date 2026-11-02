import "server-only";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult {
  page: number;
  pageSize: number;
  skip: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function normalizePagination(
  input: PaginationInput = {}
): PaginationResult {
  const page = Number.isFinite(input.page) && (input.page ?? 0) > 0
    ? Math.floor(input.page as number)
    : 1;

  const requestedPageSize =
    Number.isFinite(input.pageSize) && (input.pageSize ?? 0) > 0
      ? Math.floor(input.pageSize as number)
      : DEFAULT_PAGE_SIZE;

  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize),
  };
}
