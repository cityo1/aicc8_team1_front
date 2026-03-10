import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Checkbox,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  TagFacesOutlined,
  MonitorWeight,
  FitnessCenter,
  Restaurant,
  FavoriteBorder,
  LocalDining,
  SpaOutlined,
  GrainOutlined,
  NoFood,
  Logout,
  PersonRemove,
  Save,
} from '@mui/icons-material';

// ─── 목표 / 식이 제한 옵션 (RegisterPage와 동일) ─────────────────────────────
const GOAL_OPTIONS = [
  {
    key: 'weight',
    label: '체중 관리',
    Icon: MonitorWeight,
    color: '#FF8243',
    bg: '#fff3ed',
  },
  {
    key: 'muscle',
    label: '근육 증가',
    Icon: FitnessCenter,
    color: '#5C6BC0',
    bg: '#e8eaf6',
  },
  {
    key: 'nutrition',
    label: '영양 균형',
    Icon: Restaurant,
    color: '#43A047',
    bg: '#e8f5e9',
  },
  {
    key: 'condition',
    label: '컨디션 관리',
    Icon: FavoriteBorder,
    color: '#EC407A',
    bg: '#fce4ec',
  },
];

const DIET_OPTIONS = [
  {
    key: 'lactose',
    label: '유당불내증',
    Icon: LocalDining,
    color: '#FFA726',
    bg: '#fff8e1',
  },
  {
    key: 'vegan',
    label: '채식주의',
    Icon: SpaOutlined,
    color: '#66BB6A',
    bg: '#e8f5e9',
  },
  {
    key: 'gluten',
    label: '글루텐 프리',
    Icon: GrainOutlined,
    color: '#8D6E63',
    bg: '#efebe9',
  },
  {
    key: 'nut',
    label: '견과류 알레르기',
    Icon: NoFood,
    color: '#EF5350',
    bg: '#ffebee',
  },
];

const textFieldFocusStyle = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#FF8243',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#FF8243',
  },
};

function CheckboxGrid({ options, selected, onChange }) {
  const toggle = (key) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      {options.map(({ key, label, Icon, color, bg }) => {
        const checked = selected.includes(key);
        return (
          <Box
            key={key}
            onClick={() => toggle(key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.5,
              py: 1.2,
              borderRadius: 2,
              cursor: 'pointer',
              border: `1.5px solid ${checked ? color : '#e8ecf0'}`,
              bgcolor: checked ? bg : '#fafafa',
              transition: 'all 0.15s',
              '&:hover': { borderColor: color, bgcolor: bg },
            }}
          >
            <Checkbox
              checked={checked}
              size="small"
              sx={{ p: 0, color: '#cbd5e1', '&.Mui-checked': { color } }}
            />
            <Icon sx={{ fontSize: 18, color: checked ? color : '#94a3b8' }} />
            <Typography
              variant="body2"
              fontWeight={checked ? 700 : 400}
              sx={{
                color: checked ? color : 'text.primary',
                fontSize: '0.82rem',
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default function Setting() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { profile, updateProfile, fetchProfile } = useProfile();
  const { notificationEnabled, setNotificationEnabled, notificationLoading } = useNotification();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // 로컬 form 상태 (수정하기 버튼 누르기 전까지 sidebar에 반영되지 않음)
  const [form, setForm] = useState({
    nickname: '',
    height: '',
    weight: '',
    goals: [],
    dietary: [],
  });

  // 페이지 진입 시 서버에서 최신 프로필 조회 (마운트 시 1회)
  useEffect(() => {
    fetchProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // profile이 변경되면 로컬 form 상태 초기화
  useEffect(() => {
    setForm({
      nickname: profile.nickname || '',
      height: profile.height || '',
      weight: profile.weight || '',
      goals: profile.goals || [],
      dietary: profile.dietary || [],
    });
  }, [profile]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await authApi.updateProfile({
        nickname: form.nickname,
        height: Number(form.height) || 0,
        weight: Number(form.weight) || 0,
        goals: form.goals,
        dietaryRestrictions: form.dietary,
      });
      // 수정 성공 후 서버에서 최신 데이터 다시 조회 (sidebar 업데이트)
      await fetchProfile();
      setInfoMessage('프로필이 성공적으로 수정되었습니다.');
    } catch (err) {
      setError(err.message || '프로필 수정에 실패했습니다.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setError('');
    try {
      await authApi.logout();
    } catch {
      // 서버 오류 시에도 로컬 로그아웃 진행
    } finally {
      auth.logout();
      navigate('/login');
      setLogoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await authApi.withdraw();
      setDeleteDialogOpen(false);
      auth.logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || '회원탈퇴에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <div className="bg-[#F2F9F5] text-[#1E2923] w-full max-w-2xl mx-auto rounded-2xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
          환경설정
        </h2>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {infoMessage && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {infoMessage}
          </Alert>
        )}

        {/* ── 프로필 정보 (회원가입 폼과 동일한 형태) ── */}
        <Box className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="text.secondary"
            mb={2}
          >
            프로필 정보
          </Typography>

          {/* 닉네임 */}
          <TextField
            fullWidth
            label="닉네임"
            value={form.nickname}
            onChange={(e) => handleFormChange('nickname', e.target.value)}
            placeholder="앱에서 사용할 이름"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TagFacesOutlined
                    sx={{ color: 'text.secondary', fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, ...textFieldFocusStyle }}
          />

          {/* 키 / 몸무게 */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              fullWidth
              label="키"
              type="number"
              value={form.height}
              onChange={(e) => handleFormChange('height', e.target.value)}
              placeholder="170"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      cm
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ ...textFieldFocusStyle }}
            />
            <TextField
              fullWidth
              label="몸무게"
              type="number"
              value={form.weight}
              onChange={(e) => handleFormChange('weight', e.target.value)}
              placeholder="65"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      kg
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ ...textFieldFocusStyle }}
            />
          </Box>

          {/* 목표 선택 */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                mb: 1.5,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                color="text.secondary"
              >
                목표 선택
              </Typography>
              <Typography variant="caption" color="text.disabled">
                중복 선택 가능
              </Typography>
            </Box>
            <CheckboxGrid
              options={GOAL_OPTIONS}
              selected={form.goals}
              onChange={(v) => handleFormChange('goals', v)}
            />
          </Box>

          {/* 식이 제한 */}
          <Box sx={{ mb: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                mb: 1.5,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                color="text.secondary"
              >
                식이 제한
              </Typography>
              <Typography variant="caption" color="text.disabled">
                해당하는 항목 선택
              </Typography>
            </Box>
            <CheckboxGrid
              options={DIET_OPTIONS}
              selected={form.dietary}
              onChange={(v) => handleFormChange('dietary', v)}
            />
          </Box>

          {/* 수정하기 버튼 */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSaveProfile}
            disabled={saveLoading}
            startIcon={<Save />}
            sx={{
              mt: 3,
              py: 1.5,
              bgcolor: '#FF8243',
              '&:hover': { bgcolor: '#E05A1F' },
            }}
          >
            {saveLoading ? '저장 중...' : '수정하기'}
          </Button>
        </Box>

        {/* ── 알림 설정 ── */}
        <Box className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.secondary"
            >
              알림 설정
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationEnabled}
                  onChange={(e) => setNotificationEnabled(e.target.checked)}
                  disabled={notificationLoading}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FF8243',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FF8243',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  {notificationLoading ? '저장 중...' : notificationEnabled ? '알림 켜짐' : '알림 꺼짐'}
                </Typography>
              }
            />
          </Box>
        </Box>

        {/* ── 로그아웃 / 회원탈퇴 ── */}
        <Box className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleLogout}
            disabled={logoutLoading}
            startIcon={<Logout />}
            sx={{
              py: 1.5,
              borderColor: '#e2e8f0',
              color: 'text.secondary',
              '&:hover': {
                borderColor: '#FF8243',
                color: '#FF8243',
                bgcolor: '#fff3ed',
              },
            }}
          >
            로그아웃
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<PersonRemove />}
            sx={{
              py: 1.5,
              borderColor: '#fecaca',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: '#fef2f2',
              },
            }}
          >
            회원탈퇴
          </Button>
        </Box>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 320 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>회원탈퇴 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 회원탈퇴 하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할
            수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            sx={{ color: 'text.secondary' }}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            sx={{
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            {deleteLoading ? '처리 중...' : '탈퇴하기'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
