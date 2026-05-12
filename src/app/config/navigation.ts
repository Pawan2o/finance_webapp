import { Bot, ChartColumn, CreditCard, FileText, Home, Layers3, Receipt, Settings, Shield, UserCircle, Users } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: typeof Home;
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard',       label: 'Dashboard',       path: '/dashboard',       icon: Home },
  { id: 'users',           label: 'Users',            path: '/users',           icon: Users },
  { id: 'types',           label: 'Types',            path: '/types',           icon: Layers3 },
  { id: 'categories',      label: 'Categories',       path: '/categories',      icon: ChartColumn },
  { id: 'payment-methods', label: 'Payment Methods',  path: '/payment-methods', icon: CreditCard },
  { id: 'transactions',    label: 'Transactions',     path: '/transactions',    icon: Receipt },
  { id: 'roles',           label: 'Roles',            path: '/roles',           icon: Shield },
  { id: 'audit-logs',      label: 'Audit Logs',       path: '/audit-logs',      icon: FileText },
  { id: 'ai-questions',    label: 'AI Questions',     path: '/ai-questions',    icon: Bot },
  { id: 'reports',         label: 'Reports',          path: '/reports',         icon: FileText },
  { id: 'profile',         label: 'Profile',          path: '/profile',         icon: UserCircle },
  { id: 'settings',        label: 'Settings',         path: '/settings',        icon: Settings },
];
