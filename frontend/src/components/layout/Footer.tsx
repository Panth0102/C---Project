export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © {year} FullStack App. Built with React, FastAPI &amp; PostgreSQL.
        </p>
      </div>
    </footer>
  );
}
