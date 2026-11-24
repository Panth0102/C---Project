/**
 * Queue domain types — mirrors backend/app/schemas/queue.py exactly.
 */

import type { ApiBarber, ApiService, QueueStatus } from "./api";

export interface QueueEntry {
  id: number;
  token: string;
  customer_name: string;
  phone: string;
  status: QueueStatus;
  position: number | null;
  estimated_wait_minutes: number;
  total_price: number;
  total_duration: number;
  barber_locked: boolean;
  called_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  barber: ApiBarber | null;
  services: ApiService[];
}

export interface QueueFormData {
  customer_name: string;
  phone: string;
  service_ids: number[];
  barber_id: number | null;
}

export interface QueueSubmitResponse {
  success: boolean;
  token: string;
  queueId: number;
  position: number;
  estimatedWaitMinutes: number;
  message?: string;
}
