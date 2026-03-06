import { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'notificationEnabled';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  const setEnabled = (value) => {
    setEnabledState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  const value = {
    notificationEnabled: enabled,
    setNotificationEnabled: setEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
