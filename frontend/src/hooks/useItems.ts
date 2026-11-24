/**
 * Custom hook that manages the full Items resource lifecycle:
 * fetching, creating, updating, and deleting.
 */

import { useCallback, useEffect, useState } from "react";
import type { Item, ItemCreate, ItemUpdate } from "@/types";
import { itemService } from "@/services/itemService";
import { getErrorMessage } from "@/utils";

interface UseItemsReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createItem: (payload: ItemCreate) => Promise<Item | null>;
  updateItem: (id: number, payload: ItemUpdate) => Promise<Item | null>;
  deleteItem: (id: number) => Promise<boolean>;
}

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemService.getAll();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createItem = async (payload: ItemCreate): Promise<Item | null> => {
    try {
      const created = await itemService.create(payload);
      setItems((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  };

  const updateItem = async (id: number, payload: ItemUpdate): Promise<Item | null> => {
    try {
      const updated = await itemService.update(id, payload);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      await itemService.remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  return { items, loading, error, refresh, createItem, updateItem, deleteItem };
}
