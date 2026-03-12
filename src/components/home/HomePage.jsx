import { useEffect, useState, useMemo } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  getNutritionGoals,
  getDailySummary,
  getDailySummaries,
  getTodayRecommend,
} from '../../api/nutrition.js';

// 최근 7일 fallback (데이터 없을 때)
const ACTIVITY_DATA_FALLBACK = [0, 0, 0, 0, 0, 0, 0];

// 영양소별 색상
const INTAKE_CONFIG = {
  calories: { unit: 'kcal', color: '#ff8243' },
  carbs: { unit: 'g', color: '#2dd4bf' },
  sugars: { unit: 'g', color: '#a78bfa' },
  protein: { unit: 'g', color: '#f59e0b' },
  fat: { unit: 'g', color: '#ec4899' },
};

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nutritionScore, setNutritionScore] = useState(0);
  const [intakeData, setIntakeData] = useState(null);
  const [activityData, setActivityData] = useState(ACTIVITY_DATA_FALLBACK);
  const [activitySummaries, setActivitySummaries] = useState([]);
  const [activityGoals, setActivityGoals] = useState(null);
  const [todayRecommend, setTodayRecommend] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const end = new Date(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const [goalsRes, summaryRes, summariesRes, recommendRes] =
          await Promise.all([
            getNutritionGoals(today),
            getDailySummary(today),
            getDailySummaries(startDate, endDate),
            getTodayRecommend(today).catch(() => null),
          ]);
        if (cancelled) return;

        const goals = goalsRes?.data ?? {};
        const summary = summaryRes?.data ?? {};

        const targetCal = Number(goals.targetCalories) || 0;
        const targetCarb = Number(goals.targetCarbohydrate) || 0;
        const targetSugar = Number(goals.targetSugars) || 0;
        const targetProtein = Number(goals.targetProtein) || 0;
        const targetFat = Number(goals.targetFat) || 0;

        setNutritionScore(Number(summary.score) || 0);
        setIntakeData({
          calories: {
            current: Number(summary.calories) || 0,
            goal: targetCal || 1,
            ...INTAKE_CONFIG.calories,
          },
          carbs: {
            current: Number(summary.carbohydrate) || 0,
            goal: targetCarb || 1,
            ...INTAKE_CONFIG.carbs,
          },
          sugars: {
            current: Number(summary.sugars) || 0,
            goal: targetSugar || 1,
            ...INTAKE_CONFIG.sugars,
          },
          protein: {
            current: Number(summary.protein) || 0,
            goal: targetProtein || 1,
            ...INTAKE_CONFIG.protein,
          },
          fat: {
            current: Number(summary.fat) || 0,
            goal: targetFat || 1,
            ...INTAKE_CONFIG.fat,
          },
        });

        const summaries = summariesRes?.data ?? [];
        const scoreByDate = Object.fromEntries(
          summaries.map((s) => [s.date, Number(s.score) || 0]),
        );
        const scores = [];
        for (
          let d = new Date(startDate);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          const key = d.toISOString().slice(0, 10);
          scores.push(scoreByDate[key] ?? 0);
        }
        setActivityData(scores.length > 0 ? scores : ACTIVITY_DATA_FALLBACK);
        setActivitySummaries(summaries);
        setActivityGoals(goals);
        setTodayRecommend(recommendRes?.data ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ??
            err?.message ??
            '데이터를 불러오는데 실패했습니다.',
        );
        setNutritionScore(0);
        setIntakeData(null);
        setActivityData(ACTIVITY_DATA_FALLBACK);
        setActivitySummaries([]);
        setActivityGoals(null);
        setTodayRecommend(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayData =
    intakeData ??
    Object.fromEntries(
      Object.entries(INTAKE_CONFIG).map(([k, v]) => [
        k,
        { current: 0, goal: 1, ...v },
      ]),
    );

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-[calc(100vh-4rem)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4"
        style={{ color: 'var(--color-text)' }}
      >
        <p className="text-lg">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          다시 시도
        </button>
      </div>
    );
  }

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
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center border-b border-[var(--color-border)] py-2">
          <div className="relative w-60 h-60 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(nutritionScore / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-bold text-4xl"
                style={{ color: 'var(--color-text)' }}
              >
                {nutritionScore}
              </span>
              <span
                className="text-xl"
                style={{ color: 'var(--color-text-muted)' }}
              >
                / 100점
              </span>
            </div>
          </div>
        </div>
        {/* 2번: Today's Intake 영역 - 1/3 */}
        <div className="flex-1 min-h-0 flex flex-col py-2 border-b border-[var(--color-border)] overflow-hidden">
          <p
            className="text-lg mb-1 w-full shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Today&apos;s Intake
          </p>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
            {Object.entries(displayData).map(
              ([key, { current, goal, unit, color }]) => (
                <div key={key} className="shrink-0">
                  <div className="flex justify-between text-lg mb-0.5">
                    <span style={{ color: 'var(--color-text)' }}>
                      {key === 'calories'
                        ? 'Calories'
                        : key === 'sugars'
                          ? 'Sugars'
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {current.toLocaleString?.() ?? current} /{' '}
                      {goal.toLocaleString?.() ?? goal} {unit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((current / goal) * 100, 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
        {/* 3번: 오늘의 추천 한 줄 문구 영역 - 1/3 */}
        <div
          className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-2 mt-4"
          style={{
            backgroundColor: 'rgba(255, 130, 67, 0.08)',
            border: '1px solid rgba(255, 130, 67, 0.2)',
            borderRadius: '0.75rem',
          }}
        >
          <p
            className="text-lg font-semibold leading-relaxed"
            style={{ color: 'var(--color-text)' }}
          >
            {todayRecommend?.message ?? (
              <>
                <span className="text-2xl block mb-0.5">✨</span>
                오늘도 건강한 하루 되세요!
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Top: AI Recommended Meal 미리보기 */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] flex flex-col min-h-0 overflow-hidden">
        <h3
          className="text-base font-semibold mb-3 shrink-0"
          style={{ color: 'var(--color-text)' }}
        >
          AI Recommended Meal
        </h3>

        {/* 태그 필터 미리보기 */}
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {['고단백', '다이어트', '채소', '저탄수', '저당', '과일'].map(
            (tag) => (
              <Link
                key={tag}
                to={{
                  pathname: '/home/recommendation',
                  state: { selectedTag: tag },
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 hover:bg-[#FF8243] hover:text-white transition-colors"
                style={{ color: '#64748b' }}
              >
                #{tag}
              </Link>
            ),
          )}
        </div>

        {/* 추천 식품 3개 미리보기 */}
        {todayRecommend?.foods?.length > 0 ? (
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 pb-2">
            {(todayRecommend.foods || []).slice(0, 3).map((food) => (
              <RecommendPreviewCard key={food.id} food={food} />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm py-8 text-gray-400">
            추천을 불러오는 중...
          </div>
        )}

        {/* Recommend 페이지 이동 버튼 */}
        <Link
          to="/home/recommendation"
          className="mt-4 shrink-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
          style={{ backgroundColor: '#FF8243' }}
        >
          식단 추천 페이지로 이동
          <ChevronRight size={18} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Right Middle: 최근 7일 영양 점수 추이 */}
      <ActivityScoreChart
        data={activityData.length ? activityData : ACTIVITY_DATA_FALLBACK}
        summaries={activitySummaries}
        goals={activityGoals}
      />
    </div>
  );
}

// ─── 추천 식품 미리보기 카드 (홈 전용, 가독성 개선) ─────────────────────────────────
function RecommendPreviewCard({ food }) {
  const items = [
    { label: '칼로리', val: food.kcal, unit: 'kcal', color: '#FF8243' },
    { label: '탄수화물', val: food.carbs, unit: 'g', color: '#6b7280' },
    { label: '단백질', val: food.protein, unit: 'g', color: '#059669' },
    { label: '지방', val: food.fat, unit: 'g', color: '#dc2626' },
    { label: '당', val: food.sugar, unit: 'g', color: '#7c3aed' },
  ];
  const format = (v, u) =>
    v != null && v !== ''
      ? `${Number(v).toFixed(u === 'kcal' ? 0 : 1)}${u}`
      : '-';

  return (
    <Link
      to="/home/recommendation"
      className="min-w-0 p-4 rounded-xl bg-gray-50/80 hover:bg-orange-50/80 border border-gray-100 hover:border-[#FF8243]/30 transition-all group flex flex-col"
    >
      <p
        className="font-semibold text-gray-800 truncate mb-3 group-hover:text-[#FF8243] transition-colors"
        title={food.name}
      >
        {food.name}
      </p>
      <div className="space-y-1.5 text-xs">
        {items.map(({ label, val, unit, color }) => (
          <div
            key={label}
            className="flex justify-between items-baseline gap-2"
          >
            <span className="text-gray-500 shrink-0">{label}</span>
            <span className="font-semibold tabular-nums" style={{ color }}>
              {format(val, unit)}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}

// 일일식사기록 영양 목표와 동일한 항목 (칼로리, 탄수화물, 단백질, 지방, 당류)
const NUTRIENT_ITEMS = [
  {
    key: 'calories',
    label: '칼로리',
    apiKey: 'calories',
    unit: 'kcal',
    color: '#FF8243',
  },
  {
    key: 'carbs',
    label: '탄수화물',
    apiKey: 'carbohydrate',
    unit: 'g',
    color: '#FFA726',
  },
  {
    key: 'protein',
    label: '단백질',
    apiKey: 'protein',
    unit: 'g',
    color: '#66BB6A',
  },
  { key: 'fat', label: '지방', apiKey: 'fat', unit: 'g', color: '#EF5350' },
  {
    key: 'sugars',
    label: '당류',
    apiKey: 'sugars',
    unit: 'g',
    color: '#AB47BC',
  },
];
const GOAL_KEYS = {
  calories: 'targetCalories',
  carbs: 'targetCarbohydrate',
  protein: 'targetProtein',
  fat: 'targetFat',
  sugars: 'targetSugars',
};

function ActivityScoreChart({ data: scores, summaries, goals }) {
  const chartData = useMemo(() => {
    const today = new Date();
    const summaryByDate = Object.fromEntries(
      (summaries || []).map((s) => [s.date, s]),
    );
    return scores.map((val, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (scores.length - 1 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const summary = summaryByDate[dateStr] || {};
      return {
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        dateStr,
        score: Math.min(val, 100),
        calories: Number(summary.calories) || 0,
        carbohydrate: Number(summary.carbohydrate) || 0,
        protein: Number(summary.protein) || 0,
        fat: Number(summary.fat) || 0,
        sugars: Number(summary.sugars) || 0,
      };
    });
  }, [scores, summaries]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const row = payload[0].payload;
    const hasGoals =
      goals &&
      (goals.targetCalories != null || goals.targetCarbohydrate != null);
    return (
      <div
        className="px-2.5 py-2 rounded-lg shadow-lg text-xs"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          minWidth: 140,
        }}
      >
        <div className="flex justify-between items-baseline mb-1.5">
          <span style={{ color: '#6b7280' }}>{row.day}</span>
          <span className="font-semibold ml-2" style={{ color: '#FF8243' }}>
            {row.score}점
          </span>
        </div>
        {hasGoals && (
          <div className="space-y-1">
            {NUTRIENT_ITEMS.map(({ key, label, apiKey, unit, color }) => {
              const current = row[apiKey] ?? 0;
              const goal = Number(goals[GOAL_KEYS[key]]) || 1;
              const pct = Math.min((current / goal) * 100, 100);
              const text =
                unit === 'kcal'
                  ? `${Math.round(current)} / ${Math.round(goal)}`
                  : `${Number(current).toFixed(1)} / ${Number(goal).toFixed(1)}`;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-gray-500 w-12 shrink-0">{label}</span>
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden min-w-[40px]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span
                    className="text-gray-700 font-medium shrink-0"
                    style={{ fontSize: 10 }}
                  >
                    {text} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {!hasGoals && <span className="text-gray-500">목표 데이터 없음</span>}
      </div>
    );
  };

  return (
    <div
      className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col min-h-0 overflow-hidden"
      style={{ minHeight: 220 }}
    >
      <div className="mb-3 shrink-0">
        <h3 className="text-base font-semibold text-gray-800">
          최근 7일 영양 점수
        </h3>
        <p className="text-xs mt-0.5 text-gray-500">
          일별 영양 균형 점수 (0~100점, 높을수록 균형이 좋음)
        </p>
      </div>
      <div className="flex-1 min-h-0 w-full" style={{ minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#e5e7eb', strokeDasharray: '4 2' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#FF8243"
              strokeWidth={2}
              dot={{ r: 4, fill: '#FF8243', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{
                r: 5,
                fill: '#FF8243',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HomePage;
