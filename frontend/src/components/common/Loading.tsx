interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = "Loading…", fullScreen = false }: LoadingProps) {
  const wrapper = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white/80 z-50"
    : "flex items-center justify-center py-12";

  return (
    <div className={wrapper} role="status" aria-label={message}>
      <div className="flex flex-col items-center gap-3">
        <svg
          className="h-10 w-10 animate-spin text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
