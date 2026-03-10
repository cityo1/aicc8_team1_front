import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { userApi } from '../api/auth';

const STORAGE_KEY = 'notificationEnabled';

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
      const data = await userApi.getNotificationSettings();
      const userData = data.data || data;
      const serverEnabled = userData.receiveNotifications ?? true;
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
        console.log('PUT /api/users/me/notification-settings 요청:', { receiveNotifications: value });
        const response = await userApi.updateNotificationSettings(value);
        console.log('PUT /api/users/me/notification-settings 응답:', response);
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
