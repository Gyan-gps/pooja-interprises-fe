import { readStorage, writeStorage } from "../storage";
import { DEFAULT_SETTINGS } from "../data";
import type { BusinessSettings } from "../../types";

const KEY = "settings";

/** Singleton record — same async shape as the list repositories for a consistent swap-to-API story. */
export const settingsRepository = {
  async get(): Promise<BusinessSettings> {
    return readStorage<BusinessSettings>(KEY, DEFAULT_SETTINGS);
  },
  async save(settings: BusinessSettings): Promise<BusinessSettings> {
    writeStorage(KEY, settings);
    return settings;
  },
};
