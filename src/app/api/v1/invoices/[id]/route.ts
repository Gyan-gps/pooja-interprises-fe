import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminAction } from "@/server/utils/route-handler";
import {
  invoiceIdParamsSchema,
  updateInvoiceSchema,
} from "@/lib/validations/invoice";
import {
  deleteInvoiceForApi,
  getInvoiceForApi,
  updateInvoiceForApi,
} from "@/server/services/invoice-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = invoiceIdParamsSchema.parse(await context.params);
    const invoice = await getInvoiceForApi(id);
    return createSuccessResponse(invoice);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = invoiceIdParamsSchema.parse(await context.params);
    const body = updateInvoiceSchema.parse(await request.json());
    const invoice = await updateInvoiceForApi(id, body);
    return createSuccessResponse(invoice);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleAdminAction(async () => {
    const { id } = invoiceIdParamsSchema.parse(await context.params);
    const invoice = await deleteInvoiceForApi(id);
    return createSuccessResponse(invoice);
  });
}
