import { Layers } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/items", label: "Items" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700"
          aria-label="Go to home"
        >
          <Layers className="h-6 w-6" aria-hidden="true" />
          <span className="text-lg">FullStack App</span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    [
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
