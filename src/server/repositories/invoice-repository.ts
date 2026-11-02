import "server-only";

import type { Types } from "mongoose";
import type { MongoFilter } from "@/server/utils/mongo-filter";
import { connectToDatabase } from "@/server/database/mongodb";
import {
  Invoice,
  type InvoiceDocument,
  type InvoiceLineItemDocument,
} from "@/server/models/invoice";
import type { InvoiceStatus } from "@/server/models/enums";
import { ApiError } from "@/server/errors/api-error";
import { allocateInvoiceNumber } from "@/server/repositories/sequence-repository";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";
import {
  createPaginatedResult,
  normalizePagination,
  type PaginatedResult,
  type PaginationInput,
} from "@/server/utils/pagination";

export interface CreateInvoiceInput {
  orderId: string | Types.ObjectId;
  clientId: string | Types.ObjectId;
  lineItems: InvoiceLineItemDocument[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status?: InvoiceStatus;
  issuedAt?: Date;
  dueAt?: Date;
}

export interface UpdateInvoiceInput {
  lineItems?: InvoiceLineItemDocument[];
  subtotal?: number;
  gstRate?: number;
  gstAmount?: number;
  total?: number;
  status?: InvoiceStatus;
  issuedAt?: Date | null;
  dueAt?: Date | null;
  paidAt?: Date | null;
}

export interface ListInvoicesFilter extends PaginationInput {
  clientId?: string | Types.ObjectId;
  orderId?: string | Types.ObjectId;
  status?: InvoiceStatus;
  includeInactive?: boolean;
}

export async function listInvoices(
  filter: ListInvoicesFilter = {}
): Promise<PaginatedResult<InvoiceDocument>> {
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

    if (filter.orderId) {
      query.orderId = filter.orderId;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    const [items, totalCount] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      Invoice.countDocuments(query).exec(),
    ]);

    return createPaginatedResult(items, totalCount, page, pageSize);
  });
}

export async function findInvoiceById(
  invoiceId: string | Types.ObjectId,
  options: { includeInactive?: boolean } = {}
): Promise<InvoiceDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const query: MongoFilter = { _id: invoiceId };
    if (!options.includeInactive) {
      query.isActive = true;
    }

    return Invoice.findOne(query).lean().exec();
  });
}

export async function findInvoiceByOrderId(
  orderId: string | Types.ObjectId
): Promise<InvoiceDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();
    return Invoice.findOne({ orderId, isActive: true }).lean().exec();
  });
}

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<InvoiceDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const invoiceNumber = await allocateInvoiceNumber(
      input.issuedAt ?? new Date()
    );

    const createdInvoice = await Invoice.create({
      invoiceNumber,
      orderId: input.orderId,
      clientId: input.clientId,
      lineItems: input.lineItems,
      subtotal: input.subtotal,
      gstRate: input.gstRate,
      gstAmount: input.gstAmount,
      total: input.total,
      status: input.status ?? "Draft",
      issuedAt: input.issuedAt,
      dueAt: input.dueAt,
      isActive: true,
    });

    return createdInvoice.toObject();
  });
}

export async function updateInvoice(
  invoiceId: string | Types.ObjectId,
  input: UpdateInvoiceInput
): Promise<InvoiceDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatePayload: Record<string, unknown> = {};

    if (input.lineItems !== undefined) {
      updatePayload.lineItems = input.lineItems;
    }
    if (input.subtotal !== undefined) {
      updatePayload.subtotal = input.subtotal;
    }
    if (input.gstRate !== undefined) {
      updatePayload.gstRate = input.gstRate;
    }
    if (input.gstAmount !== undefined) {
      updatePayload.gstAmount = input.gstAmount;
    }
    if (input.total !== undefined) {
      updatePayload.total = input.total;
    }
    if (input.status !== undefined) {
      updatePayload.status = input.status;
    }
    if (input.issuedAt !== undefined) {
      updatePayload.issuedAt = input.issuedAt;
    }
    if (input.dueAt !== undefined) {
      updatePayload.dueAt = input.dueAt;
    }
    if (input.paidAt !== undefined) {
      updatePayload.paidAt = input.paidAt;
    }

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, isActive: true },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedInvoice) {
      throw new ApiError("Invoice not found.", {
        statusCode: 404,
        code: "INVOICE_NOT_FOUND",
      });
    }

    return updatedInvoice;
  });
}

export async function softDeleteInvoice(
  invoiceId: string | Types.ObjectId
): Promise<InvoiceDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    )
      .lean()
      .exec();

    if (!updatedInvoice) {
      throw new ApiError("Invoice not found.", {
        statusCode: 404,
        code: "INVOICE_NOT_FOUND",
      });
    }

    return updatedInvoice;
  });
}
