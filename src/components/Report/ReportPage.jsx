import React from 'react';
import {
  NutrientRadarChart,
  GoalBarChart,
  WeeklyLineChart,
} from './ReportCharts';

const ReportPage = () => {
  // 샘플 데이터
  const radarData = [
    { subject: '탄수화물', value: 80 },
    { subject: '단백질', value: 90 },
    { subject: '지방', value: 60 },
    { subject: '비타민', value: 70 },
    { subject: '식이섬유', value: 85 },
  ];

  const barData = [
    { name: '칼로리', diff: 5 },
    { name: '탄수화물', diff: -15 },
    { name: '단백질', diff: 10 },
    { name: '지방', diff: 12 },
    { name: '당류', diff: -15 },
    { name: '비타민', diff: 7 },
  ];

  const lineData = [
    {
      day: '2/25',
      kcal: 1800,
      carbohydrate: 500,
      protein: 60,
      fat: 400,
      sugars: 500,
      vitamin: 50,
    },
    {
      day: '2/26',
      kcal: 2100,
      carbohydrate: 500,
      protein: 70,
      fat: 300,
      sugars: 200,
      vitamin: 1000,
    },
    {
      day: '2/27',
      kcal: 1900,
      carbohydrate: 500,
      protein: 65,
      fat: 400,
      sugars: 500,
      vitamin: 50,
    },
    {
      day: '2/28',
      kcal: 2200,
      carbohydrate: 500,
      protein: 80,
      fat: 300,
      sugars: 200,
      vitamin: 1000,
    },
    {
      day: '3/01',
      kcal: 1700,
      carbohydrate: 500,
      protein: 55,
      fat: 400,
      sugars: 500,
      vitamin: 50,
    },
    {
      day: '3/02',
      kcal: 2000,
      carbohydrate: 500,
      protein: 75,
      fat: 300,
      sugars: 200,
      vitamin: 1000,
    },
    {
      day: '3/03',
      kcal: 1950,
      carbohydrate: 500,
      protein: 68,
      fat: 400,
      sugars: 500,
      vitamin: 50,
    },
  ];

  return (
    <div className="p-6 bg-[#F2F9F5] min-h-screen text-[#1E2923]">
      {/* 상단 헤더 섹션 */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white flex p-4 rounded-lg shadow-sm flex-1 mr-4 border-l-4 border-[#FF8243]">
          <p className="font-semibold text-gray-600">
            홍길동 님의 영양 점수는{' '}
            <span className="text-[#FF8243] font-bold text-xl">85점</span>{' '}
            입니다. <span className="ml-4 text-green-500">▲ 5</span>
          </p>
        </div>
        <button
          className="bg-[#1E2923] text-white px-6 py-4 rounded-lg font-medium hover:bg-black transition-colors"
          onClick={() => {
            window.print();
          }}
        >
          PDF로 저장
        </button>
      </div>

      {/* 그리드 레이아웃 */}
      <div className="grid grid-cols-24 gap-4">
        {/* 왼쪽 & 중앙 차트 영역 */}
        <div className="col-span-16 grid grid-cols-10 gap-4">
          {' '}
          {/* 내부 그리드를 10칸으로 분할 */}
          {/* 1. 영양 밸런스 (크기 축소: 4칸 차지) */}
          <div className="col-span-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">영양 밸런스</h3>
            {/* 차트의 높이도 살짝 줄이고 싶다면 RadarChart 컴포넌트 내부의 height를 조절하세요 */}
            <NutrientRadarChart data={radarData} />
          </div>
          {/* 2. 목표 달성률 (크기 확대: 6칸 차지) */}
          <div className="col-span-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">목표 달성률</h3>
            <GoalBarChart data={barData} />
          </div>
          {/* 3. 7일간 변화 추이 (전체 너비 유지) */}
          <div className="col-span-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">7일간 변화 추이</h3>
            <WeeklyLineChart data={lineData} />
          </div>
        </div>

        {/* 우측 AI 리뷰 영역 */}
        <div className="col-span-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-xl mb-6 flex items-center">
            <span className="mr-2">✨</span> AI의 리뷰
          </h3>
          <div className="flex-1 space-y-4 text-gray-700 leading-relaxed">
            <p className="bg-[#F2F9F5] p-4 rounded-lg border-l-4 border-[#FF8243]">
              "이번 주 단백질 섭취량이 목표 대비 15% 상승했습니다! 아주 좋은
              흐름이에요."
            </p>
            <p>
              전체적으로 탄단지 비율이 안정적이지만, 목요일에 나트륨 섭취가 다소
              높았습니다. 주말에는 가벼운 채소 위주의 식단을 추천드려요.
            </p>
            <div className="pt-5 border-t border-gray-100">
              <h4 className="font-bold text-[#FF8243] mb-3">추천 개선안</h4>
              <ul className="list-disc ml-5 space-y-2 text-sm">
                <li>오전 공복에 미지근한 물 한 잔</li> {/* 조언 1 */}
                <li>오후 간식으로 견과류 20g 섭취</li> {/* 조언 2 */}
                <li>저녁 식사 시 식이섬유 먼저 먹기</li> {/* 조언 3 */}
              </ul>
            </div>
            <div className="pt-5 border-t border-gray-100">
              <h4 className="font-bold text-[#FF8243] mb-3"> 추천 식단</h4>
              <ul className="list-disc ml-5 text-sm">
                <div className="flex flex-col">
                  <div className="bg-white border-[#FF8243] rounded-lg p-12 mb-5">
                    카드
                  </div>
                  <div className="bg-white border-[#FF8243] rounded-lg p-12 mb-5">
                    카드
                  </div>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
