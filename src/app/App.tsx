import { RouterProvider } from 'react-router';
import { router } from './config/routes';

export default function App() {
  return <RouterProvider router={router} />;
}
