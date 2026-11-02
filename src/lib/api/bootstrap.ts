"use client";

import { apiRequest, toQueryString } from "@/lib/api/http";
import {
  mapApiClientToUi,
  mapApiOrderToUi,
  mapApiSettingsToUi,
  mapApiStaffToUi,
  mapApiTaskToUi,
} from "@/lib/api/mappers";
import type {
  ApiClient,
  ApiOrder,
  ApiPaginated,
  ApiSettings,
  ApiStaff,
  ApiTask,
} from "@/lib/api/types";
import type {
  BusinessSettings,
  Client,
  Order,
  StaffMember,
  Task,
} from "@/types";

const LIST_PAGE_SIZE = 100;

export interface DashboardBootstrapData {
  clients: Client[];
  orders: Order[];
  staff: StaffMember[];
  tasks: Task[];
  settings: BusinessSettings;
}

export async function loadDashboardData(): Promise<DashboardBootstrapData> {
  const query = toQueryString({ page: 1, pageSize: LIST_PAGE_SIZE });

  const [clientsPage, ordersPage, tasksPage, staffPage, settings] =
    await Promise.all([
      apiRequest<ApiPaginated<ApiClient>>(`/api/v1/clients${query}`),
      apiRequest<ApiPaginated<ApiOrder>>(`/api/v1/orders${query}`),
      apiRequest<ApiPaginated<ApiTask>>(`/api/v1/tasks${query}`),
      apiRequest<ApiPaginated<ApiStaff>>(`/api/v1/staff${query}`),
      apiRequest<ApiSettings>("/api/v1/settings"),
    ]);

  const clientsLite = clientsPage.items.map((client) =>
    mapApiClientToUi(client)
  );
  const orders = ordersPage.items.map((order) =>
    mapApiOrderToUi(order, clientsLite)
  );
  const tasks = tasksPage.items.map((task) => mapApiTaskToUi(task, orders));
  const staff = staffPage.items.map((member) => mapApiStaffToUi(member, tasks));
  const clients = clientsPage.items.map((client) =>
    mapApiClientToUi(client, orders)
  );

  return {
    clients,
    orders,
    staff,
    tasks,
    settings: mapApiSettingsToUi(settings),
  };
}
