import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction } from "@/server/utils/route-handler";
import {
  taskIdParamsSchema,
  updateTaskSchema,
} from "@/lib/validations/task";
import {
  deleteTaskForApi,
  getTaskForApi,
  updateTaskForApi,
} from "@/server/services/task-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = taskIdParamsSchema.parse(await context.params);
    const task = await getTaskForApi(id);
    return createSuccessResponse(task);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = taskIdParamsSchema.parse(await context.params);
    const body = updateTaskSchema.parse(await request.json());
    const task = await updateTaskForApi(id, body);
    return createSuccessResponse(task);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = taskIdParamsSchema.parse(await context.params);
    const task = await deleteTaskForApi(id);
    return createSuccessResponse(task);
  });
}
