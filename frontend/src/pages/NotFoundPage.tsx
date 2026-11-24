import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { ScissorsIcon } from "@/components/ui/VintageIcons";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4 min-h-[60vh]">
      <ScissorsIcon className="w-14 h-14 text-gold/40 mx-auto mb-6" aria-hidden="true" />
      <p className="font-heading text-7xl sm:text-8xl font-black text-gold/20 leading-none select-none">
        404
      </p>
      <h1 className="mt-4 font-heading text-parchment text-2xl font-semibold">
        Page Not Found
      </h1>
      <p className="mt-3 text-parchment/50 font-body max-w-sm leading-relaxed">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
        <Link to="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
        <Link to="/join">
          <Button variant="secondary">Join Queue</Button>
        </Link>
      </div>
    </div>
  );
}
