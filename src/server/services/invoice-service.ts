import "server-only";

import { ApiError } from "@/server/errors/api-error";
import { findOrderById, updateOrderStatus } from "@/server/repositories/order-repository";
import {
  createInvoice,
  findInvoiceById,
  findInvoiceByOrderId,
  listInvoices,
  softDeleteInvoice,
  updateInvoice,
} from "@/server/repositories/invoice-repository";
import type { InvoiceStatus } from "@/server/models/enums";
import { calculateInvoiceTotals } from "@/server/utils/invoice-math";
import { serializeInvoice } from "@/server/utils/serializers";
import type { PaginatedResult } from "@/server/utils/pagination";

export async function listInvoicesForApi(filter: {
  page?: number;
  pageSize?: number;
  clientId?: string;
  orderId?: string;
  status?: InvoiceStatus;
}) {
  const result = await listInvoices(filter);
  return mapPaginated(result, serializeInvoice);
}

export async function getInvoiceForApi(invoiceId: string) {
  const invoice = await findInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError("Invoice not found.", {
      statusCode: 404,
      code: "INVOICE_NOT_FOUND",
    });
  }
  return serializeInvoice(invoice);
}

export async function createInvoiceForApi(input: {
  orderId: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
  gstRate: number;
  status?: InvoiceStatus;
  issuedAt?: Date;
  dueAt?: Date;
}) {
  const order = await findOrderById(input.orderId);
  if (!order) {
    throw new ApiError("Order not found.", {
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    });
  }

  const existingInvoice = await findInvoiceByOrderId(order._id);
  if (existingInvoice) {
    throw new ApiError("An active invoice already exists for this order.", {
      statusCode: 409,
      code: "INVOICE_EXISTS",
    });
  }

  const { normalizedLineItems, subtotal, gstAmount, total } =
    calculateInvoiceTotals(input.lineItems, input.gstRate);

  const invoice = await createInvoice({
    orderId: order._id,
    clientId: order.clientId,
    lineItems: normalizedLineItems,
    subtotal,
    gstRate: input.gstRate,
    gstAmount,
    total,
    status: input.status ?? "Draft",
    issuedAt: input.issuedAt,
    dueAt: input.dueAt,
  });

  if (invoice.status === "Issued" || invoice.status === "Paid") {
    await updateOrderStatus(order._id, {
      status: "Pending for Bill",
      assignedStaffName: order.assignedStaffName,
    });
  }

  return serializeInvoice(invoice);
}

export async function updateInvoiceForApi(
  invoiceId: string,
  input: {
    lineItems?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    gstRate?: number;
    status?: InvoiceStatus;
    issuedAt?: Date | null;
    dueAt?: Date | null;
    paidAt?: Date | null;
  }
) {
  const existingInvoice = await findInvoiceById(invoiceId);
  if (!existingInvoice) {
    throw new ApiError("Invoice not found.", {
      statusCode: 404,
      code: "INVOICE_NOT_FOUND",
    });
  }

  const gstRate = input.gstRate ?? existingInvoice.gstRate;
  const lineItemsInput =
    input.lineItems ??
    existingInvoice.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

  const { normalizedLineItems, subtotal, gstAmount, total } =
    calculateInvoiceTotals(lineItemsInput, gstRate);

  const invoice = await updateInvoice(invoiceId, {
    lineItems: normalizedLineItems,
    subtotal,
    gstRate,
    gstAmount,
    total,
    status: input.status,
    issuedAt: input.issuedAt,
    dueAt: input.dueAt,
    paidAt: input.paidAt,
  });

  if (input.status === "Issued" || input.status === "Paid") {
    await updateOrderStatus(invoice.orderId, {
      status: "Pending for Bill",
    });
  }

  return serializeInvoice(invoice);
}

export async function deleteInvoiceForApi(invoiceId: string) {
  const invoice = await softDeleteInvoice(invoiceId);
  return serializeInvoice(invoice);
}

function mapPaginated<T, R>(
  result: PaginatedResult<T>,
  mapper: (item: T) => R
) {
  return {
    items: result.items.map(mapper),
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}
