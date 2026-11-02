"use client";

import { apiRequest, toQueryString } from "@/lib/api/http";
import { mapApiClientToUi } from "@/lib/api/mappers";
import type { ApiClient, ApiPaginated } from "@/lib/api/types";
import type { Client, CreateClientInput, Order } from "@/types";

const LIST_PAGE_SIZE = 100;

export async function fetchClients(orders: Order[] = []): Promise<Client[]> {
  const data = await apiRequest<ApiPaginated<ApiClient>>(
    `/api/v1/clients${toQueryString({ page: 1, pageSize: LIST_PAGE_SIZE })}`
  );
  return data.items.map((client) => mapApiClientToUi(client, orders));
}

export async function createClientApi(
  input: CreateClientInput,
  orders: Order[] = []
): Promise<Client> {
  const created = await apiRequest<ApiClient>("/api/v1/clients", {
    method: "POST",
    body: JSON.stringify({
      contactName: input.name,
      organizationName: input.org,
      mobile: input.mobile,
      type: input.type,
      status: input.status ?? "Active",
      branches: input.branches?.map((branch) => ({
        name: branch.name,
        mobile: branch.mobile,
        address: branch.address,
      })),
    }),
  });
  return mapApiClientToUi(created, orders);
}

export async function updateClientApi(
  id: string,
  patch: Partial<Client>,
  orders: Order[] = []
): Promise<Client> {
  const updated = await apiRequest<ApiClient>(`/api/v1/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      contactName: patch.name,
      organizationName: patch.org,
      mobile: patch.mobile,
      type: patch.type,
      status: patch.status,
      branches: patch.branches?.map((branch) => ({
        name: branch.name,
        mobile: branch.mobile,
        address: branch.address,
      })),
    }),
  });
  return mapApiClientToUi(updated, orders);
}

export async function deleteClientApi(id: string): Promise<void> {
  await apiRequest(`/api/v1/clients/${id}`, { method: "DELETE" });
}

export async function addClientNoteApi(
  id: string,
  body: string
): Promise<Client> {
  const updated = await apiRequest<ApiClient>(`/api/v1/clients/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return mapApiClientToUi(updated);
}
