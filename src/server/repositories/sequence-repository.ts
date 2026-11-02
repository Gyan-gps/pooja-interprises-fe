import "server-only";

import { connectToDatabase } from "@/server/database/mongodb";
import { Counter } from "@/server/models/counter";
import {
  formatInvoiceNumber,
  formatOrderNumber,
} from "@/server/utils/document-numbers";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";

export { formatInvoiceNumber, formatOrderNumber };

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
