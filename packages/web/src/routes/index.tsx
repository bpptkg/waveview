import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import RequireAuth from '../components/Auth/RequireAuth';
import About from '../views/about/About';
import Admin from '../views/admin/Admin';
import Catalog from '../views/catalog/Catalog';
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
