import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_PREFIX = 'profile_';

const defaultProfile = {
  nickname: '',
  height: '',
  weight: '',
  goals: [],
  dietary: [],
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState(defaultProfile);

  const storageKey = user?.id ? `${STORAGE_PREFIX}${user.id}` : null;

  // userId 변경 시 localStorage에서 프로필 로드 (auth.user 데이터와 병합)
  useEffect(() => {
    if (!user) {
      setProfileState(defaultProfile);
      return;
    }

    const merged = { ...defaultProfile };

    // 1) auth.user에서 가져올 수 있는 값
    if (user.nickname) merged.nickname = user.nickname;
    if (user.height != null) merged.height = String(user.height);
    if (user.weight != null) merged.weight = String(user.weight);
    if (Array.isArray(user.goals)) merged.goals = user.goals;
    if (Array.isArray(user.dietaryRestrictions)) merged.dietary = user.dietaryRestrictions;
    else if (Array.isArray(user.dietary)) merged.dietary = user.dietary;

    // 2) localStorage에 저장된 프로필이 있으면 우선 적용
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.nickname !== undefined) merged.nickname = parsed.nickname;
          if (parsed.height !== undefined) merged.height = String(parsed.height);
          if (parsed.weight !== undefined) merged.weight = String(parsed.weight);
          if (Array.isArray(parsed.goals)) merged.goals = parsed.goals;
          if (Array.isArray(parsed.dietary)) merged.dietary = parsed.dietary;
        }
      } catch {
        // JSON 파싱 실패 시 auth 병합값만 사용
      }
    }

    setProfileState(merged);
  }, [user, storageKey]);

  // 프로필 업데이트 시 localStorage에 저장
  const updateProfile = useCallback(
    (fieldOrUpdates, value) => {
      setProfileState((prev) => {
        const updates =
          typeof fieldOrUpdates === 'string'
            ? { [fieldOrUpdates]: value }
            : fieldOrUpdates;
        const next = { ...prev, ...updates };

        if (storageKey && typeof window !== 'undefined') {
          try {
            const toSave = {
              nickname: next.nickname ?? '',
              height: next.height ?? '',
              weight: next.weight ?? '',
              goals: next.goals ?? [],
              dietary: next.dietary ?? [],
            };
            localStorage.setItem(storageKey, JSON.stringify(toSave));
          } catch {
            // 저장 실패 무시
          }
        }

        return next;
      });
    },
    [storageKey]
  );

  const value = {
    profile,
    updateProfile,
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
