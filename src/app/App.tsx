import { RouterProvider } from 'react-router';
import { useAppTheme } from '../Theme/useAppTheme';
import { router } from './routes';

export default function App() {
  useAppTheme();
  return <RouterProvider router={router} />;
}
