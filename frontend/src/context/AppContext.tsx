/**
 * Application-wide context.
 * Provides a simple global notification/toast mechanism.
 * Extend this with auth state, theme preferences, etc. as the app grows.
 */

import React, { createContext, useCallback, useContext, useState } from "react";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface AppContextValue {
  notify: (message: string, type?: NotificationType) => void;
  notifications: Notification[];
  dismissNotification: (id: number) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

let _nextId = 0;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = ++_nextId;
    setNotifications((prev) => [...prev, { id, message, type }]);
    // Auto-dismiss after 4 s.
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ notify, notifications, dismissNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
}
