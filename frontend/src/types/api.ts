/**
 * TypeScript interfaces that mirror the backend Pydantic schemas.
 * Keep these in sync with backend/app/schemas/.
 */

export interface Item {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string; // ISO-8601 datetime string
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

/** Generic API error shape returned by FastAPI validation errors. */
export interface ApiError {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** Standard paginated list response wrapper (for future use). */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
