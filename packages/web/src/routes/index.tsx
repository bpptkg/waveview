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
import Dashboard from '../views/dashboard/Dashboard';
import Error404 from '../views/error/Error404';
import Error500 from '../views/error/Error500';
import ForgotYourPassword from '../views/help/ForgotYourPassword';
import Help from '../views/help/Help';
import Login from '../views/login/Login';
import Picker from '../views/picker/Picker';
import Profile from '../views/profile/Profile';
import TermsOfService from '../views/tos/TermsOfService';
import EventDetailVisual from '../views/catalog/EventDetailVisual';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        ),
        children: [
          {
            path: '',
            element: <Navigate to=":org" replace />,
          },
          {
            path: ':org',
            children: [
              {
                path: '',
                element: <Navigate to=":volcano" replace />,
              },
              {
                path: ':volcano',
                children: [
                  {
                    path: '',
                    element: <Navigate to="picker" replace />,
                  },
                  {
                    path: 'picker',
                    element: <Picker />,
                  },
                  {
                    path: 'catalog',
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
                            path: ':eventId/visual',
                            element: <EventDetailVisual />,
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
                ],
              },
              {
                path: 'admin',
                element: <Admin />,
              },
              {
                path: 'help',
                element: <Help />,
              },
            ],
          },
          {
            path: 'profile',
            element: <Profile />,
          },
        ],
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/forgot-password',
        element: <ForgotYourPassword />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/terms-of-service',
        element: <TermsOfService />,
      },
      {
        path: '/404',
        element: <Error404 />,
      },
      {
        path: '/500',
        element: <Error500 />,
      },
    ],
  },
]);

export default router;
