import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'notificationEnabled';

// 알림 설정 조회 API (GET /api/users/me/notification-settings)
async function getNotificationSettingsApi() {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/notification-settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `요청 실패 (${res.status})`);
  }
  return data;
}

// 알림 설정 업데이트 API (PUT /api/users/me/notification-settings)
async function updateNotificationSettingsApi(enabled) {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/notification-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ pushEnabled: enabled }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? `요청 실패 (${res.status})`);
  }
  return data;
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });
  const [loading, setLoading] = useState(false);

  // 로그인 상태에서 서버로부터 알림 설정 조회
  const fetchNotificationSettings = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotificationSettingsApi();
      const userData = data.data || data;
      const serverEnabled = userData.pushEnabled ?? true;
      setEnabledState(serverEnabled);
      localStorage.setItem(STORAGE_KEY, String(serverEnabled));
    } catch (err) {
      console.error('알림 설정 조회 실패:', err);
    }
  }, [user]);

  // user 변경 시 서버에서 설정 조회
  useEffect(() => {
    if (user) {
      fetchNotificationSettings();
    }
  }, [user, fetchNotificationSettings]);

  // 알림 설정 업데이트 (로컬 + 서버)
  const setEnabled = async (value) => {
    setEnabledState(value);
    localStorage.setItem(STORAGE_KEY, String(value));

    if (user) {
      setLoading(true);
      try {
        await updateNotificationSettingsApi(value);
      } catch (err) {
        console.error('알림 설정 업데이트 실패:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const value = {
    notificationEnabled: enabled,
    setNotificationEnabled: setEnabled,
    notificationLoading: loading,
    fetchNotificationSettings,
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
