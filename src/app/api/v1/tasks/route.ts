import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import { parseSearchParams } from "@/lib/validations/common";
import {
  createTaskSchema,
  listTasksQuerySchema,
} from "@/lib/validations/task";
import {
  createTaskForApi,
  listTasksForApi,
} from "@/server/services/task-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAdminRequest(request, async () => {
    const query = listTasksQuerySchema.parse(parseSearchParams(request.url));
    const tasks = await listTasksForApi(query);
    return createSuccessResponse(tasks);
  });
}

export async function POST(request: Request) {
  return handleAdminRequest(request, async () => {
    const body = createTaskSchema.parse(await request.json());
    const task = await createTaskForApi(body);
    return createSuccessResponse(task, { status: 201 });
  });
}
