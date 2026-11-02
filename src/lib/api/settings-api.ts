"use client";

import { apiRequest } from "@/lib/api/http";
import { mapApiSettingsToUi } from "@/lib/api/mappers";
import type { ApiSettings } from "@/lib/api/types";
import type { BusinessSettings } from "@/types";

export async function fetchSettings(): Promise<BusinessSettings> {
  const settings = await apiRequest<ApiSettings>("/api/v1/settings");
  return mapApiSettingsToUi(settings);
}

export async function saveSettingsApi(
  settings: BusinessSettings
): Promise<BusinessSettings> {
  const saved = await apiRequest<ApiSettings>("/api/v1/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  return mapApiSettingsToUi(saved);
}
