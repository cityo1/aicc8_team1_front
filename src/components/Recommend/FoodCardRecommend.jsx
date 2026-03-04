import React, { useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';

const FoodCardRecommend = ({ food }) => {
  // 즐겨찾기 상태 관리 (기본값: false)
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e) => {
    e.stopPropagation(); // 카드 전체 클릭 이벤트와 겹치지 않게 방지
    setIsFavorite(!isFavorite); // 상태 반전 (true <-> false)

    if (!isFavorite) {
      console.log(`${food.name} 즐겨찾기 추가`);
    } else {
      console.log(`${food.name} 즐겨찾기 해제`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div
        className="h-32 bg-gray-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${food.image})` }}
      />
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-[#1E2923] text-sm truncate">
            {food.name}
          </h4>

          {/* 즐겨찾기버튼 누를때 아이콘 채음 상태 변경 */}
          <button onClick={toggleFavorite} className="focus:outline-none">
            {isFavorite ? (
              <FaStar size={17} color="#FF8243" /> /* 눌렀을 때 */
            ) : (
              <FaRegStar size={17} color="#FF8243" /> /* 기본 */
            )}
          </button>
        </div>

        <p className="text-[11px] text-gray-500 line-clamp-2">
          {food.description}
        </p>
        <div className="mt-2 flex gap-1">
          {food.tags?.map((tag) => (
            <span key={tag} className="text-[9px] text-[#1E2923] opacity-60">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodCardRecommend;
