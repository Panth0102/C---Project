/**
 * Centralised error-handling utilities.
 * Converts Axios errors and unknown thrown values into human-readable strings.
 */

import axios from "axios";
import type { ApiError } from "@/types";

/** Extract a user-facing message from any caught value. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.detail) {
      if (typeof data.detail === "string") return data.detail;
      // FastAPI validation errors arrive as an array of objects.
      if (Array.isArray(data.detail)) {
        return data.detail.map((e) => `${e.loc.join(".")}: ${e.msg}`).join("; ");
      }
    }

    if (error.response?.status === 404) return "Resource not found.";
    if (error.response?.status === 422) return "Invalid request data.";
    if (error.response?.status === 500) return "Internal server error. Try again later.";
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

/** Return true when the error is a network/connectivity issue. */
export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}
