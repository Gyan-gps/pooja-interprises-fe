import "server-only";

import mongoose, { Schema, type Model } from "mongoose";
import { STAFF_ROLES, type StaffRole } from "@/server/models/enums";

export interface StaffDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: StaffRole;
  initials: string;
  avatarColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<StaffDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    role: {
      type: String,
      enum: STAFF_ROLES,
      required: true,
      default: "Designer",
      index: true,
    },
    initials: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4,
    },
    avatarColor: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
      default: "bg-slate-500",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "staff",
  }
);

staffSchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

export const Staff: Model<StaffDocument> =
  (mongoose.models.Staff as Model<StaffDocument> | undefined) ??
  mongoose.model<StaffDocument>("Staff", staffSchema);
