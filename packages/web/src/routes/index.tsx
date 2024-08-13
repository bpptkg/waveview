import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import RequireAuth from '../components/Auth/RequireAuth';
import About from '../views/about/About';
import Admin from '../views/admin/Admin';
import Catalog from '../views/catalog/Catalog';
import EventDetailAmplitude from '../views/catalog/EventDetailAmplitude';
import EventDetailAttachments from '../views/catalog/EventDetailAttachments';
import EventDetailLocation from '../views/catalog/EventDetailLocation';
import EventDetailMagnitude from '../views/catalog/EventDetailMagnitude';
import EventDetailSummary from '../views/catalog/EventDetailSummary';
import EventDetailWaveform from '../views/catalog/EventDetailWaveform';
import EventTable from '../views/catalog/EventTable';
import Hypocenter from '../views/catalog/Hypocenter';
import Seismicity from '../views/catalog/Seismicity';
import Help from '../views/help/Help';
import Login from '../views/login/Login';
import Picker from '../views/picker/Picker';
import TermsOfService from '../views/tos/TermsOfService';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      {
        path: '/picker',
        element: <Picker />,
      },
      {
        path: '/catalog',
        element: <Catalog />,
        children: [
          {
            path: 'events',
            element: <EventTable />,
            children: [
              {
                path: ':eventId/summary',
                element: <EventDetailSummary />,
              },
              {
                path: ':eventId/amplitude',
                element: <EventDetailAmplitude />,
              },
              {
                path: ':eventId/magnitude',
                element: <EventDetailMagnitude />,
              },
              {
                path: ':eventId/location',
                element: <EventDetailLocation />,
              },
              {
                path: ':eventId/waveform',
                element: <EventDetailWaveform />,
              },
              {
                path: ':eventId/attachments',
                element: <EventDetailAttachments />,
              },
              {
                path: ':eventId',
                element: <Navigate to="summary" replace />,
              },
            ],
          },
          {
            path: 'seismicity',
            element: <Seismicity />,
          },
          {
            path: 'hypocenter',
            element: <Hypocenter />,
          },
          {
            index: true,
            element: <Navigate to="events" replace />,
          },
        ],
      },
      {
        path: '/admin',
        element: <Admin />,
      },
      {
        path: '/help',
        element: <Help />,
      },
      {
        index: true,
        element: <Navigate to="/picker" replace />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/terms-of-service',
    element: <TermsOfService />,
  },
]);

export default router;
