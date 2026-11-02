import "server-only";

import { ApiError } from "@/server/errors/api-error";
import {
  createStaff,
  findStaffById,
  listStaff,
  softDeleteStaff,
  updateStaff,
} from "@/server/repositories/staff-repository";
import { reassignActiveTasks } from "@/server/repositories/task-repository";
import { serializeStaff } from "@/server/utils/serializers";
import type { StaffRole } from "@/server/models/enums";
import type { PaginatedResult } from "@/server/utils/pagination";

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

export async function listStaffForApi(filter: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: StaffRole;
}) {
  const result = await listStaff(filter);
  return mapPaginated(result, serializeStaff);
}

export async function getStaffForApi(staffId: string) {
  const staff = await findStaffById(staffId);
  if (!staff) {
    throw new ApiError("Staff member not found.", {
      statusCode: 404,
      code: "STAFF_NOT_FOUND",
    });
  }
  return serializeStaff(staff);
}

export async function createStaffForApi(input: {
  name: string;
  role?: StaffRole;
  initials?: string;
  avatarColor?: string;
}) {
  const staff = await createStaff({
    name: input.name,
    role: input.role ?? "Designer",
    initials: input.initials?.trim() || deriveInitials(input.name) || "PE",
    avatarColor: input.avatarColor,
  });
  return serializeStaff(staff);
}

export async function updateStaffForApi(
  staffId: string,
  input: {
    name?: string;
    role?: StaffRole;
    initials?: string;
    avatarColor?: string;
  }
) {
  const staff = await updateStaff(staffId, input);
  return serializeStaff(staff);
}

export async function deleteStaffForApi(
  staffId: string,
  options: { reassignTasksToStaffId?: string } = {}
) {
  if (options.reassignTasksToStaffId) {
    if (options.reassignTasksToStaffId === staffId) {
      throw new ApiError("Cannot reassign tasks to the same staff member.", {
        statusCode: 400,
        code: "INVALID_REASSIGNMENT",
      });
    }

    const targetStaff = await findStaffById(options.reassignTasksToStaffId);
    if (!targetStaff) {
      throw new ApiError("Reassignment target staff member not found.", {
        statusCode: 404,
        code: "STAFF_NOT_FOUND",
      });
    }

    await reassignActiveTasks(staffId, options.reassignTasksToStaffId);
  }

  const staff = await softDeleteStaff(staffId);
  return serializeStaff(staff);
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
