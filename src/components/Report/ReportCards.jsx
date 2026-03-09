import React from 'react';

const NutrientItem = ({ name, amount, percentage, type }) => {
  const isExcess = type === 'excess';
  const accentColor = isExcess ? 'text-rose-600' : 'text-sky-600';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 shadow-sm min-h-[110px] flex flex-col justify-between transition-transform hover:scale-[1.02]">
      <div className="text-[16px] font-extrabold text-gray-800 tracking-tight">
        {name}
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">
            {isExcess ? '초과 섭취량' : '부족 섭취량'}
          </span>
          <span className={`${accentColor} font-black text-sm`}>{amount}</span>
        </div>

        <div className="text-right">
          <span className={`text-2xl font-black ${accentColor}`}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

const ReportCards = ({ nutritionData }) => {
  if (!nutritionData) {
    return (
      <div className="p-4 text-gray-400 text-center">데이터가 없습니다.</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      {/* 과잉 섹션 */}
      <div className="p-4 rounded-3xl flex flex-col bg-rose-50/50 border border-rose-100">
        <h4 className="text-center text-l font-black text-rose-600 mb-4 pb-3 border-b-2 border-rose-200/50">
          과잉 영양소
        </h4>
        <div className="flex-1 overflow-y-auto pr-1">
          {nutritionData.excess?.map((item) => (
            <NutrientItem key={item.id} {...item} type="excess" />
          ))}
        </div>
      </div>

      {/* 결핍 섹션 */}
      <div className="p-4 rounded-3xl flex flex-col bg-sky-50/50 border border-indigo-100">
        <h4 className="text-center text-l font-black text-sky-600 mb-4 pb-3 border-b-2 border-sky-200/50">
          결핍 영양소
        </h4>
        <div className="flex-1 overflow-y-auto pr-1 ">
          {nutritionData.deficiency?.map((item) => (
            <NutrientItem key={item.id} {...item} type="deficiency" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportCards;
