/**
 * Item resource — HTTP service layer.
 * All backend communication for items goes through these functions.
 */

import type { Item, ItemCreate, ItemUpdate } from "@/types";
import apiClient from "./apiClient";

const BASE = "/api/v1/items";

export const itemService = {
  /** Fetch all items with optional pagination. */
  getAll: async (skip = 0, limit = 100): Promise<Item[]> => {
    const { data } = await apiClient.get<Item[]>(BASE + "/", {
      params: { skip, limit },
    });
    return data;
  },

  /** Fetch a single item by ID. */
  getById: async (id: number): Promise<Item> => {
    const { data } = await apiClient.get<Item>(`${BASE}/${id}`);
    return data;
  },

  /** Create a new item. */
  create: async (payload: ItemCreate): Promise<Item> => {
    const { data } = await apiClient.post<Item>(BASE + "/", payload);
    return data;
  },

  /** Update an existing item. */
  update: async (id: number, payload: ItemUpdate): Promise<Item> => {
    const { data } = await apiClient.put<Item>(`${BASE}/${id}`, payload);
    return data;
  },

  /** Delete an item by ID. */
  remove: async (id: number): Promise<Item> => {
    const { data } = await apiClient.delete<Item>(`${BASE}/${id}`);
    return data;
  },
};
