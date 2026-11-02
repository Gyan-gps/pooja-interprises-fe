import "server-only";

import type { ClientDocument } from "@/server/models/client";
import type { StaffDocument } from "@/server/models/staff";
import type { OrderDocument } from "@/server/models/order";
import type { TaskDocument } from "@/server/models/task";
import type { InvoiceDocument } from "@/server/models/invoice";
import type { BusinessSettingsDocument } from "@/server/models/business-settings";

export function serializeClient(client: ClientDocument) {
  return {
    id: client._id.toString(),
    contactName: client.contactName,
    organizationName: client.organizationName,
    mobile: client.mobile,
    type: client.type,
    status: client.status,
    branches: (client.branches ?? []).map((branch) => ({
      id: branch._id.toString(),
      name: branch.name,
      mobile: branch.mobile,
      address: branch.address ?? "",
    })),
    notes: (client.notes ?? []).map((note) => ({
      id: note._id.toString(),
      body: note.body,
      createdAt: note.createdAt.toISOString(),
      createdBy: note.createdBy?.toString(),
    })),
    isActive: client.isActive,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

export function serializeStaff(staff: StaffDocument) {
  return {
    id: staff._id.toString(),
    name: staff.name,
    role: staff.role,
    initials: staff.initials,
    avatarColor: staff.avatarColor,
    isActive: staff.isActive,
    createdAt: staff.createdAt.toISOString(),
    updatedAt: staff.updatedAt.toISOString(),
  };
}

export function serializeOrder(order: OrderDocument) {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    clientId: order.clientId.toString(),
    branchId: order.branchId?.toString(),
    branchName: order.branchName,
    contactName: order.contactName,
    contactMobile: order.contactMobile,
    orderType: order.orderType,
    quantity: order.quantity,
    paperType: order.paperType,
    size: order.size,
    colorMode: order.colorMode,
    binding: order.binding,
    notes: order.notes,
    orderDate: order.orderDate.toISOString(),
    dueDate: order.dueDate ? order.dueDate.toISOString() : null,
    status: order.status,
    assignedStaffId: order.assignedStaffId?.toString(),
    assignedStaffName: order.assignedStaffName,
    readyCount: order.readyCount,
    delivery: order.delivery
      ? {
          receivedBy: order.delivery.receivedBy,
          mobile: order.delivery.mobile,
          deliveredAt: order.delivery.deliveredAt.toISOString(),
          notes: order.delivery.notes,
          acknowledgementUrl: order.delivery.acknowledgementUrl,
        }
      : null,
    statusHistory: (order.statusHistory ?? []).map((event) => ({
      status: event.status,
      at: event.at.toISOString(),
    })),
    isActive: order.isActive,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function serializeTask(task: TaskDocument) {
  return {
    id: task._id.toString(),
    name: task.name,
    orderId: task.orderId.toString(),
    staffId: task.staffId.toString(),
    priority: task.priority,
    dueDate: task.dueDate.toISOString(),
    status: task.status,
    isActive: task.isActive,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function serializeInvoice(invoice: InvoiceDocument) {
  return {
    id: invoice._id.toString(),
    invoiceNumber: invoice.invoiceNumber,
    orderId: invoice.orderId.toString(),
    clientId: invoice.clientId.toString(),
    lineItems: invoice.lineItems,
    subtotal: invoice.subtotal,
    gstRate: invoice.gstRate,
    gstAmount: invoice.gstAmount,
    total: invoice.total,
    status: invoice.status,
    issuedAt: invoice.issuedAt?.toISOString() ?? null,
    dueAt: invoice.dueAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    isActive: invoice.isActive,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

export function serializeBusinessSettings(
  settings: BusinessSettingsDocument | null
) {
  if (!settings) {
    return {
      businessName: "Pooja Enterprises",
      owner: "",
      gstNumber: "",
      contactNumber: "",
      cityState: "",
      financialYear: "",
    };
  }

  return {
    id: settings._id.toString(),
    businessName: settings.businessName,
    owner: settings.owner,
    gstNumber: settings.gstNumber,
    contactNumber: settings.contactNumber,
    cityState: settings.cityState,
    financialYear: settings.financialYear,
    updatedAt: settings.updatedAt.toISOString(),
  };
}
