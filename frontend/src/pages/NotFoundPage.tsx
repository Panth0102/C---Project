import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <p className="text-6xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
