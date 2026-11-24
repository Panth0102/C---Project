/**
 * Tests for itemService — axios calls are mocked so no network traffic occurs.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "@/types";

// ── Mock axios before importing the service ───────────────────────────────────
vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

import apiClient from "@/services/apiClient";
import { itemService } from "@/services/itemService";

const mockItem: Item = {
  id: 1,
  title: "Mock Item",
  description: "desc",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("itemService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getAll calls GET /api/v1/items/ and returns data", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: [mockItem] });
    const result = await itemService.getAll();
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/items/", expect.anything());
    expect(result).toEqual([mockItem]);
  });

  it("getById calls GET /api/v1/items/{id}", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockItem });
    const result = await itemService.getById(1);
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/items/1");
    expect(result).toEqual(mockItem);
  });

  it("create calls POST /api/v1/items/", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: mockItem });
    const result = await itemService.create({ title: "New" });
    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/items/", { title: "New" });
    expect(result).toEqual(mockItem);
  });

  it("update calls PUT /api/v1/items/{id}", async () => {
    const updated = { ...mockItem, title: "Updated" };
    vi.spyOn(apiClient, "put").mockResolvedValueOnce({ data: updated });
    const result = await itemService.update(1, { title: "Updated" });
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/items/1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("remove calls DELETE /api/v1/items/{id}", async () => {
    vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: mockItem });
    const result = await itemService.remove(1);
    expect(apiClient.delete).toHaveBeenCalledWith("/api/v1/items/1");
    expect(result).toEqual(mockItem);
  });
});
