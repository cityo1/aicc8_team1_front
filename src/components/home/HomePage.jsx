import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Box, Typography, CircularProgress, LinearProgress, Stack } from '@mui/material';
import { useProfile } from '../../contexts/ProfileContext';
import { calculateDailyTargets } from '../common/calculateNutritionScore';

// Activity line graph data (Sun-Sat)
const ACTIVITY_DATA = [65, 82, 45, 90, 70, 95, 78];

// 기본 권장섭취량 (프로필 정보가 없을 때 사용)
const DEFAULT_TARGETS = {
  calories: 2100,
  carbs: 250,
  protein: 150,
  fat: 60,
  sugar: 50,
};

// 영양소별 색상 설정
const NUTRIENT_COLORS = {
  calories: '#ff8243',
  carbs: '#2dd4bf',
  sugars: '#a78bfa',
  protein: '#f59e0b',
  fat: '#ec4899',
};

/**
 * Nutri-Score 기반 간소화 영양점수 계산 (0~100점)
 *
 * 기본 점수 70점에서 시작
 * - 부정적 요소 (초과 시 감점): 칼로리, 당류, 지방
 * - 긍정적 요소 (달성 시 가점): 단백질, 균형 섭취
 *
 * @param {Object} intake - intakeData 형태의 영양소 객체
 * @returns {number} 0~100 사이의 영양점수
 */
const calculateNutritionScore = (intake) => {
  let score = 70;

  // === 부정적 점수 (초과 시 감점) ===

  // 칼로리: 120% 초과 시 감점 (최대 -20점)
  const calorieRatio = intake.calories.current / intake.calories.goal;
  if (calorieRatio > 1.2) {
    score -= Math.min((calorieRatio - 1.2) * 50, 20);
  }

  // 당류: 목표 초과 시 감점 (최대 -15점)
  const sugarRatio = intake.sugars.current / intake.sugars.goal;
  if (sugarRatio > 1) {
    score -= Math.min((sugarRatio - 1) * 30, 15);
  }

  // 지방: 목표 초과 시 감점 (최대 -15점)
  const fatRatio = intake.fat.current / intake.fat.goal;
  if (fatRatio > 1) {
    score -= Math.min((fatRatio - 1) * 30, 15);
  }

  // === 긍정적 점수 (달성 시 가점) ===

  // 단백질: 달성률에 비례 (최대 +20점)
  const proteinRatio = intake.protein.current / intake.protein.goal;
  score += Math.min(proteinRatio * 20, 20);

  // 칼로리 적정 섭취 보너스: 80~100% 시 +5점
  if (calorieRatio >= 0.8 && calorieRatio <= 1.0) {
    score += 5;
  }

  // 균형 보너스: 모든 영양소가 50% 이상 섭취 시 +5점
  const allAbove50 = Object.values(intake).every(
    (nutrient) => nutrient.current / nutrient.goal >= 0.5
  );
  if (allAbove50) {
    score += 5;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
};

function HomePage() {
  const { profile } = useProfile();

  // 프로필 기반 일일 권장섭취량 계산
  const dailyTargets = useMemo(() => {
    if (!profile?.height || !profile?.weight) {
      return DEFAULT_TARGETS;
    }
    return calculateDailyTargets(profile);
  }, [profile]);

  // Mock 섭취 데이터 - 추후 API 연동 시 교체
  const currentIntake = {
    calories: 1450,
    carbs: 180,
    sugars: 45,
    protein: 95,
    fat: 33,
  };

  // intakeData 구성 (프로필 기반 goal 적용)
  const intakeData = useMemo(() => ({
    calories: {
      current: currentIntake.calories,
      goal: dailyTargets.calories,
      unit: 'kcal',
      color: NUTRIENT_COLORS.calories,
    },
    carbs: {
      current: currentIntake.carbs,
      goal: dailyTargets.carbs,
      unit: 'g',
      color: NUTRIENT_COLORS.carbs,
    },
    sugars: {
      current: currentIntake.sugars,
      goal: dailyTargets.sugar,
      unit: 'g',
      color: NUTRIENT_COLORS.sugars,
    },
    protein: {
      current: currentIntake.protein,
      goal: dailyTargets.protein,
      unit: 'g',
      color: NUTRIENT_COLORS.protein,
    },
    fat: {
      current: currentIntake.fat,
      goal: dailyTargets.fat,
      unit: 'g',
      color: NUTRIENT_COLORS.fat,
    },
  }), [dailyTargets, currentIntake]);

  // 영양점수 계산
  const nutritionScore = useMemo(
    () => calculateNutritionScore(intakeData),
    [intakeData]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-4rem)] min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Left: Nutrition Score - 3분할 (Circle | Today's Intake | 격려) */}
      <div className="lg:row-span-2 bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] flex flex-col min-h-0 overflow-hidden">
        <h3
          className="text-lg font-semibold mb-2 shrink-0"
          style={{ color: 'var(--color-text)' }}
        >
          Nutrition Score
        </h3>
        {/* 1번: Circle 영역 - 1/3 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #e8ecf0',
            py: 2,
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            {/* 배경 원 */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={180}
              thickness={4}
              sx={{
                color: '#f1f5f9',
                position: 'absolute',
              }}
            />
            {/* 점수 원 */}
            <CircularProgress
              variant="determinate"
              value={nutritionScore}
              size={180}
              thickness={4}
              sx={{
                color: '#FF8243',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            {/* 중앙 텍스트 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h2"
                component="span"
                fontWeight={600}
                sx={{ color: 'text.primary', lineHeight: 1 }}
              >
                {nutritionScore}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                / 100점
              </Typography>
            </Box>
          </Box>
          {/* 점수 등급 표시 */}
          <Box
            sx={{
              mt: 2,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              bgcolor: nutritionScore >= 80 ? '#e8f5e9' : nutritionScore >= 50 ? '#fff3ed' : '#ffebee',
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                color: nutritionScore >= 80 ? '#2e7d32' : nutritionScore >= 50 ? '#E05A1F' : '#c62828',
              }}
            >
              {nutritionScore >= 80 ? '아주 좋아요!' : nutritionScore >= 50 ? '좋아요' : '노력이 필요해요'}
            </Typography>
          </Box>
        </Box>
        {/* 2번: Today's Intake 영역 - 1/3 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            py: 2,
            borderBottom: '1px solid #e8ecf0',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            fontWeight={600}
            sx={{ mb: 1.5, flexShrink: 0 }}
          >
            Today's Intake
          </Typography>
          <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {Object.entries(intakeData).map(
              ([key, { current, goal, unit, color }]) => (
                <Box key={key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {key === 'calories'
                        ? 'Calories'
                        : key === 'sugars'
                          ? 'Sugars'
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color }}>
                      {current.toLocaleString?.() ?? current}
                      <Typography component="span" variant="body2" color="text.disabled">
                        {' '}/ {goal.toLocaleString?.() ?? goal} {unit}
                      </Typography>
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((current / goal) * 100, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ),
            )}
          </Stack>
        </Box>
        {/* 3번: 격려 문구 영역 - 1/3 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 2,
            mt: 2,
            bgcolor: '#fff3ed',
            border: '1px solid #ffe0cc',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            component="span"
            sx={{ mb: 1 }}
          >
            {nutritionScore >= 80 ? '🌟' : nutritionScore >= 50 ? '✨' : '💪'}
          </Typography>
          <Typography
            variant="body1"
            fontWeight={600}
            color="text.primary"
            sx={{ lineHeight: 1.6 }}
          >
            오늘의 nutrition score는{' '}
            <Typography
              component="span"
              fontWeight={700}
              sx={{ color: '#FF8243' }}
            >
              {nutritionScore}점
            </Typography>
            입니다.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {nutritionScore >= 80
              ? '아주 높은 점수예요! 내일도 이런 기록을 유지해보자!'
              : nutritionScore >= 50
                ? '잘했어요!'
                : '좀 더 올려보자!'}
          </Typography>
        </Box>
      </div>

      {/* Right Top: AI Recommended Meal */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h3
            className="text-base font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            AI Recommended Meal
          </h3>
          <ChevronRight size={18} style={{ color: 'var(--color-brand)' }} />
        </div>
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden mb-2 bg-[var(--color-background)]">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"
            alt="Salmon salad"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-block px-2 py-0.5 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: 'rgba(255, 130, 67, 0.15)',
              color: 'var(--color-brand)',
            }}
          >
            Salad meal
          </span>
        </div>
      </div>

      {/* Right Bottom: Activity Summary - Line Graph */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] flex flex-col min-h-0 overflow-hidden">
        <h3
          className="text-base font-semibold mb-2 shrink-0"
          style={{ color: 'var(--color-text)' }}
        >
          Activity Summary
        </h3>
        <div className="flex-1 min-h-0 w-full flex flex-col">
          <svg
            viewBox="0 0 340 100"
            className="w-full flex-1 min-h-0"
            preserveAspectRatio="xMidYMid meet"
          >
            <polyline
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={ACTIVITY_DATA.map((val, i) => {
                const x = (i / (ACTIVITY_DATA.length - 1)) * 320 + 10;
                const y = 85 - (val / 100) * 70;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
        </div>
        <div className="flex justify-between mt-1 px-1 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span
              key={day}
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
