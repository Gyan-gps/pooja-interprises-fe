import { lazy, type ReactElement } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";

// Route-level code splitting for the heavier secondary screens.
const Orders = lazy(() => import("../pages/Orders/Orders").then(m => ({ default: m.Orders })));
const OrderDetail = lazy(() => import("../pages/Orders/OrderDetail").then(m => ({ default: m.OrderDetail })));
const Clients = lazy(() => import("../pages/Clients/Clients").then(m => ({ default: m.Clients })));
const ClientDetail = lazy(() => import("../pages/Clients/ClientDetail").then(m => ({ default: m.ClientDetail })));
const Production = lazy(() => import("../pages/Production/Production").then(m => ({ default: m.Production })));
const Staff = lazy(() => import("../pages/Staff/Staff").then(m => ({ default: m.Staff })));
const StaffDetail = lazy(() => import("../pages/Staff/StaffDetail").then(m => ({ default: m.StaffDetail })));
const Reports = lazy(() => import("../pages/Reports/Reports").then(m => ({ default: m.Reports })));
const Settings = lazy(() => import("../pages/Settings/Settings").then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import("../pages/NotFound/NotFound").then(m => ({ default: m.NotFound })));

export interface AppRoute {
  path: string;
  element: ReactElement;
}

/**
 * Every page below reads what it needs straight from `useAppData()` — at
 * this many entities and CRUD actions, prop-drilling per route stopped
 * paying for itself; the context *is* the app's data API.
 */
export const routes: AppRoute[] = [
  { path: "/", element: <Dashboard /> },
  { path: "/orders", element: <Orders /> },
  { path: "/orders/:id", element: <OrderDetail /> },
  { path: "/clients", element: <Clients /> },
  { path: "/clients/:id", element: <ClientDetail /> },
  { path: "/production", element: <Production /> },
  { path: "/staff", element: <Staff /> },
  { path: "/staff/:id", element: <StaffDetail /> },
  { path: "/reports", element: <Reports /> },
  { path: "/settings", element: <Settings /> },
  { path: "*", element: <NotFound /> },
];

export { MainLayout };
