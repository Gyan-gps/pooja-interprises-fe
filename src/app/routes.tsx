import { lazy, type ReactElement } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { useAppData } from "../lib/appDataContext";

// Route-level code splitting for the heavier secondary screens.
const Orders = lazy(() => import("../pages/Orders/Orders").then(m => ({ default: m.Orders })));
const Clients = lazy(() => import("../pages/Clients/Clients").then(m => ({ default: m.Clients })));
const Production = lazy(() => import("../pages/Production/Production").then(m => ({ default: m.Production })));
const Staff = lazy(() => import("../pages/Staff/Staff").then(m => ({ default: m.Staff })));
const Reports = lazy(() => import("../pages/Reports/Reports").then(m => ({ default: m.Reports })));
const Settings = lazy(() => import("../pages/Settings/Settings").then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import("../pages/NotFound/NotFound").then(m => ({ default: m.NotFound })));

/* Thin wrappers keep the page components prop-driven while routes stay declarative. */
function DashboardRoute() {
  const { orders } = useAppData();
  return <Dashboard orders={orders} />;
}

function OrdersRoute() {
  const { orders, clients, setOrders } = useAppData();
  return <Orders orders={orders} clients={clients} setOrders={setOrders} />;
}

function ClientsRoute() {
  const { orders, setOrders, clients, setClients } = useAppData();
  return <Clients orders={orders} setOrders={setOrders} clients={clients} setClients={setClients} />;
}

function ProductionRoute() {
  const { orders, setOrders } = useAppData();
  return <Production orders={orders} setOrders={setOrders} />;
}

function StaffRoute() {
  const { staff, setStaff } = useAppData();
  return <Staff staff={staff} setStaff={setStaff} />;
}

function ReportsRoute() {
  const { orders, clients, staff } = useAppData();
  return <Reports orders={orders} clients={clients} staff={staff} />;
}

export interface AppRoute {
  path: string;
  element: ReactElement;
}

export const routes: AppRoute[] = [
  { path: "/", element: <DashboardRoute /> },
  { path: "/orders", element: <OrdersRoute /> },
  { path: "/clients", element: <ClientsRoute /> },
  { path: "/production", element: <ProductionRoute /> },
  { path: "/staff", element: <StaffRoute /> },
  { path: "/reports", element: <ReportsRoute /> },
  { path: "/settings", element: <Settings /> },
  { path: "*", element: <NotFound /> },
];

export { MainLayout };
