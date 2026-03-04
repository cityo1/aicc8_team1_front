import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl border border-dashed border-gray-200">
      <h2 className="text-2xl font-bold text-[#1e2923] mb-2">{title}</h2>
      <p className="text-gray-400">
        이 페이지는 현재 준비 중입니다. HoneyMat의 멋진 기능을 기대해주세요!
      </p>
    </div>
  );
};

export default PlaceholderPage;
