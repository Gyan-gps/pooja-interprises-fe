import "server-only";

import { connectToDatabase } from "@/server/database/mongodb";
import {
  BusinessSettings,
  type BusinessSettingsDocument,
} from "@/server/models/business-settings";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";

export type UpsertBusinessSettingsInput = Partial<
  Pick<
    BusinessSettingsDocument,
    | "businessName"
    | "owner"
    | "gstNumber"
    | "contactNumber"
    | "cityState"
    | "financialYear"
  >
>;

export async function getBusinessSettings(): Promise<BusinessSettingsDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();
    return BusinessSettings.findOne().lean().exec();
  });
}

export async function upsertBusinessSettings(
  input: UpsertBusinessSettingsInput
): Promise<BusinessSettingsDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedSettings = await BusinessSettings.findOneAndUpdate(
      {},
      { $set: input },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    )
      .lean()
      .exec();

    if (!updatedSettings) {
      throw new Error("Failed to upsert business settings.");
    }

    return updatedSettings;
  });
}
