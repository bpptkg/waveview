import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Admin from "../views/admin/Admin";
import Catalog from "../views/catalog/Catalog";
import Help from "../views/help/Help";
import Picker from "../views/picker/Picker";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/picker",
        element: <Picker />,
      },
      {
        path: "/catalog",
        element: <Catalog />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/help",
        element: <Help />,
      },
    ],
  },
]);

export default router;
