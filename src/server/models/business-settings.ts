import "server-only";

import mongoose, { Schema, type Model } from "mongoose";

export interface BusinessSettingsDocument {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  owner: string;
  gstNumber: string;
  contactNumber: string;
  cityState: string;
  financialYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessSettingsSchema = new Schema<BusinessSettingsDocument>(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "Pooja Enterprises",
    },
    owner: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    gstNumber: {
      type: String,
      trim: true,
      maxlength: 32,
      default: "",
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: 32,
      default: "",
    },
    cityState: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    financialYear: {
      type: String,
      trim: true,
      maxlength: 32,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "business_settings",
  }
);

export const BusinessSettings: Model<BusinessSettingsDocument> =
  (mongoose.models.BusinessSettings as
    | Model<BusinessSettingsDocument>
    | undefined) ??
  mongoose.model<BusinessSettingsDocument>(
    "BusinessSettings",
    businessSettingsSchema
  );
