/**
 * TypeScript interfaces that mirror the backend Pydantic schemas.
 * Keep in sync with backend/app/schemas/.
 */

// ── Generic ───────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// ── Items (generic CRUD example) ──────────────────────────────────────────────

export interface Item {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemCreate {
  title: string;
  description?: string | null;
  is_active?: boolean;
}

export interface ItemUpdate {
  title?: string;
  description?: string | null;
  is_active?: boolean;
}

// ── Queue domain ──────────────────────────────────────────────────────────────

export type QueueStatus =
  | "waiting"
  | "called"
  | "in_service"
  | "completed"
  | "cancelled"
  | "no_show";

export type BarberStatus = "available" | "on_break" | "offline";

export interface ApiService {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

export interface ApiBarber {
  id: number;
  name: string;
  specialty: string | null;
  status: BarberStatus;
  is_active: boolean;
  initials: string;
}

export interface DashboardSummary {
  total_waiting: number;
  total_in_service: number;
  total_called: number;
  average_wait_minutes: number;
  queue_open: boolean;
}
