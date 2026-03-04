import { ChevronRight } from 'lucide-react';

// Activity line graph data (Sun-Sat)
const ACTIVITY_DATA = [65, 82, 45, 90, 70, 95, 78];

// Mock data - 추후 API 연동 시 교체
const NUTRITION_SCORE = 72; // 종합영양점수 0~100
const INTAKE_DATA = {
  calories: { current: 1450, goal: 2100, unit: 'kcal', color: '#ff8243' },
  carbs: { current: 180, goal: 250, unit: 'g', color: '#2dd4bf' },
  sugars: { current: 45, goal: 50, unit: 'g', color: '#a78bfa' },
  protein: { current: 95, goal: 150, unit: 'g', color: '#f59e0b' },
  fat: { current: 33, goal: 60, unit: 'g', color: '#ec4899' },
};

function HomePage() {
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
                strokeDasharray={`${(NUTRITION_SCORE / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-bold text-4xl"
                style={{ color: 'var(--color-text)' }}
              >
                {NUTRITION_SCORE}
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
            {Object.entries(INTAKE_DATA).map(
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
        {/* 3번: 격려 문구 영역 - 1/3 */}
        <div
          className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-2 mt-4"
          style={{
            backgroundColor: 'rgba(255, 130, 67, 0.08)',
            border: '1px solid rgba(255, 130, 67, 0.2)',
            borderRadius: '0.75rem',
          }}
        >
          <p
            className="text-xl font-semibold leading-relaxed"
            style={{ color: 'var(--color-text)' }}
          >
            {NUTRITION_SCORE < 50 ? (
              <>
                <span className="text-3xl block mb-0.5">💪</span>
                오늘의 nutrition score는 {NUTRITION_SCORE}점입니다.
                <br />좀 더 올려보자!
              </>
            ) : NUTRITION_SCORE < 80 ? (
              <>
                <span className="text-3xl block mb-0.5">✨</span>
                오늘의 nutrition score는 {NUTRITION_SCORE}점입니다.
                <br />
                잘했어요!
              </>
            ) : (
              <>
                <span className="text-3xl block mb-0.5">🌟</span>
                오늘의 nutrition score는 {NUTRITION_SCORE}점입니다.
                <br />
                아주 높은 점수예요! 내일도 이런 기록을 유지해보자!
              </>
            )}
          </p>
        </div>
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
