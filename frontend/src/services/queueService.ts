/**
 * Queue API service — all HTTP calls for the queue domain.
 */

import type { QueueEntry } from "@/types/queue";
import type { ApiBarber, ApiService, DashboardSummary } from "@/types/api";
import apiClient from "./apiClient";

const BASE = "/api/v1/queue";

export const queueService = {
  // ── Catalogue ──────────────────────────────────────────────────────
  getServices: async (): Promise<ApiService[]> => {
    const { data } = await apiClient.get<ApiService[]>(`${BASE}/services`);
    return data;
  },

  getBarbers: async (): Promise<ApiBarber[]> => {
    const { data } = await apiClient.get<ApiBarber[]>(`${BASE}/barbers`);
    return data;
  },

  // ── Customer ───────────────────────────────────────────────────────
  joinQueue: async (payload: {
    customer_name: string;
    phone: string;
    service_ids: number[];
    barber_id?: number | null;
  }): Promise<QueueEntry> => {
    const { data } = await apiClient.post<QueueEntry>(`${BASE}/join`, payload);
    return data;
  },

  getStatusByToken: async (token: string): Promise<QueueEntry> => {
    const { data } = await apiClient.get<QueueEntry>(`${BASE}/status/${token}`);
    return data;
  },

  cancelMySpot: async (queueId: number): Promise<QueueEntry> => {
    const { data } = await apiClient.delete<QueueEntry>(`${BASE}/${queueId}/cancel`);
    return data;
  },

  // ── Receptionist ───────────────────────────────────────────────────
  getActiveQueue: async (): Promise<QueueEntry[]> => {
    const { data } = await apiClient.get<QueueEntry[]>(`${BASE}/active`);
    return data;
  },

  updateStatus: async (queueId: number, status: string): Promise<QueueEntry> => {
    const { data } = await apiClient.patch<QueueEntry>(`${BASE}/${queueId}/status`, { status });
    return data;
  },

  addWalkIn: async (payload: {
    customer_name: string;
    phone: string;
    service_ids: number[];
    barber_id?: number | null;
  }): Promise<QueueEntry> => {
    const { data } = await apiClient.post<QueueEntry>(`${BASE}/walkin`, payload);
    return data;
  },

  updateBarberStatus: async (barberId: number, status: string): Promise<ApiBarber> => {
    const { data } = await apiClient.patch<ApiBarber>(
      `${BASE}/barbers/${barberId}/status`,
      { status }
    );
    return data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const { data } = await apiClient.get<DashboardSummary>(`${BASE}/dashboard/summary`);
    return data;
  },
};
