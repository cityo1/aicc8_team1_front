import React, { useRef } from 'react';
import { toPng } from 'html-to-image'; // html2canvas 대신 사용
import { jsPDF } from 'jspdf';
import {
  NutrientRadarChart,
  GoalBarChart,
  WeeklyLineChart,
} from './ReportCharts';

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

  // PDF 저장 함수 (수정됨)
  const handleDownloadPdf = async () => {
    if (reportRef.current === null) return;

    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: '#F2F9F5',
        pixelRatio: 3,
      });

      // 가로형 PDF 생성
      const pdf = new jsPDF('l', 'mm', 'a4');

      // 용지 및 이미지 속성 가져오기 (a4 용지)
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm

      // 배율 설정
      const scale = 0.9;
      const imgWidth = pageWidth * scale;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // 중앙 정렬 좌표 계산
      const marginLeft = (pageWidth - imgWidth) / 2;
      const marginTop = (pageHeight - imgHeight) / 2;

      // 이미지 추가 및 저장
      pdf.addImage(dataUrl, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);
      pdf.save(`영양리포트_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* 버튼 영역  */}
      <div className="max-w-[1200px] mx-auto flex justify-end mb-4">
        <button
          onClick={handleDownloadPdf}
          className="bg-[#1E2923] text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition-all shadow-lg active:scale-95"
        >
          리포트 PDF 저장
        </button>
      </div>

      {/* --- PDF 변환 대상 영역 시작 --- */}
      <div
        ref={reportRef}
        className=" bg-[#F2F9F5] text-[#1E2923] w-full mx-auto rounded-2xl border border-gray-100"
      >
        {/* 상단 요약 카드 */}
        <div className="bg-white flex p-5 rounded-xl shadow-sm mb-6 border-l-8 border-[#FF8243]">
          <p className="font-semibold text-gray-700 text-lg">
            홍길동 님의 영양 점수는{' '}
            <span className="text-[#FF8243] font-extrabold text-2xl">85점</span>{' '}
            입니다.{' '}
            <span className="ml-4 text-green-500 text-sm">▲ 5.2% 상향</span>
          </p>
        </div>

        {/* 그리드 레이아웃 */}
        <div className="grid grid-cols-24 gap-6">
          <div className="col-span-16 grid grid-cols-10 gap-6">
            {/* 1. 영양 밸런스 */}
            <div className="col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">
                영양 밸런스
              </h3>
              <NutrientRadarChart data={radarData} />
            </div>

            {/* 2. 목표 달성률 */}
            <div className="col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">
                목표 달성률
              </h3>
              <GoalBarChart data={barData} />
            </div>

            {/* 3. 7일간 변화 추이 */}
            <div className="col-span-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-6 text-gray-800 border-b pb-2">
                7일간 변화 추이
              </h3>
              <WeeklyLineChart data={lineData} />
            </div>
          </div>

          {/* 우측 AI 리뷰 영역 */}
          <div className="col-span-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-xl mb-6 flex items-center text-gray-800">
              <span className="mr-2">✨</span> AI 영양사 리뷰
            </h3>
            <div className="flex-1 space-y-6 text-gray-700 leading-relaxed">
              <div className="bg-[#F2F9F5] p-5 rounded-xl border-l-4 border-[#FF8243] ">
                "단백질 섭취가 매우 우수합니다. 다만 비타민 부족이 관찰되니 과일
                섭취를 늘려보세요."
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
                  <div className="bg-orange-50 p-4 rounded-lg text-sm border border-orange-100">
                    <strong>아침:</strong> 그릭 요거트와 블루베리
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-sm border border-orange-100">
                    <strong>점심:</strong> 연어 스테이크와 구운 채소
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-sm border border-orange-100">
                    <strong>저녁:</strong> 연어 스테이크와 구운 채소
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
