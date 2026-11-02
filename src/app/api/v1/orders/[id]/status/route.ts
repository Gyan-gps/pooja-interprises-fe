import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction } from "@/server/utils/route-handler";
import {
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from "@/lib/validations/order";
import { updateOrderStatusForApi } from "@/server/services/order-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = orderIdParamsSchema.parse(await context.params);
    const body = updateOrderStatusSchema.parse(await request.json());
    const order = await updateOrderStatusForApi(id, body);
    return createSuccessResponse(order);
  });
}
