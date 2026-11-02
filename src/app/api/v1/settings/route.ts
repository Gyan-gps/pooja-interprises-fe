import { createSuccessResponse } from "@/server/utils/api-response";
import { handleAdminRequest } from "@/server/utils/route-handler";
import { updateBusinessSettingsSchema } from "@/lib/validations/settings";
import {
  getSettingsForApi,
  updateSettingsForApi,
} from "@/server/services/settings-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleAdminRequest(request, async () => {
    const settings = await getSettingsForApi();
    return createSuccessResponse(settings);
  });
}

export async function PUT(request: Request) {
  return handleAdminRequest(request, async () => {
    const body = updateBusinessSettingsSchema.parse(await request.json());
    const settings = await updateSettingsForApi(body);
    return createSuccessResponse(settings);
  });
}
