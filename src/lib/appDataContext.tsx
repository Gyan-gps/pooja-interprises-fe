import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ordersRepository } from "./repositories/ordersRepository";
import { clientsRepository } from "./repositories/clientsRepository";
import { staffRepository } from "./repositories/staffRepository";
import { tasksRepository } from "./repositories/tasksRepository";
import { settingsRepository } from "./repositories/settingsRepository";
import type { BusinessSettings, Client, Order, StaffMember, Task } from "../types";

interface AppDataContextValue {
  loading: boolean;

  orders: Order[];
  createOrder: (order: Order) => Promise<Order>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;

  clients: Client[];
  createClient: (client: Client) => Promise<Client>;
  updateClient: (id: number, patch: Partial<Client>) => Promise<Client>;
  deleteClient: (id: number) => Promise<void>;

  staff: StaffMember[];
  createStaff: (member: StaffMember) => Promise<StaffMember>;
  updateStaff: (id: number, patch: Partial<StaffMember>) => Promise<StaffMember>;
  deleteStaff: (id: number) => Promise<void>;

  tasks: Task[];
  createTask: (task: Task) => Promise<Task>;
  updateTask: (id: number, patch: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;

  settings: BusinessSettings;
  saveSettings: (settings: BusinessSettings) => Promise<BusinessSettings>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

/**
 * Holds every record the app operates on and the CRUD methods that touch
 * them, backed by the repositories in `./repositories`. Components call
 * `createOrder`/`updateClient`/etc. instead of raw setState — the day a real
 * API replaces localStorage, only the repository files change.
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    Promise.all([
      ordersRepository.list(),
      clientsRepository.list(),
      staffRepository.list(),
      tasksRepository.list(),
      settingsRepository.get(),
    ]).then(([o, c, s, t, st]) => {
      if (!mounted.current) return;
      setOrders(o);
      setClients(c);
      setStaff(s);
      setTasks(t);
      setSettings(st);
      setLoading(false);
    });
  }, []);

  // Orders
  const createOrder = useCallback(async (order: Order) => {
    const created = await ordersRepository.create(order);
    setOrders(prev => [created, ...prev]);
    return created;
  }, []);

  const updateOrder = useCallback(async (id: string, patch: Partial<Order>) => {
    const updated = await ordersRepository.update(id, patch);
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    await ordersRepository.remove(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  // Clients
  const createClient = useCallback(async (client: Client) => {
    const created = await clientsRepository.create(client);
    setClients(prev => [created, ...prev]);
    return created;
  }, []);

  const updateClient = useCallback(async (id: number, patch: Partial<Client>) => {
    const updated = await clientsRepository.update(id, patch);
    setClients(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteClient = useCallback(async (id: number) => {
    await clientsRepository.remove(id);
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  // Staff
  const createStaff = useCallback(async (member: StaffMember) => {
    const created = await staffRepository.create(member);
    setStaff(prev => [...prev, created]);
    return created;
  }, []);

  const updateStaff = useCallback(async (id: number, patch: Partial<StaffMember>) => {
    const updated = await staffRepository.update(id, patch);
    setStaff(prev => prev.map(s => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteStaff = useCallback(async (id: number) => {
    await staffRepository.remove(id);
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  // Tasks
  const createTask = useCallback(async (task: Task) => {
    const created = await tasksRepository.create(task);
    setTasks(prev => [created, ...prev]);
    return created;
  }, []);

  const updateTask = useCallback(async (id: number, patch: Partial<Task>) => {
    const updated = await tasksRepository.update(id, patch);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    await tasksRepository.remove(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Settings
  const saveSettings = useCallback(async (next: BusinessSettings) => {
    const saved = await settingsRepository.save(next);
    setSettings(saved);
    return saved;
  }, []);

  if (loading || !settings) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const value: AppDataContextValue = {
    loading,
    orders, createOrder, updateOrder, deleteOrder,
    clients, createClient, updateClient, deleteClient,
    staff, createStaff, updateStaff, deleteStaff,
    tasks, createTask, updateTask, deleteTask,
    settings, saveSettings,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside an AppDataProvider");
  return ctx;
}
