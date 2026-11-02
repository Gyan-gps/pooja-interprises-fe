import "server-only";

import { ApiError } from "@/server/errors/api-error";
import {
  addClientNote,
  createClient,
  findClientById,
  listClients,
  softDeleteClient,
  updateClient,
} from "@/server/repositories/client-repository";
import { serializeClient } from "@/server/utils/serializers";
import type { PaginatedResult } from "@/server/utils/pagination";

export async function listClientsForApi(filter: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: "Active" | "Inactive";
}) {
  const result = await listClients(filter);
  return mapPaginated(result, serializeClient);
}

export async function getClientForApi(clientId: string) {
  const client = await findClientById(clientId);
  if (!client) {
    throw new ApiError("Client not found.", {
      statusCode: 404,
      code: "CLIENT_NOT_FOUND",
    });
  }
  return serializeClient(client);
}

export async function createClientForApi(input: {
  contactName: string;
  organizationName: string;
  mobile: string;
  type: string;
  status?: "Active" | "Inactive";
  branches?: Array<{ name: string; mobile: string; address?: string }>;
}) {
  const client = await createClient(input);
  return serializeClient(client);
}

export async function updateClientForApi(
  clientId: string,
  input: {
    contactName?: string;
    organizationName?: string;
    mobile?: string;
    type?: string;
    status?: "Active" | "Inactive";
    branches?: Array<{ name: string; mobile: string; address?: string }>;
  }
) {
  const client = await updateClient(clientId, input);
  return serializeClient(client);
}

export async function addClientNoteForApi(
  clientId: string,
  input: { body: string; createdBy?: string }
) {
  const client = await addClientNote(clientId, input);
  return serializeClient(client);
}

export async function deleteClientForApi(clientId: string) {
  const client = await softDeleteClient(clientId);
  return serializeClient(client);
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
