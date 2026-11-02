import "server-only";

import {
  getBusinessSettings,
  upsertBusinessSettings,
} from "@/server/repositories/business-settings-repository";
import { serializeBusinessSettings } from "@/server/utils/serializers";

export async function getSettingsForApi() {
  const settings = await getBusinessSettings();
  return serializeBusinessSettings(settings);
}

export async function updateSettingsForApi(input: {
  businessName?: string;
  owner?: string;
  gstNumber?: string;
  contactNumber?: string;
  cityState?: string;
  financialYear?: string;
}) {
  const settings = await upsertBusinessSettings(input);
  return serializeBusinessSettings(settings);
}
