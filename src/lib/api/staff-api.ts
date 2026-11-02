"use client";

import { apiRequest, toQueryString } from "@/lib/api/http";
import { mapApiStaffToUi } from "@/lib/api/mappers";
import type { ApiPaginated, ApiStaff } from "@/lib/api/types";
import type { CreateStaffInput, StaffMember, Task } from "@/types";

const LIST_PAGE_SIZE = 100;

export async function fetchStaff(tasks: Task[] = []): Promise<StaffMember[]> {
  const data = await apiRequest<ApiPaginated<ApiStaff>>(
    `/api/v1/staff${toQueryString({ page: 1, pageSize: LIST_PAGE_SIZE })}`
  );
  return data.items.map((member) => mapApiStaffToUi(member, tasks));
}

export async function createStaffApi(
  input: CreateStaffInput,
  tasks: Task[] = []
): Promise<StaffMember> {
  const created = await apiRequest<ApiStaff>("/api/v1/staff", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      role: input.role,
      initials: input.initials,
      avatarColor: input.color,
    }),
  });
  return mapApiStaffToUi(created, tasks);
}

export async function updateStaffApi(
  id: string,
  patch: Partial<StaffMember>,
  tasks: Task[] = []
): Promise<StaffMember> {
  const updated = await apiRequest<ApiStaff>(`/api/v1/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: patch.name,
      role: patch.role,
      initials: patch.initials,
      avatarColor: patch.color,
    }),
  });
  return mapApiStaffToUi(updated, tasks);
}

export async function deleteStaffApi(
  id: string,
  reassignTasksToStaffId?: string
): Promise<void> {
  const query = toQueryString({ reassignTasksToStaffId });
  await apiRequest(`/api/v1/staff/${id}${query}`, { method: "DELETE" });
}
