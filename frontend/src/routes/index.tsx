import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout";
import { HomePage, JoinQueuePage, NotFoundPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true,  element: <HomePage />       },
      { path: "join", element: <JoinQueuePage />  },
      // Placeholder for future screens
      { path: "status/:token", element: <NotFoundPage /> },
      { path: "*",    element: <NotFoundPage />   },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
