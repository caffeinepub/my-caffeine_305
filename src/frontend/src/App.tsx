import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { CartProvider } from "./contexts/CartContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { useActor } from "./hooks/useActor";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { RegisterPage } from "./pages/RegisterPage";

const SEED_KEY = "products_seed_attempted_v2";

function SeedInitializer() {
  const { actor } = useActor();

  useEffect(() => {
    if (!actor) return;
    if (localStorage.getItem(SEED_KEY)) return;
    localStorage.setItem(SEED_KEY, "true");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any).seedDefaultProducts().catch(() => {
      localStorage.removeItem(SEED_KEY);
    });
  }, [actor]);

  return null;
}

const rootRoute = createRootRoute({
  component: () => (
    <ProfileProvider>
      <CartProvider>
        <SeedInitializer />
        <Outlet />
        <Toaster position="top-center" />
      </CartProvider>
    </ProfileProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  cartRoute,
  checkoutRoute,
  ordersRoute,
  adminLoginRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
