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
    ],
  },
]);
