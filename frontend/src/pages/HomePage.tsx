import { ArrowRight, Database, Server, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

const features = [
  {
    icon: Zap,
    title: "React + Vite",
    description:
      "Lightning-fast development with hot module replacement and TypeScript support.",
  },
  {
    icon: Server,
    title: "FastAPI Backend",
    description:
      "High-performance Python API with automatic Swagger docs and Pydantic validation.",
  },
  {
    icon: Database,
    title: "PostgreSQL",
    description:
      "Production-grade relational database managed with SQLAlchemy and Alembic migrations.",
  },
];

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Full-Stack Starter
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          A production-ready monorepo template built with React, FastAPI, and PostgreSQL.
          Deployable to Vercel and Render in minutes.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/items">
            <Button size="lg">
              View Items <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="lg">
              API Docs
            </Button>
          </a>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
