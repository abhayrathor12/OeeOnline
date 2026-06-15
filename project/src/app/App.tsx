import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes';
import { NotificationProvider } from "./components/ui/notification";
export default function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </NotificationProvider>
  );
}
