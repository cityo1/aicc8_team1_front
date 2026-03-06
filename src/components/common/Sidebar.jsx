import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Utensils,
  Search,
  ClipboardList,
  BarChart3,
  Bell,
  BellOff,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useNotification } from '../../contexts/NotificationContext';
import { authApi } from '../../api/auth';

const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { profile } = useProfile();
  const { notificationEnabled } = useNotification();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/home', icon: <Home size={20} />, label: '홈' },
    {
      path: '/home/recommendation',
      icon: <Utensils size={20} />,
      label: '식단추천',
    },
    { path: '/home/scanAnalysis', icon: <Search size={20} />, label: 'AI 식단분석' },
    {
      path: '/home/dailyLog',
      icon: <ClipboardList size={20} />,
      label: '일일식사기록',
    },
    {
      path: '/home/report',
      icon: <BarChart3 size={20} />,
      label: '주간/월간리포트',
    },
  ];

  const bottomItems = [
    {
      path: '/home/notifications',
      icon: notificationEnabled ? <Bell size={18} /> : <BellOff size={18} />,
      label: notificationEnabled ? '알림' : '알림 꺼짐',
    },
    { path: '/home/settings', icon: <Settings size={18} />, label: '환경설정' },
  ];

  const navLinkClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive
        ? 'bg-[#f2f9f5]/20 text-[#f2f9f5] shadow-md font-semibold'
        : 'text-[#f2f9f5] hover:bg-[#f2f9f5]/10'
    }`;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // 서버 로그아웃 실패해도 클라이언트는 로그아웃 처리
    }
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col py-8 px-4 fixed left-0 top-0 z-20 shrink-0 border-r border-[#ff8243]/20"
      style={{ backgroundColor: '#ff8243' }}
    >
      <div className="flex items-center gap-2 px-4 mb-10 shrink-0">
        <img
          src="/logo1.png"
          alt="HoneyMat"
          className="h-12 w-auto object-contain"
        />
        <h1 className="text-xl font-bold" style={{ color: '#f2f9f5' }}>
          HoneyMat
        </h1>
      </div>

      <nav className="flex-1 space-y-2 min-h-0 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navLinkClass}
            end={item.path === '/home'}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[#f2f9f5]/30 pt-6 pb-6 space-y-1 shrink-0">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? 'font-bold' : ''}`
            }
            style={{ color: 'var(--color-background)' }}
          >
            {item.icon} <span>{item.label}</span>
          </NavLink>
        ))}

        {/* 로그인/로그아웃 영역 */}
        {isAuthenticated ? (
          <div className="pt-2">
            <div
              className="flex items-center gap-3 px-4 py-2 text-sm"
              style={{ color: 'var(--color-background)' }}
            >
              <User size={18} />
              <span className="font-semibold">
                {profile?.nickname || user?.nickname || '사용자'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[#f2f9f5]/10 rounded-lg"
              style={{ color: 'var(--color-background)' }}
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? 'font-bold' : ''}`
            }
            style={{ color: 'var(--color-background)' }}
          >
            <User size={18} /> <span>로그인</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
