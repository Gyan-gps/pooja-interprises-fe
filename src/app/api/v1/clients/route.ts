import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import { parseSearchParams } from "@/lib/validations/common";
import {
  createClientSchema,
  listClientsQuerySchema,
} from "@/lib/validations/client";
import {
  createClientForApi,
  listClientsForApi,
} from "@/server/services/client-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAdminRequest(request, async () => {
    const query = listClientsQuerySchema.parse(parseSearchParams(request.url));
    const clients = await listClientsForApi(query);
    return createSuccessResponse(clients);
  });
}

export async function POST(request: Request) {
  return handleAdminRequest(request, async () => {
    const body = createClientSchema.parse(await request.json());
    const client = await createClientForApi(body);
    return createSuccessResponse(client, { status: 201 });
  });
}
