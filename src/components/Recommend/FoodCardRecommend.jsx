import React from 'react';
import { FaStar, FaCheckSquare, FaRegCheckSquare } from 'react-icons/fa';
import { TbTrashX } from 'react-icons/tb';

/**
 * @param {Object} food - 음식 데이터 객체
 * @param {boolean} isFavorite - 즐겨찾기 상태
 * @param {boolean} isChecked - 체크박스 선택 상태 (추가)
 * @param {function} onToggleFavorite - 즐겨찾기 토글 함수
 * @param {function} onToggleCheck - 체크박스 토글 함수 (추가)
 * @param {function} onDelete - 삭제 함수
 */

const FoodCardRecommend = ({
  food,
  isFavorite,
  onToggleFavorite,
  onDelete,
  isChecked,
  onToggleCheck,
}) => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative flex flex-col group hover:shadow-md transition-shadow duration-200">
      {/* 음식 이미지 섹션 */}
      <div className="relative w-full h-49 mb-3 overflow-hidden rounded-xl">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* 텍스트 정보 섹션 */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-[#1E2923] mb-1 truncate">
            {food.name}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 이벤트와 분리
                onToggleCheck();
              }}
              className="text-[#FF8243] cursor-pointer"
            >
              {isChecked ? (
                <FaCheckSquare size={18} color="#FF8243" />
              ) : (
                <FaRegCheckSquare size={18} color="#6a7282" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed mb-3 h-13">
          {food.description}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 자체 클릭 이벤트가 있다면 간섭 방지
            onToggleFavorite(food.id); // 부모 컴포넌트의 favorites 상태 변경
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <FaStar
            size={19}
            className={`transition-colors duration-200 ${
              isFavorite ? 'text-[#FF8243]' : 'text-gray-300'
            }`}
          />
        </button>

        <div className="flex items-center justify-between ">
          {/* 태그 리스트 */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {food.tags &&
              food.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-[12px] bg-[#F9FBFA] border border-gray-100 px-1 py-0.5 rounded-md text-gray-600"
                >
                  #{tag}
                </span>
              ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFavorite) {
                if (
                  window.confirm(
                    '즐겨찾기에 등록된 항목입니다. 정말 삭제하시겠습니까?',
                  )
                ) {
                  onDelete(food.id, food.name);
                }
              } else {
                // 즐겨찾기가 아닌 경우 바로 삭제
                onDelete(food.id, food.name);
              }
            }}
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
            title="삭제"
          >
            <TbTrashX size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCardRecommend;
