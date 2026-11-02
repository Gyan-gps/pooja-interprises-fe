import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import {
  addClientNoteSchema,
  clientIdParamsSchema,
} from "@/lib/validations/client";
import { addClientNoteForApi } from "@/server/services/client-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return handleAdminRequest(request, async (authContext) => {
    const { id } = clientIdParamsSchema.parse(await context.params);
    const body = addClientNoteSchema.parse(await request.json());
    const client = await addClientNoteForApi(id, {
      body: body.body,
      createdBy: authContext.user.id,
    });
    return createSuccessResponse(client, { status: 201 });
  });
}
