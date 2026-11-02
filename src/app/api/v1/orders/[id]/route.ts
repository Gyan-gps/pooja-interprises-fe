import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction } from "@/server/utils/route-handler";
import {
  orderIdParamsSchema,
  updateOrderSchema,
} from "@/lib/validations/order";
import {
  deleteOrderForApi,
  getOrderForApi,
  updateOrderForApi,
} from "@/server/services/order-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = orderIdParamsSchema.parse(await context.params);
    const order = await getOrderForApi(id);
    return createSuccessResponse(order);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = orderIdParamsSchema.parse(await context.params);
    const body = updateOrderSchema.parse(await request.json());
    const order = await updateOrderForApi(id, body);
    return createSuccessResponse(order);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = orderIdParamsSchema.parse(await context.params);
    const order = await deleteOrderForApi(id);
    return createSuccessResponse(order);
  });
}
