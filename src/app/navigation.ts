import { createElement, ReactElement } from "react";
import { Navigate } from "react-router";
import {
  Activity,
  ArrowLeftRight,
  Brain,
  CreditCard,
  FileText,
  FileType,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { AIQuestions } from "./pages/admin/aiQuestions";
import { AuditLogs } from "./pages/admin/auditLogs";
import { Categories } from "./pages/admin/categories";
import { PaymentMethods } from "./pages/admin/paymentMethods";
import { Profile } from "./pages/admin/profile";
import { Reports } from "./pages/admin/reports";
import { Roles } from "./pages/admin/roles";
import { Settings as SettingsPage } from "./pages/admin/settings";
import { Transactions } from "./pages/admin/transactions";
import { Types } from "./pages/admin/types";
import { Users as UsersPage } from "./pages/admin/users";
import { getAuthToken } from "../utils/auth";

export interface AppRouteConfig {
  path: string;
  Component: () => ReactElement;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

function RequireAuth({ children }: { children: ReactElement }) {
  const token = getAuthToken();

  if (!token) {
    return createElement(Navigate, { to: "/login", replace: true });
  }

  return children;
}

function PublicOnlyRoute({ children }: { children: ReactElement }) {
  const token = getAuthToken();

  if (token) {
    return createElement(Navigate, { to: "/dashboard", replace: true });
  }

  return children;
}

export const appRoutes: AppRouteConfig[] = [
  { path: "/", Component: () => createElement(RequireAuth, null, createElement(Dashboard)) },
  { path: "/dashboard", Component: () => createElement(RequireAuth, null, createElement(Dashboard)) },
  { path: "/login", Component: () => createElement(PublicOnlyRoute, null, createElement(Login)) },
  { path: "/profile", Component: () => createElement(RequireAuth, null, createElement(Profile)) },
  { path: "/users", Component: () => createElement(RequireAuth, null, createElement(UsersPage)) },
  { path: "/transactions", Component: () => createElement(RequireAuth, null, createElement(Transactions)) },
  { path: "/categories", Component: () => createElement(RequireAuth, null, createElement(Categories)) },
  { path: "/types", Component: () => createElement(RequireAuth, null, createElement(Types)) },
  { path: "/payment-methods", Component: () => createElement(RequireAuth, null, createElement(PaymentMethods)) },
  { path: "/roles", Component: () => createElement(RequireAuth, null, createElement(Roles)) },
  { path: "/reports", Component: () => createElement(RequireAuth, null, createElement(Reports)) },
  { path: "/settings", Component: () => createElement(RequireAuth, null, createElement(SettingsPage)) },
  { path: "/audit-logs", Component: () => createElement(RequireAuth, null, createElement(AuditLogs)) },
  { path: "/ai-questions", Component: () => createElement(RequireAuth, null, createElement(AIQuestions)) },
];

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "users", label: "Users", icon: Users, path: "/users" },
  { id: "types", label: "Types", icon: FileType, path: "/types" },
  { id: "categories", label: "Categories", icon: FolderOpen, path: "/categories" },
  { id: "payment-methods", label: "Payment Methods", icon: CreditCard, path: "/payment-methods" },
  { id: "roles", label: "Roles & Permissions", icon: Shield, path: "/roles" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
  { id: "ai-questions", label: "AI Questions", icon: Brain, path: "/ai-questions" },
  { id: "audit-logs", label: "Audit Logs", icon: Activity, path: "/audit-logs" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];
