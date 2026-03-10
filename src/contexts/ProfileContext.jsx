import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { authApi } from '../api/auth';

const defaultProfile = {
  nickname: '',
  height: '',
  weight: '',
  goals: [],
  dietary: [],
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [profile, setProfileState] = useState(defaultProfile);

  // user 변경 시 프로필 상태 업데이트 (로그인 응답의 user 데이터 사용)
  useEffect(() => {
    if (!user) {
      setProfileState(defaultProfile);
      return;
    }

    // auth.user 데이터에서 프로필 추출
    const profileFromUser = {
      nickname: user.nickname ?? '',
      height: user.height != null ? String(user.height) : '',
      weight: user.weight != null ? String(user.weight) : '',
      goals: Array.isArray(user.goals) ? user.goals : [],
      dietary: Array.isArray(user.dietaryRestrictions)
        ? user.dietaryRestrictions
        : (Array.isArray(user.dietary) ? user.dietary : []),
    };

    setProfileState(profileFromUser);
  }, [user]);

  // 서버에서 프로필 조회 (GET /api/auth/me)
  const fetchProfile = useCallback(async () => {
    try {
      const data = await authApi.getProfile();

      // 응답이 { success, data: {...} } 형태인 경우 data 추출
      const userData = data.data || data.user || data;

      const fetched = {
        nickname: userData.nickname ?? '',
        height: userData.height != null ? String(userData.height) : '',
        weight: userData.weight != null ? String(userData.weight) : '',
        goals: Array.isArray(userData.goals) ? userData.goals : [],
        dietary: Array.isArray(userData.dietaryRestrictions)
          ? userData.dietaryRestrictions
          : (Array.isArray(userData.dietary) ? userData.dietary : []),
      };
      setProfileState(fetched);

      // localStorage의 user 데이터도 업데이트 (기존 user와 병합하여 id 등 유지)
      if (updateUser && user) {
        updateUser({ ...user, ...userData });
      }

      return fetched;
    } catch (err) {
      console.error('프로필 조회 실패:', err);
      throw err;
    }
  }, [updateUser, user]);

  // 프로필 로컬 상태 업데이트
  const updateProfile = useCallback((fieldOrUpdates, value) => {
    setProfileState((prev) => {
      const updates =
        typeof fieldOrUpdates === 'string'
          ? { [fieldOrUpdates]: value }
          : fieldOrUpdates;
      return { ...prev, ...updates };
    });
  }, []);

  const value = {
    profile,
    updateProfile,
    fetchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
