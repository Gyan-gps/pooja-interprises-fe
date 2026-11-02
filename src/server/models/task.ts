import "server-only";

import mongoose, { Schema, type Model, type Types } from "mongoose";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/server/models/enums";

export interface TaskDocument {
  _id: Types.ObjectId;
  name: string;
  orderId: Types.ObjectId;
  staffId: Types.ObjectId;
  priority: TaskPriority;
  dueDate: Date;
  status: TaskStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      required: true,
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      required: true,
      default: "Pending",
      index: true,
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
    collection: "tasks",
  }
);

taskSchema.index({ staffId: 1, status: 1, isActive: 1 });
taskSchema.index({ orderId: 1, isActive: 1 });

export const Task: Model<TaskDocument> =
  (mongoose.models.Task as Model<TaskDocument> | undefined) ??
  mongoose.model<TaskDocument>("Task", taskSchema);
