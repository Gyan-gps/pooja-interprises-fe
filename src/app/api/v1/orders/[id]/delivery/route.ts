import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction } from "@/server/utils/route-handler";
import {
  orderIdParamsSchema,
  recordOrderDeliverySchema,
} from "@/lib/validations/order";
import { recordOrderDeliveryForApi } from "@/server/services/order-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = orderIdParamsSchema.parse(await context.params);
    const body = recordOrderDeliverySchema.parse(await request.json());
    const order = await recordOrderDeliveryForApi(id, body);
    return createSuccessResponse(order);
  });
}
