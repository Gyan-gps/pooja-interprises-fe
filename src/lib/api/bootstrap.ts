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

async function loadAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  while (true) {
    const query = toQueryString({ page, pageSize: LIST_PAGE_SIZE });
    const result = await apiRequest<ApiPaginated<T>>(path + query);
    items.push(...result.items);
    if (page >= result.totalPages) return items;
    page += 1;
  }
}

export async function loadDashboardData(): Promise<DashboardBootstrapData> {
  const [clientsPage, ordersPage, tasksPage, staffPage, settings] =
    await Promise.all([
      loadAll<ApiClient>("/api/v1/clients"),
      loadAll<ApiOrder>("/api/v1/orders"),
      loadAll<ApiTask>("/api/v1/tasks"),
      loadAll<ApiStaff>("/api/v1/staff"),
      apiRequest<ApiSettings>("/api/v1/settings"),
    ]);

  const clientsLite = clientsPage.map((client) =>
    mapApiClientToUi(client)
  );
  const orders = ordersPage.map((order) =>
    mapApiOrderToUi(order, clientsLite)
  );
  const tasks = tasksPage.map((task) => mapApiTaskToUi(task, orders));
  const staff = staffPage.map((member) => mapApiStaffToUi(member, tasks));
  const clients = clientsPage.map((client) =>
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
