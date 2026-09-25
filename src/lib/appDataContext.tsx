import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { CLIENTS, INITIAL_ORDERS, STAFF_LIST } from "./data";
import type { Client, Order, StaffMember } from "../types";

interface AppDataContextValue {
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  clients: Client[];
  setClients: Dispatch<SetStateAction<Client[]>>;
  staff: StaffMember[];
  setStaff: Dispatch<SetStateAction<StaffMember[]>>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

/**
 * Holds the records shared across routes (orders, clients, staff).
 * Swap the useState seeds for fetched data to move this onto the API.
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_LIST);

  const value = useMemo(
    () => ({ orders, setOrders, clients, setClients, staff, setStaff }),
    [orders, clients, staff]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside an AppDataProvider");
  return ctx;
}
