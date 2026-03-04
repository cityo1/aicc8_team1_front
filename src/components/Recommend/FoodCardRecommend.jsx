import React from 'react';
import { FaStar } from 'react-icons/fa';

/**
 * @param {Object} food - 음식 데이터 객체
 * @param {boolean} isFavorite - 현재 이 음식이 즐겨찾기 상태인지 여부
 * @param {function} onToggleFavorite - 즐겨찾기 버튼 클릭 시 실행할 함수
 */
const FoodCardRecommend = ({ food, isFavorite, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative flex flex-col group hover:shadow-md transition-shadow duration-200">
      {/* 음식 이미지 섹션 */}
      <div className="relative w-full h-32 mb-3 overflow-hidden rounded-xl">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* 텍스트 정보 섹션 */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-sm text-[#1E2923] mb-1 truncate">
          {food.name}
        </h3>

        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3 h-8">
          {food.description}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 자체 클릭 이벤트가 있다면 간섭 방지
            onToggleFavorite(food.id); // 부모 컴포넌트의 favorites 상태 변경
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <FaStar
            size={16}
            className={`transition-colors duration-200 ${
              isFavorite ? 'text-[#FF8243]' : 'text-gray-300'
            }`}
          />
        </button>

        {/* 태그 리스트 */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {food.tags &&
            food.tags.map((tag, index) => (
              <span
                key={index}
                className="text-[10px] bg-[#F9FBFA] border border-gray-100 px-1.5 py-0.5 rounded-md text-gray-600"
              >
                #{tag}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FoodCardRecommend;
