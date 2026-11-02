import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction } from "@/server/utils/route-handler";
import {
  clientIdParamsSchema,
  updateClientSchema,
} from "@/lib/validations/client";
import {
  deleteClientForApi,
  getClientForApi,
  updateClientForApi,
} from "@/server/services/client-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = clientIdParamsSchema.parse(await context.params);
    const client = await getClientForApi(id);
    return createSuccessResponse(client);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = clientIdParamsSchema.parse(await context.params);
    const body = updateClientSchema.parse(await request.json());
    const client = await updateClientForApi(id, body);
    return createSuccessResponse(client);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = clientIdParamsSchema.parse(await context.params);
    const client = await deleteClientForApi(id);
    return createSuccessResponse(client);
  });
}
