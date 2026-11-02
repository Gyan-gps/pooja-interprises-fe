import "server-only";

import type { Types } from "mongoose";
import type { MongoFilter } from "@/server/utils/mongo-filter";
import { connectToDatabase } from "@/server/database/mongodb";
import {
  Order,
  type OrderDeliveryDocument,
  type OrderDocument,
  type OrderStatusEventDocument,
} from "@/server/models/order";
import {
  ORDER_STATUSES_EXCLUDED_FROM_OVERDUE,
  type OrderStatus,
} from "@/server/models/enums";
import { ApiError } from "@/server/errors/api-error";
import { allocateOrderNumber } from "@/server/repositories/sequence-repository";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";
import {
  createPaginatedResult,
  normalizePagination,
  type PaginatedResult,
  type PaginationInput,
} from "@/server/utils/pagination";

export interface CreateOrderInput {
  clientId: string | Types.ObjectId;
  branchId?: string | Types.ObjectId;
  branchName?: string;
  contactName?: string;
  contactMobile?: string;
  orderType: string;
  quantity: number;
  paperType?: string;
  size?: string;
  colorMode?: string;
  binding?: string;
  notes?: string;
  orderDate: Date;
  dueDate?: Date | null;
  assignedStaffId?: string | Types.ObjectId;
  assignedStaffName?: string;
}

export interface UpdateOrderInput {
  branchId?: string | Types.ObjectId | null;
  branchName?: string;
  contactName?: string;
  contactMobile?: string;
  orderType?: string;
  quantity?: number;
  paperType?: string;
  size?: string;
  colorMode?: string;
  binding?: string;
  notes?: string;
  dueDate?: Date | null;
  assignedStaffId?: string | Types.ObjectId | null;
  assignedStaffName?: string;
  readyCount?: number | null;
}

export interface ListOrdersFilter extends PaginationInput {
  search?: string;
  clientId?: string | Types.ObjectId;
  status?: OrderStatus;
  assignedStaffId?: string | Types.ObjectId;
  orderType?: string;
  includeInactive?: boolean;
}

export async function listOrders(
  filter: ListOrdersFilter = {}
): Promise<PaginatedResult<OrderDocument>> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const { page, pageSize, skip } = normalizePagination(filter);
    const query: MongoFilter = {};

    if (!filter.includeInactive) {
      query.isActive = true;
    }

    if (filter.clientId) {
      query.clientId = filter.clientId;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.assignedStaffId) {
      query.assignedStaffId = filter.assignedStaffId;
    }

    if (filter.orderType) {
      query.orderType = filter.orderType;
    }

    if (filter.search?.trim()) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      query.$or = [
        { orderNumber: searchRegex },
        { contactName: searchRegex },
        { orderType: searchRegex },
        { assignedStaffName: searchRegex },
        { paperType: searchRegex },
        { size: searchRegex },
        { branchName: searchRegex },
      ];
    }

    const [items, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ orderDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      Order.countDocuments(query).exec(),
    ]);

    return createPaginatedResult(items, totalCount, page, pageSize);
  });
}

export async function findOrderById(
  orderId: string | Types.ObjectId,
  options: { includeInactive?: boolean } = {}
): Promise<OrderDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const query: MongoFilter = { _id: orderId };
    if (!options.includeInactive) {
      query.isActive = true;
    }

    return Order.findOne(query).lean().exec();
  });
}

export async function findOrderByNumber(
  orderNumber: string
): Promise<OrderDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();
    return Order.findOne({
      orderNumber: orderNumber.trim(),
      isActive: true,
    })
      .lean()
      .exec();
  });
}

export async function createOrder(
  input: CreateOrderInput
): Promise<OrderDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const orderNumber = await allocateOrderNumber(input.orderDate);
    const initialStatus: OrderStatus = "New";
    const statusHistory: OrderStatusEventDocument[] = [
      { status: initialStatus, at: input.orderDate },
    ];

    const createdOrder = await Order.create({
      orderNumber,
      clientId: input.clientId,
      branchId: input.branchId,
      branchName: input.branchName?.trim() ?? "",
      contactName: input.contactName?.trim() ?? "",
      contactMobile: input.contactMobile?.trim() ?? "",
      orderType: input.orderType.trim(),
      quantity: input.quantity,
      paperType: input.paperType?.trim() ?? "",
      size: input.size?.trim() ?? "",
      colorMode: input.colorMode?.trim() || "Color",
      binding: input.binding?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      orderDate: input.orderDate,
      dueDate: input.dueDate ?? null,
      status: initialStatus,
      assignedStaffId: input.assignedStaffId,
      assignedStaffName: input.assignedStaffName?.trim() || "—",
      statusHistory,
      isActive: true,
    });

    return createdOrder.toObject();
  });
}

export async function updateOrder(
  orderId: string | Types.ObjectId,
  input: UpdateOrderInput
): Promise<OrderDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatePayload: Record<string, unknown> = {};

    if (input.branchId !== undefined) {
      updatePayload.branchId =
        input.branchId === null ? undefined : input.branchId;
    }
    if (input.branchName !== undefined) {
      updatePayload.branchName = input.branchName.trim();
    }
    if (input.contactName !== undefined) {
      updatePayload.contactName = input.contactName.trim();
    }
    if (input.contactMobile !== undefined) {
      updatePayload.contactMobile = input.contactMobile.trim();
    }
    if (input.orderType !== undefined) {
      updatePayload.orderType = input.orderType.trim();
    }
    if (input.quantity !== undefined) {
      updatePayload.quantity = input.quantity;
    }
    if (input.paperType !== undefined) {
      updatePayload.paperType = input.paperType.trim();
    }
    if (input.size !== undefined) {
      updatePayload.size = input.size.trim();
    }
    if (input.colorMode !== undefined) {
      updatePayload.colorMode = input.colorMode.trim();
    }
    if (input.binding !== undefined) {
      updatePayload.binding = input.binding.trim();
    }
    if (input.notes !== undefined) {
      updatePayload.notes = input.notes.trim();
    }
    if (input.dueDate !== undefined) {
      updatePayload.dueDate = input.dueDate;
    }
    if (input.assignedStaffId !== undefined) {
      updatePayload.assignedStaffId =
        input.assignedStaffId === null ? undefined : input.assignedStaffId;
    }
    if (input.assignedStaffName !== undefined) {
      updatePayload.assignedStaffName =
        input.assignedStaffName.trim() || "—";
    }
    if (input.readyCount !== undefined) {
      updatePayload.readyCount =
        input.readyCount === null ? undefined : input.readyCount;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, isActive: true },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedOrder) {
      throw new ApiError("Order not found.", {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    return updatedOrder;
  });
}

export async function updateOrderStatus(
  orderId: string | Types.ObjectId,
  input: {
    status: OrderStatus;
    assignedStaffId?: string | Types.ObjectId;
    assignedStaffName?: string;
    readyCount?: number;
    changedAt?: Date;
  }
): Promise<OrderDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const existingOrder = await Order.findOne({
      _id: orderId,
      isActive: true,
    }).exec();

    if (!existingOrder) {
      throw new ApiError("Order not found.", {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    if (existingOrder.status !== input.status) {
      existingOrder.status = input.status;
      existingOrder.statusHistory.push({
        status: input.status,
        at: input.changedAt ?? new Date(),
      });
    }

    if (input.assignedStaffId !== undefined) {
      existingOrder.assignedStaffId =
        input.assignedStaffId as Types.ObjectId;
    }

    if (input.assignedStaffName !== undefined) {
      existingOrder.assignedStaffName =
        input.assignedStaffName.trim() || "—";
    }

    if (input.readyCount !== undefined) {
      existingOrder.readyCount = input.readyCount;
    }

    await existingOrder.save();
    return existingOrder.toObject();
  });
}

export async function recordOrderDelivery(
  orderId: string | Types.ObjectId,
  delivery: OrderDeliveryDocument
): Promise<OrderDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const existingOrder = await Order.findOne({
      _id: orderId,
      isActive: true,
    }).exec();

    if (!existingOrder) {
      throw new ApiError("Order not found.", {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    existingOrder.delivery = delivery;
    existingOrder.status = "Delivered";
    existingOrder.statusHistory.push({
      status: "Delivered",
      at: delivery.deliveredAt,
    });

    await existingOrder.save();
    return existingOrder.toObject();
  });
}

/**
 * Returns active non-terminal orders whose due date has passed.
 * Business services decide whether/how to flip status to Overdue.
 */
export async function listOrdersPastDue(
  referenceDate: Date
): Promise<OrderDocument[]> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    return Order.find({
      isActive: true,
      dueDate: { $ne: null, $lt: referenceDate },
      status: { $nin: [...ORDER_STATUSES_EXCLUDED_FROM_OVERDUE, "Overdue"] },
    })
      .lean()
      .exec();
  });
}

export async function softDeleteOrder(
  orderId: string | Types.ObjectId
): Promise<OrderDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    )
      .lean()
      .exec();

    if (!updatedOrder) {
      throw new ApiError("Order not found.", {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    return updatedOrder;
  });
}
