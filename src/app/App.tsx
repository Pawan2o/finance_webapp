// Main App component that sets up routing
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useAppTheme } from '../Theme/useAppTheme';

// Root component that provides routing configuration to the entire app
export default function App() {
  useAppTheme();
  return <RouterProvider router={router} />;
}
