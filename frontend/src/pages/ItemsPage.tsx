import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui";
import { useItems } from "@/hooks/useItems";
import type { ItemCreate } from "@/types";

export function ItemsPage() {
  const { items, loading, error, refresh, createItem, deleteItem } = useItems();
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    const payload: ItemCreate = { title: newTitle.trim() };
    await createItem(payload);
    setNewTitle("");
    setCreating(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Create form */}
      <form onSubmit={(e) => void handleCreate(e)} className="mb-8 flex gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New item title…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="New item title"
        />
        <Button type="submit" loading={creating} disabled={!newTitle.trim()}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Item
        </Button>
      </form>

      {/* Error state */}
      {error && <ErrorMessage message={error} onRetry={() => void refresh()} />}

      {/* Loading state */}
      {loading && <Loading message="Fetching items…" />}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-16 text-center">
          <p className="text-gray-500">No items yet. Create one above.</p>
        </div>
      )}

      {/* Item list */}
      {!loading && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-gray-200
                         bg-white px-4 py-3 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                {item.description && (
                  <p className="truncate text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>
              <div className="ml-4 flex items-center gap-2 shrink-0">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => void deleteItem(item.id)}
                  aria-label={`Delete ${item.title}`}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
