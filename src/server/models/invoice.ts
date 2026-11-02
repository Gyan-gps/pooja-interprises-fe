import "server-only";

import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/server/models/enums";

export interface InvoiceLineItemDocument {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDocument {
  _id: Types.ObjectId;
  invoiceNumber: string;
  orderId: Types.ObjectId;
  clientId: Types.ObjectId;
  lineItems: InvoiceLineItemDocument[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status: InvoiceStatus;
  issuedAt?: Date;
  dueAt?: Date;
  paidAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceLineItemSchema = new Schema<InvoiceLineItemDocument>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    lineItems: {
      type: [invoiceLineItemSchema],
      default: [],
      validate: {
        validator(items: InvoiceLineItemDocument[]) {
          return items.length > 0;
        },
        message: "At least one line item is required",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    gstRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: INVOICE_STATUSES,
      required: true,
      default: "Draft",
      index: true,
    },
    issuedAt: {
      type: Date,
    },
    dueAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
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
    collection: "invoices",
  }
);

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index(
  { orderId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);
invoiceSchema.index({ clientId: 1, status: 1, isActive: 1 });

export const Invoice: Model<InvoiceDocument> =
  (mongoose.models.Invoice as Model<InvoiceDocument> | undefined) ??
  mongoose.model<InvoiceDocument>("Invoice", invoiceSchema);
