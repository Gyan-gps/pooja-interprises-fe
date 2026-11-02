import "server-only";

import { connectToDatabase } from "@/server/database/mongodb";
import { Counter } from "@/server/models/counter";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";

export async function getNextSequenceValue(
  sequenceKey: string
): Promise<number> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const counter = await Counter.findOneAndUpdate(
      { key: sequenceKey },
      { $inc: { sequence: 1 } },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      }
    ).exec();

    if (!counter) {
      throw new Error(`Failed to allocate sequence for key: ${sequenceKey}`);
    }

    return counter.sequence;
  });
}

export function formatOrderNumber(year: number, sequence: number): string {
  return `PJE-${year}-${String(sequence).padStart(3, "0")}`;
}

export function formatInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(3, "0")}`;
}

export async function allocateOrderNumber(orderDate: Date): Promise<string> {
  const year = orderDate.getFullYear();
  const sequence = await getNextSequenceValue(`order:${year}`);
  return formatOrderNumber(year, sequence);
}

export async function allocateInvoiceNumber(
  issuedAt: Date = new Date()
): Promise<string> {
  const year = issuedAt.getFullYear();
  const sequence = await getNextSequenceValue(`invoice:${year}`);
  return formatInvoiceNumber(year, sequence);
}
