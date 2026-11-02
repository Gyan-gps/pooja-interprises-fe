import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction, handleAdminRequest } from "@/server/utils/route-handler";
import { objectIdSchema, parseSearchParams } from "@/lib/validations/common";
import {
  staffIdParamsSchema,
  updateStaffSchema,
} from "@/lib/validations/staff";
import {
  deleteStaffForApi,
  getStaffForApi,
  updateStaffForApi,
} from "@/server/services/staff-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = staffIdParamsSchema.parse(await context.params);
    const staff = await getStaffForApi(id);
    return createSuccessResponse(staff);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = staffIdParamsSchema.parse(await context.params);
    const body = updateStaffSchema.parse(await request.json());
    const { reassignTasksToStaffId: _ignored, ...updateInput } = body;
    void _ignored;
    const staff = await updateStaffForApi(id, updateInput);
    return createSuccessResponse(staff);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleAdminRequest(request, async () => {
    const { id } = staffIdParamsSchema.parse(await context.params);
    const query = parseSearchParams(request.url);
    const reassignTasksToStaffId = query.reassignTasksToStaffId
      ? objectIdSchema.parse(query.reassignTasksToStaffId)
      : undefined;

    const staff = await deleteStaffForApi(id, { reassignTasksToStaffId });
    return createSuccessResponse(staff);
  });
}
