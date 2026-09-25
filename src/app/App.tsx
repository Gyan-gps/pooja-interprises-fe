import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout, routes } from "./routes";
import { AppDataProvider } from "../lib/appDataContext";
import { ToastProvider } from "../lib/toast";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppDataProvider>
          <Routes>
            <Route element={<MainLayout />}>
              {routes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>
          </Routes>
        </AppDataProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
