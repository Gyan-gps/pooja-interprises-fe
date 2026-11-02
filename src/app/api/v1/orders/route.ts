import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import { parseSearchParams } from "@/lib/validations/common";
import {
  createOrderSchema,
  listOrdersQuerySchema,
} from "@/lib/validations/order";
import {
  createOrderForApi,
  listOrdersForApi,
} from "@/server/services/order-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAdminRequest(request, async () => {
    const query = listOrdersQuerySchema.parse(parseSearchParams(request.url));
    const orders = await listOrdersForApi(query);
    return createSuccessResponse(orders);
  });
}

export async function POST(request: Request) {
  return handleAdminRequest(request, async () => {
    const body = createOrderSchema.parse(await request.json());
    const order = await createOrderForApi(body);
    return createSuccessResponse(order, { status: 201 });
  });
}
