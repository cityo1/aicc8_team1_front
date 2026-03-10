import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import { Bell, BellOff, Info, Utensils, BarChart3, Sparkles, Award, Flame } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

/** createdAt(ISO 문자열)을 "오전 8:00", "어제", "2일 전" 등으로 포맷 */
function formatNotificationTime(createdAt) {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h < 12 ? '오전' : '오후';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${ampm} ${hour}:${String(m).padStart(2, '0')}`;
  }
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return date.toLocaleDateString('ko-KR');
}

/** type에 따른 아이콘/스타일 반환 */
function getNotificationStyle(type) {
  const styles = {
    meal: { bg: 'bg-orange-100', icon: Utensils, color: 'text-orange-600' },
    meal_nudge: { bg: 'bg-orange-100', icon: Utensils, color: 'text-orange-600' },
    report: { bg: 'bg-emerald-100', icon: BarChart3, color: 'text-emerald-600' },
    weekly_report: { bg: 'bg-emerald-100', icon: BarChart3, color: 'text-emerald-600' },
    tip: { bg: 'bg-sky-100', icon: Info, color: 'text-sky-600' },
    insight_sugar_fat: { bg: 'bg-amber-100', icon: Sparkles, color: 'text-amber-600' },
    insight_protein: { bg: 'bg-amber-100', icon: Sparkles, color: 'text-amber-600' },
    recommendation_tomorrow: { bg: 'bg-violet-100', icon: Sparkles, color: 'text-violet-600' },
    recommendation_menu: { bg: 'bg-violet-100', icon: Sparkles, color: 'text-violet-600' },
    streak: { bg: 'bg-rose-100', icon: Flame, color: 'text-rose-600' },
    goal_achievement: { bg: 'bg-emerald-100', icon: Award, color: 'text-emerald-600' },
  };
  return styles[type] ?? { bg: 'bg-sky-100', icon: Info, color: 'text-gray-600' };
}

export default function Alert() {
  const { notificationEnabled } = useNotification();
  const { updateToken: authUpdateToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const doFetch = async (token) => {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, code: json.code, message: json.message ?? `요청 실패 (${res.status})` };
    return json.data ?? json ?? [];
  };

  const fetchNotifications = useCallback(async (retried = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await doFetch(token);
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      if (!retried && (err.status === 401 || err.code === 'TOKEN_EXPIRED')) {
        try {
          const data = await authApi.refresh();
          const newToken = data.token;
          localStorage.setItem('accessToken', newToken);
          authUpdateToken?.(newToken);
          const list = await doFetch(newToken);
          setNotifications(Array.isArray(list) ? list : []);
          setError(null);
          return;
        } catch {
          setError('다시 로그인해 주세요.');
          setNotifications([]);
        }
      } else {
        setError(err.message ?? '알림을 불러오지 못했어요');
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, [authUpdateToken]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // 무시
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.read) markAsRead(item.id);
  };

  const createTestNotifications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) fetchNotifications();
      else setError(json.message ?? '테스트 알림 생성 실패');
    } catch {
      setError('테스트 알림 생성 실패');
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <div className="bg-[#F2F9F5] text-[#1E2923] w-full max-w-2xl mx-auto rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-0 pb-0">
            알림
          </h2>
        </div>

        {notificationEnabled ? (
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-500">알림을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-amber-600 font-medium">알림을 불러오지 못했어요</p>
                <p className="text-gray-500 text-sm mt-1">{error}</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => {
                const style = getNotificationStyle(item.type);
                const Icon = style.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(item)}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${
                      !item.read ? 'border-l-4 border-l-[#FF8243]' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}
                      >
                        <Icon size={20} className={style.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-0.5">
                          {item.message}
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {formatNotificationTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">알림이 없습니다</p>
                <p className="text-gray-400 text-sm mt-1">
                  새로운 알림이 오면 여기에 표시됩니다.
                </p>
                <button
                  type="button"
                  onClick={createTestNotifications}
                  className="mt-4 px-4 py-2 text-sm font-medium text-[#FF8243] bg-orange-50 rounded-lg hover:bg-orange-100"
                >
                  테스트 알림 생성
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BellOff size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">알림이 꺼져 있습니다</p>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
              환경설정에서 알림을 켜면 식사 기록, 주간 리포트 등 유용한 알림을
              받을 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
