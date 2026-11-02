import "server-only";

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/server/models/enums";

export interface OrderStatusEventDocument {
  status: OrderStatus;
  at: Date;
}

export interface OrderDeliveryDocument {
  receivedBy: string;
  mobile: string;
  deliveredAt: Date;
  notes: string;
  acknowledgementUrl: string;
}

export interface OrderDocument {
  _id: Types.ObjectId;
  orderNumber: string;
  clientId: Types.ObjectId;
  branchId?: Types.ObjectId;
  branchName: string;
  contactName: string;
  contactMobile: string;
  orderType: string;
  quantity: number;
  paperType: string;
  size: string;
  colorMode: string;
  binding: string;
  notes: string;
  orderDate: Date;
  dueDate: Date | null;
  status: OrderStatus;
  assignedStaffId?: Types.ObjectId;
  assignedStaffName: string;
  readyCount?: number;
  delivery?: OrderDeliveryDocument;
  statusHistory: OrderStatusEventDocument[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderStatusEventSchema = new Schema<OrderStatusEventDocument>(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    at: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const orderDeliverySchema = new Schema<OrderDeliveryDocument>(
  {
    receivedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    mobile: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    deliveredAt: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    acknowledgementUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
    },
    branchName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    contactMobile: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    orderType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    paperType: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    size: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    colorMode: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "Color",
      // Keep open for custom values while documenting known modes.
      validate: {
        validator(value: string) {
          return value.length > 0;
        },
        message: "colorMode is required",
      },
    },
    binding: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    orderDate: {
      type: Date,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
      default: "New",
      index: true,
    },
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      index: true,
    },
    assignedStaffName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "—",
    },
    readyCount: {
      type: Number,
      min: 0,
    },
    delivery: {
      type: orderDeliverySchema,
    },
    statusHistory: {
      type: [orderStatusEventSchema],
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
    collection: "orders",
  }
);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ clientId: 1, orderDate: -1 });
orderSchema.index({ status: 1, dueDate: 1, isActive: 1 });
orderSchema.index({ assignedStaffId: 1, isActive: 1 });
orderSchema.index({ isActive: 1, createdAt: -1 });

export const Order: Model<OrderDocument> =
  (mongoose.models.Order as Model<OrderDocument> | undefined) ??
  mongoose.model<OrderDocument>("Order", orderSchema);
