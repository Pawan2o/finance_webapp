import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import { Login }          from '../pages/Login';
import { Dashboard }      from '../pages/Dashboard';
import { Users }          from '../pages/admin/users';
import { Types }          from '../pages/admin/types';
import { Transactions }   from '../pages/admin/transactions';
import { Settings }       from '../pages/admin/settings';
import { Roles }          from '../pages/admin/roles';
import { Reports }        from '../pages/admin/reports';
import { Profile }        from '../pages/admin/profile';
import { PaymentMethods } from '../pages/admin/paymentMethods';
import { Categories }     from '../pages/admin/categories';
import { AuditLogs }      from '../pages/admin/auditLogs';
import { AIQuestions }    from '../pages/admin/aiQuestions';

const routes: RouteObject[] = [
  { path: '/',                element: <Login /> },
  { path: '/dashboard',       element: <Dashboard /> },
  { path: '/users',           element: <Users /> },
  { path: '/types',           element: <Types /> },
  { path: '/categories',      element: <Categories /> },
  { path: '/payment-methods', element: <PaymentMethods /> },
  { path: '/transactions',    element: <Transactions /> },
  { path: '/roles',           element: <Roles /> },
  { path: '/audit-logs',      element: <AuditLogs /> },
  { path: '/ai-questions',    element: <AIQuestions /> },
  { path: '/reports',         element: <Reports /> },
  { path: '/profile',         element: <Profile /> },
  { path: '/settings',        element: <Settings /> },
];

export const router = createBrowserRouter(routes);
