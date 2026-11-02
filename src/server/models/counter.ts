import "server-only";

import mongoose, { Schema, type Model } from "mongoose";

export interface CounterDocument {
  _id: mongoose.Types.ObjectId;
  key: string;
  sequence: number;
}

const counterSchema = new Schema<CounterDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: false,
    collection: "counters",
  }
);

export const Counter: Model<CounterDocument> =
  (mongoose.models.Counter as Model<CounterDocument> | undefined) ??
  mongoose.model<CounterDocument>("Counter", counterSchema);
