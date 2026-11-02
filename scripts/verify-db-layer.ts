/**
 * One-off Phase 3 smoke test for models/repositories.
 * Creates temporary documents, asserts behavior, then soft-deletes/removes them.
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/server/database/mongodb";
import { createClient, softDeleteClient, findClientById } from "../src/server/repositories/client-repository";
import { createStaff, softDeleteStaff } from "../src/server/repositories/staff-repository";
import { createOrder, softDeleteOrder, findOrderById } from "../src/server/repositories/order-repository";
import { createTask, softDeleteTask } from "../src/server/repositories/task-repository";
import { createInvoice, softDeleteInvoice } from "../src/server/repositories/invoice-repository";
import { upsertBusinessSettings, getBusinessSettings } from "../src/server/repositories/business-settings-repository";
import { Client } from "../src/server/models/client";
import { Staff } from "../src/server/models/staff";
import { Order } from "../src/server/models/order";
import { Task } from "../src/server/models/task";
import { Invoice } from "../src/server/models/invoice";
import { Counter } from "../src/server/models/counter";

function loadEnvFile(): void {
  const envFile = readFileSync(".env", "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  loadEnvFile();

  const marker = `phase3-verify-${Date.now()}`;

  await connectToDatabase();

  await Client.syncIndexes();
  await Staff.syncIndexes();
  await Order.syncIndexes();
  await Task.syncIndexes();
  await Invoice.syncIndexes();
  await Counter.syncIndexes();

  const previousSettings = await getBusinessSettings();
  const settings = await upsertBusinessSettings({
    businessName: "Pooja Enterprises",
    owner: "Verify Owner",
    gstNumber: "27ABCDE1234F1Z5",
    contactNumber: "+91 90000 00000",
    cityState: "Pune, Maharashtra",
    financialYear: "2026-27",
  });
  assert(settings.businessName === "Pooja Enterprises", "settings upsert failed");
  assert(await getBusinessSettings(), "settings read failed");

  // Restore prior settings so verification is not a lasting write.
  if (previousSettings) {
    await upsertBusinessSettings({
      businessName: previousSettings.businessName,
      owner: previousSettings.owner,
      gstNumber: previousSettings.gstNumber,
      contactNumber: previousSettings.contactNumber,
      cityState: previousSettings.cityState,
      financialYear: previousSettings.financialYear,
    });
  }

  const client = await createClient({
    contactName: "Verify Contact",
    organizationName: marker,
    mobile: "9000000000",
    type: "Corporate",
    branches: [{ name: "Main", mobile: "9000000001", address: "Pune" }],
  });
  assert(client.organizationName === marker, "client create failed");

  const staff = await createStaff({
    name: `${marker}-staff`,
    role: "Designer",
    initials: "VV",
  });

  const order = await createOrder({
    clientId: client._id,
    orderType: "Custom Print",
    quantity: 10,
    orderDate: new Date("2026-11-02T00:00:00.000Z"),
    dueDate: new Date("2026-11-10T00:00:00.000Z"),
    assignedStaffId: staff._id,
    assignedStaffName: staff.name,
  });
  assert(/^PJE-2026-\d{3,}$/.test(order.orderNumber), `unexpected order number: ${order.orderNumber}`);

  const task = await createTask({
    name: `${marker}-task`,
    orderId: order._id,
    staffId: staff._id,
    dueDate: new Date("2026-11-05T00:00:00.000Z"),
  });

  const invoice = await createInvoice({
    orderId: order._id,
    clientId: client._id,
    lineItems: [
      {
        description: "Custom Print",
        quantity: 10,
        unitPrice: 5,
        amount: 50,
      },
    ],
    subtotal: 50,
    gstRate: 18,
    gstAmount: 9,
    total: 59,
  });
  assert(/^INV-\d{4}-\d{3,}$/.test(invoice.invoiceNumber), "unexpected invoice number");

  await softDeleteInvoice(invoice._id);
  await softDeleteTask(task._id);
  await softDeleteOrder(order._id);
  await softDeleteStaff(staff._id);
  await softDeleteClient(client._id);

  assert(
    (await findClientById(client._id)) === null,
    "soft-deleted client should be hidden by default"
  );
  assert(
    (await findOrderById(order._id)) === null,
    "soft-deleted order should be hidden by default"
  );

  // Hard-remove verification docs so we leave no permanent seed/test data.
  await Invoice.deleteOne({ _id: invoice._id });
  await Task.deleteOne({ _id: task._id });
  await Order.deleteOne({ _id: order._id });
  await Staff.deleteOne({ _id: staff._id });
  await Client.deleteOne({ _id: client._id });

  console.log("verify-db-layer: ok");
  console.log(`orderNumber=${order.orderNumber}`);
  console.log(`invoiceNumber=${invoice.invoiceNumber}`);
}

main()
  .catch((error) => {
    console.error("verify-db-layer: failed");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
