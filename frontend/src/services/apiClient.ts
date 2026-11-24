/**
 * Axios instance with centralised base URL and default headers.
 * All service files import this — never create ad-hoc axios instances.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20_000, // 20 s — allows for Render free-tier cold starts
});

// ── Request interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Attach auth token when available (JWT, etc.).
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error side-effects go here (e.g. redirect on 401).
    return Promise.reject(error);
  }
);

export default apiClient;
