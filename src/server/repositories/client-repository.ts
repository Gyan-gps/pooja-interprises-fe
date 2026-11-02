import "server-only";

import type { Types } from "mongoose";
import type { MongoFilter } from "@/server/utils/mongo-filter";
import { connectToDatabase } from "@/server/database/mongodb";
import {
  Client,
  type ClientBranchDocument,
  type ClientDocument,
  type ClientNoteDocument,
} from "@/server/models/client";
import type { ClientStatus } from "@/server/models/enums";
import { ApiError } from "@/server/errors/api-error";
import { withMongoErrorMapping } from "@/server/utils/mongo-error";
import {
  createPaginatedResult,
  normalizePagination,
  type PaginatedResult,
  type PaginationInput,
} from "@/server/utils/pagination";

export interface ClientBranchInput {
  name: string;
  mobile: string;
  address?: string;
}

export interface CreateClientInput {
  contactName: string;
  organizationName: string;
  mobile: string;
  type: string;
  status?: ClientStatus;
  branches?: ClientBranchInput[];
}

export type UpdateClientInput = Partial<
  Omit<CreateClientInput, "branches">
> & {
  branches?: ClientBranchInput[];
};

export interface ListClientsFilter extends PaginationInput {
  search?: string;
  type?: string;
  status?: ClientStatus;
  includeInactive?: boolean;
}

export async function listClients(
  filter: ListClientsFilter = {}
): Promise<PaginatedResult<ClientDocument>> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const { page, pageSize, skip } = normalizePagination(filter);
    const query: MongoFilter = {};

    if (!filter.includeInactive) {
      query.isActive = true;
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search?.trim()) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      query.$or = [
        { contactName: searchRegex },
        { organizationName: searchRegex },
        { mobile: searchRegex },
        { "branches.name": searchRegex },
        { "branches.mobile": searchRegex },
      ];
    }

    const [items, totalCount] = await Promise.all([
      Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      Client.countDocuments(query).exec(),
    ]);

    return createPaginatedResult(items, totalCount, page, pageSize);
  });
}

export async function findClientById(
  clientId: string | Types.ObjectId,
  options: { includeInactive?: boolean } = {}
): Promise<ClientDocument | null> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const query: MongoFilter = { _id: clientId };
    if (!options.includeInactive) {
      query.isActive = true;
    }

    return Client.findOne(query).lean().exec();
  });
}

export async function createClient(
  input: CreateClientInput
): Promise<ClientDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const createdClient = await Client.create({
      contactName: input.contactName.trim(),
      organizationName: input.organizationName.trim(),
      mobile: input.mobile.trim(),
      type: input.type.trim(),
      status: input.status ?? "Active",
      branches: input.branches ?? [],
      notes: [],
      isActive: true,
    });

    return createdClient.toObject();
  });
}

export async function updateClient(
  clientId: string | Types.ObjectId,
  input: UpdateClientInput
): Promise<ClientDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatePayload: Record<string, unknown> = {};

    if (input.contactName !== undefined) {
      updatePayload.contactName = input.contactName.trim();
    }
    if (input.organizationName !== undefined) {
      updatePayload.organizationName = input.organizationName.trim();
    }
    if (input.mobile !== undefined) {
      updatePayload.mobile = input.mobile.trim();
    }
    if (input.type !== undefined) {
      updatePayload.type = input.type.trim();
    }
    if (input.status !== undefined) {
      updatePayload.status = input.status;
    }
    if (input.branches !== undefined) {
      updatePayload.branches = input.branches;
    }

    const updatedClient = await Client.findOneAndUpdate(
      { _id: clientId, isActive: true },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedClient) {
      throw new ApiError("Client not found.", {
        statusCode: 404,
        code: "CLIENT_NOT_FOUND",
      });
    }

    return updatedClient;
  });
}

export async function addClientNote(
  clientId: string | Types.ObjectId,
  note: {
    body: string;
    createdBy?: string | Types.ObjectId;
  }
): Promise<ClientDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const noteDocument: Partial<ClientNoteDocument> = {
      body: note.body.trim(),
      createdAt: new Date(),
      ...(note.createdBy ? { createdBy: note.createdBy as Types.ObjectId } : {}),
    };

    const updatedClient = await Client.findOneAndUpdate(
      { _id: clientId, isActive: true },
      { $push: { notes: noteDocument } },
      { returnDocument: 'after', runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedClient) {
      throw new ApiError("Client not found.", {
        statusCode: 404,
        code: "CLIENT_NOT_FOUND",
      });
    }

    return updatedClient;
  });
}

export async function softDeleteClient(
  clientId: string | Types.ObjectId
): Promise<ClientDocument> {
  return withMongoErrorMapping(async () => {
    await connectToDatabase();

    const updatedClient = await Client.findOneAndUpdate(
      { _id: clientId, isActive: true },
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    )
      .lean()
      .exec();

    if (!updatedClient) {
      throw new ApiError("Client not found.", {
        statusCode: 404,
        code: "CLIENT_NOT_FOUND",
      });
    }

    return updatedClient;
  });
}

export type { ClientBranchDocument };
