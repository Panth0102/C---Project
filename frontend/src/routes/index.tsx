import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout";
import {
  AdminPage,
  BarberPage,
  CustomerStatusPage,
  DisplayPage,
  HomePage,
  JoinQueuePage,
  NotFoundPage,
  ReceptionPage,
  WalkInRegistrationPage,
} from "@/pages";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true,              element: <HomePage />               },
        { path: "join",             element: <JoinQueuePage />          },
        { path: "walk-in",          element: <WalkInRegistrationPage /> },
        { path: "status/:token",    element: <CustomerStatusPage />     },
        { path: "reception",        element: <ReceptionPage />          },
        { path: "barber/:name",     element: <BarberPage />             },
        { path: "display",          element: <DisplayPage />            },
        { path: "admin",            element: <AdminPage />              },
        { path: "*",                element: <NotFoundPage />           },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
