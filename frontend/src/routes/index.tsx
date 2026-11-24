import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout";
import { HomePage, ItemsPage, NotFoundPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "items", element: <ItemsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
