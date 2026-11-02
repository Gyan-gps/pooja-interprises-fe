"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createClientApi,
  deleteClientApi,
  updateClientApi,
} from "@/lib/api/clients-api";
import {
  createOrderApi,
  deleteOrderApi,
  updateOrderApi,
  updateOrderStatusApi,
} from "@/lib/api/orders-api";
import {
  createStaffApi,
  deleteStaffApi,
  updateStaffApi,
} from "@/lib/api/staff-api";
import {
  createTaskApi,
  deleteTaskApi,
  updateTaskApi,
} from "@/lib/api/tasks-api";
import { saveSettingsApi } from "@/lib/api/settings-api";
import { loadDashboardData } from "@/lib/api/bootstrap";
import { ApiRequestError } from "@/lib/api/http";
import type {
  BusinessSettings,
  Client,
  CreateClientInput,
  CreateOrderInput,
  CreateStaffInput,
  CreateTaskInput,
  Order,
  StaffMember,
  Task,
} from "@/types";

interface AppDataContextValue {
  loading: boolean;
  errorMessage: string | null;
  refreshAll: () => Promise<void>;

  orders: Order[];
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;

  clients: Client[];
  createClient: (input: CreateClientInput) => Promise<Client>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;

  staff: StaffMember[];
  createStaff: (input: CreateStaffInput) => Promise<StaffMember>;
  updateStaff: (id: string, patch: Partial<StaffMember>) => Promise<StaffMember>;
  deleteStaff: (id: string, reassignTasksToStaffId?: string) => Promise<void>;

  tasks: Task[];
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  settings: BusinessSettings;
  saveSettings: (settings: BusinessSettings) => Promise<BusinessSettings>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshAll = useCallback(async () => {
    setErrorMessage(null);
    const data = await loadDashboardData();
    if (!mounted.current) return;

    setOrders(data.orders);
    setTasks(data.tasks);
    setStaff(data.staff);
    setClients(data.clients);
    setSettings(data.settings);
  }, []);

  useEffect(() => {
    refreshAll()
      .catch((error: unknown) => {
        if (!mounted.current) return;
        if (error instanceof ApiRequestError && error.statusCode === 401) {
          return;
        }
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load dashboard data."
        );
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, [refreshAll]);

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      const created = await createOrderApi(input, clients);
      setOrders((prev) => [created, ...prev]);
      setClients((prev) =>
        prev.map((client) =>
          client.id === created.clientId
            ? {
                ...client,
                orders: client.orders + 1,
                lastOrder: created.orderDate,
              }
            : client
        )
      );
      return created;
    },
    [clients]
  );

  const updateOrder = useCallback(
    async (id: string, patch: Partial<Order>) => {
      const staffId =
        patch.staffId ??
        (patch.staff && patch.staff !== "—"
          ? staff.find((member) => member.name === patch.staff)?.id
          : undefined);

      let updated: Order;
      if (patch.deliveredTo) {
        updated = await updateOrderApi(id, { ...patch, staffId }, clients);
      } else if (patch.status) {
        updated = await updateOrderStatusApi(
          id,
          {
            status: patch.status,
            staffId,
            readyCount: patch.readyCount,
          },
          clients
        );
      } else {
        updated = await updateOrderApi(id, { ...patch, staffId }, clients);
      }

      setOrders((prev) => prev.map((order) => (order.id === id ? updated : order)));
      return updated;
    },
    [clients, staff]
  );

  const deleteOrder = useCallback(async (id: string) => {
    await deleteOrderApi(id);
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const createClient = useCallback(async (input: CreateClientInput) => {
    const created = await createClientApi(input, orders);
    setClients((prev) => [created, ...prev]);
    return created;
  }, [orders]);

  const updateClient = useCallback(
    async (id: string, patch: Partial<Client>) => {
      const updated = await updateClientApi(id, patch, orders);
      setClients((prev) =>
        prev.map((client) => (client.id === id ? updated : client))
      );
      return updated;
    },
    [orders]
  );

  const deleteClient = useCallback(async (id: string) => {
    await deleteClientApi(id);
    setClients((prev) => prev.filter((client) => client.id !== id));
  }, []);

  const createStaff = useCallback(async (input: CreateStaffInput) => {
    const created = await createStaffApi(input, tasks);
    setStaff((prev) => [...prev, created]);
    return created;
  }, [tasks]);

  const updateStaff = useCallback(
    async (id: string, patch: Partial<StaffMember>) => {
      const updated = await updateStaffApi(id, patch, tasks);
      setStaff((prev) =>
        prev.map((member) => (member.id === id ? updated : member))
      );
      return updated;
    },
    [tasks]
  );

  const deleteStaff = useCallback(
    async (id: string, reassignTasksToStaffId?: string) => {
      await deleteStaffApi(id, reassignTasksToStaffId);
      setStaff((prev) => prev.filter((member) => member.id !== id));
      if (reassignTasksToStaffId) {
        setTasks((prev) =>
          prev.map((task) =>
            task.staffId === id && task.status !== "Completed"
              ? { ...task, staffId: reassignTasksToStaffId }
              : task
          )
        );
      }
    },
    []
  );

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      const created = await createTaskApi(input, orders);
      setTasks((prev) => [created, ...prev]);
      setStaff((prev) =>
        prev.map((member) =>
          member.id === created.staffId
            ? { ...member, active: member.active + 1 }
            : member
        )
      );
      return created;
    },
    [orders]
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      const updated = await updateTaskApi(id, patch, orders);
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      return updated;
    },
    [orders]
  );

  const deleteTask = useCallback(async (id: string) => {
    await deleteTaskApi(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const saveSettings = useCallback(async (next: BusinessSettings) => {
    const saved = await saveSettingsApi(next);
    setSettings(saved);
    return saved;
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (errorMessage || !settings) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-red-700">
          {errorMessage || "Unable to load dashboard data."}
        </p>
        <button
          type="button"
          className="text-sm font-semibold text-[#E84C1E] underline"
          onClick={() => {
            setLoading(true);
            refreshAll()
              .catch((error: unknown) => {
                setErrorMessage(
                  error instanceof Error
                    ? error.message
                    : "Failed to load dashboard data."
                );
              })
              .finally(() => setLoading(false));
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const value: AppDataContextValue = {
    loading,
    errorMessage,
    refreshAll,
    orders,
    createOrder,
    updateOrder,
    deleteOrder,
    clients,
    createClient,
    updateClient,
    deleteClient,
    staff,
    createStaff,
    updateStaff,
    deleteStaff,
    tasks,
    createTask,
    updateTask,
    deleteTask,
    settings,
    saveSettings,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside an AppDataProvider");
  return ctx;
}
