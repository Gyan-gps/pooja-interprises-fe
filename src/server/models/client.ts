import "server-only";

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { CLIENT_STATUSES, type ClientStatus } from "@/server/models/enums";

export interface ClientBranchDocument {
  _id: Types.ObjectId;
  name: string;
  mobile: string;
  address?: string;
}

export interface ClientNoteDocument {
  _id: Types.ObjectId;
  body: string;
  createdAt: Date;
  createdBy?: Types.ObjectId;
}

export interface ClientDocument {
  _id: Types.ObjectId;
  contactName: string;
  organizationName: string;
  mobile: string;
  type: string;
  status: ClientStatus;
  branches: ClientBranchDocument[];
  notes: ClientNoteDocument[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clientBranchSchema = new Schema<ClientBranchDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: true }
);

const clientNoteSchema = new Schema<ClientNoteDocument>(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: true }
);

const clientSchema = new Schema<ClientDocument>(
  {
    contactName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "School",
      index: true,
    },
    status: {
      type: String,
      enum: CLIENT_STATUSES,
      required: true,
      default: "Active",
      index: true,
    },
    branches: {
      type: [clientBranchSchema],
      default: [],
    },
    notes: {
      type: [clientNoteSchema],
      default: [],
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
    collection: "clients",
  }
);

clientSchema.index(
  { organizationName: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

clientSchema.index({ status: 1, isActive: 1 });
clientSchema.index({ type: 1, isActive: 1 });

export const Client: Model<ClientDocument> =
  (mongoose.models.Client as Model<ClientDocument> | undefined) ??
  mongoose.model<ClientDocument>("Client", clientSchema);
