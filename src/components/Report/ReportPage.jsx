import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  NutrientRadarChart,
  GoalBarChart,
  WeeklyLineChart,
} from './ReportCharts';
import { PiChefHat } from 'react-icons/pi';

const ReportPage = () => {
  const reportRef = useRef(null);

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

  // PDF 저장 함수
  const handleDownloadPdf = async () => {
    if (reportRef.current === null) return;
    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 3,
      });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const scale = 1;
      const imgWidth = pageWidth * scale;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const marginLeft = (pageWidth - imgWidth) / 2;
      const marginTop = (pageHeight - imgHeight) / 2;
      pdf.addImage(dataUrl, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);
      pdf.save(`영양리포트_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <div
        ref={reportRef}
        className=" bg-[#F2F9F5] text-[#1E2923] w-full mx-auto rounded-2xl border border-gray-100 p-6"
      >
        <div className="grid grid-cols-24 gap-6">
          <div className="col-span-16 flex flex-col gap-6">
            {/* 상단 요약 카드 */}
            <div className="bg-white flex justify-between items-center p-6 rounded-xl shadow-sm border-l-8 border-[#FF8243]">
              <h2 className="font-semibold text-gray-700 text-lg flex-shrink-0 mr-4">
                <span className="text-gray-900 font-bold">홍길동</span> 님의
                영양 점수는{' '}
                <span className="text-[#FF8243] font-bold text-[22px]">
                  85점
                </span>{' '}
                입니다.
              </h2>

              {/* 대비 섹션: 같은 줄 유지 */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* 지난 주 대비 */}
                <div className="flex items-center whitespace-nowrap gap-2">
                  <span className="text-gray-500 text-sm flex-shrink-0">
                    지난 주 대비
                  </span>
                  <div className="flex items-center gap-1.5 min-w-[100px]">
                    <span className="text-gray-700 font-bold text-[15px]">
                      - <span>10.30</span>점
                    </span>
                    <span className="text-sky-400 font-bold text-[15px]">
                      ▼ <span>4.0</span>%
                    </span>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="w-[2px] h-7 bg-gray-200"></div>

                {/* 지난 달 대비 */}
                <div className="flex items-center whitespace-nowrap gap-2">
                  <span className="text-gray-500 text-sm flex-shrink-0">
                    지난 달 대비
                  </span>
                  <div className="flex items-center gap-1.5 min-w-[100px]">
                    <span className="text-gray-700 font-bold text-[15px]">
                      + <span>5.21</span>점
                    </span>
                    <span className="text-emerald-500 font-bold text-[15px]">
                      ▲ <span>9.8</span>%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 영양 밸런스, 목표 달성률 */}
            <div className="grid grid-cols-10 gap-6">
              <div className="col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">
                  영양 밸런스
                </h3>
                <NutrientRadarChart data={radarData} />
              </div>
              <div className="col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">
                  목표 달성률
                </h3>
                <GoalBarChart data={barData} />
              </div>
            </div>

            {/* 7일간 변화 추이 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">
                7일간 변화 추이
              </h3>
              <WeeklyLineChart data={lineData} />
            </div>
          </div>

          {/* AI 리뷰 */}
          <div className="col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-xl mb-6 flex items-center text-gray-800">
              <span className="mr-2">
                <PiChefHat size={25} color="#FF8243" />
              </span>{' '}
              AI 영양사 리뷰
            </h3>
            <div className="flex-1 space-y-6 text-gray-700 leading-relaxed">
              <div className="relative">
                <div className="absolute -top-3 left-6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-bottom-[12px] border-b-[#FF8243]"></div>
                <div className="bg-white p-6 rounded-2xl border-2 border-[#FF8243] relative shadow-sm">
                  <p className="font-medium text-[#1E2923]">
                    "단백질 섭취가 매우 우수합니다. 다만 비타민 부족이 관찰되니
                    과일 섭취를 늘려보세요."
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-[#FF8243]">개선 포인트</h4>
                <ul className="list-disc ml-5 space-y-2 text-sm text-gray-600">
                  <li>정제 탄수화물(흰 쌀밥) 대신 잡곡밥 선택</li>
                  <li>하루 물 2L 섭취 루틴 유지하기</li>
                  <li>취침 3시간 전 금식 실천</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-[#FF8243] mb-4">
                  추천 식단 구성
                </h4>
                <div className="space-y-3">
                  {['아침', '점심', '저녁'].map((meal) => (
                    <div
                      key={meal}
                      className="bg-orange-50 p-4 rounded-lg text-sm border border-orange-100"
                    >
                      <strong>{meal}:</strong> 훈제연어 스테이크
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="items-center justify-center mx-auto flex mb-4 mt-4">
        <button
          onClick={handleDownloadPdf}
          className="bg-[#FF8243] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#ff8243c9] transition-all shadow-lg active:scale-95"
        >
          PDF로 저장
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
