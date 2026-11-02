import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import { parseSearchParams } from "@/lib/validations/common";
import {
  createInvoiceSchema,
  listInvoicesQuerySchema,
} from "@/lib/validations/invoice";
import {
  createInvoiceForApi,
  listInvoicesForApi,
} from "@/server/services/invoice-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAdminRequest(request, async () => {
    const query = listInvoicesQuerySchema.parse(parseSearchParams(request.url));
    const invoices = await listInvoicesForApi(query);
    return createSuccessResponse(invoices);
  });
}

export async function POST(request: Request) {
  return handleAdminRequest(request, async () => {
    const body = createInvoiceSchema.parse(await request.json());
    const invoice = await createInvoiceForApi(body);
    return createSuccessResponse(invoice, { status: 201 });
  });
}
