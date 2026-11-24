/**
 * Domain types for the queue system.
 * Mirrors the backend schema described in AGENTS.md.
 */

export interface QueueEntry {
  id: string;
  token: string;
  customerName: string;
  phone: string;
  serviceIds: string[];
  barberId: string | "any";
  status: "waiting" | "called" | "in_service" | "completed" | "cancelled";
  position: number;
  estimatedWaitMinutes: number;
  totalPrice: number;
  totalDuration: number;
  createdAt: string;
}

export interface QueueFormData {
  customerName: string;
  phone: string;
  serviceIds: string[];
  barberId: string;   // "any" = no preference
}

export interface QueueSubmitResponse {
  success: boolean;
  token: string;
  queueId: string;
  position: number;
  estimatedWaitMinutes: number;
  message?: string;
}
