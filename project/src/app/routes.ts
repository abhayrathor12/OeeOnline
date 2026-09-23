import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MachineList } from './pages/MachineList';
import { MachineDetail } from './pages/MachineDetail';
import { Downtime } from './pages/Downtime';
import { Shifts } from './pages/shifts';
import { Configuration } from './pages/Configuration';
import { Reports } from './pages/Reports';
import { Targets } from './pages/target';
import { Control } from './pages/Control';
import { Investigations } from './pages/Investigations';
import { Recipients } from './pages/Recipients';
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'machines', Component: MachineList },
       { path: 'machines/:id', Component: MachineDetail },
     { path: 'downtime', Component: Downtime },
      { path: 'shifts', Component: Shifts },
      { path: 'configuration', Component: Configuration },
      { path: 'reports', Component: Reports },
      { path: 'targets', Component: Targets },
      // Deliberately not in the sidebar (navItems in Layout.tsx) --
      // operator-only, reached by typing the URL directly.
      { path: 'control', Component: Control },
      { path: 'investigations', Component: Investigations },
      { path: 'recipients', Component: Recipients },
    ],
  },
]);
