import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import { parseSearchParams } from "@/lib/validations/common";
import {
  createStaffSchema,
  listStaffQuerySchema,
} from "@/lib/validations/staff";
import {
  createStaffForApi,
  listStaffForApi,
} from "@/server/services/staff-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAdminRequest(request, async () => {
    const query = listStaffQuerySchema.parse(parseSearchParams(request.url));
    const staff = await listStaffForApi(query);
    return createSuccessResponse(staff);
  });
}

export async function POST(request: Request) {
  return handleAdminRequest(request, async () => {
    const body = createStaffSchema.parse(await request.json());
    const staff = await createStaffForApi(body);
    return createSuccessResponse(staff, { status: 201 });
  });
}
