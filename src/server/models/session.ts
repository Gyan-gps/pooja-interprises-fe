import "server-only";

import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface SessionDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  expiresAt: Date;
  isActive: boolean;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 512,
      default: "",
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 64,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "sessions",
  }
);

sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<SessionDocument> =
  (mongoose.models.Session as Model<SessionDocument> | undefined) ??
  mongoose.model<SessionDocument>("Session", sessionSchema);
