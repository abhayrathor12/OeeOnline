import { RouterProvider } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes';
import { NotificationProvider } from "./components/ui/notification";
import { AgentProvider } from './agent/AgentContext';
export default function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <AgentProvider>
          <RouterProvider router={router} />
        </AgentProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}
