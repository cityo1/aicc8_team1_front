import React, { useState, useRef, useEffect } from 'react';
import FoodCardRecommend from './FoodCardRecommend';
import { FaStar, FaSearch } from 'react-icons/fa';
import { TbMessageChatbot } from 'react-icons/tb';

const RecommendPage = () => {
  // ... 데이터 및 상태 관리 로직 (기존과 동일)
  const [recommendedFoods] = useState([
    {
      id: 1,
      name: '닭가슴살 샐러드',
      description: '신선한 야채와 저지방 단백질의 조화',
      tags: ['고단백', '저탄수', '다이어트'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: '당근',
      description: '채소',
      tags: ['다이어트', '비건'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: '훈제연어 스테이크',
      description: '오메가3가 풍부한\n건강한 지방 섭취',
      tags: ['고단백'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 4,
      name: '김치볶음밥',
      description: '바삭하지만 가벼운 식물성 간식',
      tags: ['다이어트'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 5,
      name: '제로콜라',
      description: '톡 쏘는 탄산과 0칼로리의 만남',
      tags: ['0kcal', '다이어트'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 6,
      name: '보리밥',
      description: '톡톡 터지는 식감의 건강식',
      tags: ['다이어트'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 7,
      name: '망고 샐러드',
      description: '맛있는 망고 샐러드',
      tags: ['비건', '다이어트'],
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [finalSearchTerm, setFinalSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 건강한 식단을 위해 무엇을 도와드릴까요?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSearch = () => setFinalSearchTerm(searchTerm);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };
  const handleFavorite = () => console.log('즐겨찾기');
  const handleFilter = (label) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label],
    );
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMsg = { role: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '서버 연결을 확인해주세요.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayFoods = recommendedFoods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(finalSearchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => food.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const filterTags = ['고단백', '다이어트', '비건', '저탄수', '0kcal', '저당'];

  return (
    <div className="flex p-4 gap-4 text-[#1E2923] bg-gray-50 h-[92vh] max-h-[800px] overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FF8203; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e6753c; 
        }
      `}</style>

      {/* 좌측: AI 챗봇 영역 */}
      <div className="flex-[1.2] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="font-bold flex items-center gap-2 text-[#1E2923]">
            <TbMessageChatbot size={24} color="#FF8243" />
            <span className="text-lg">AI 식단 가이드</span>
          </h2>
        </div>

        {/* 메시지 리스트 - 세로 스크롤 */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto bg-[#F9FBFA] space-y-4 custom-scrollbar"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 px-4 rounded-2xl shadow-sm max-w-[90%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#FF8243] text-white rounded-tr-none'
                    : 'bg-white text-[#1E2923] border border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-xs text-gray-400 animate-pulse ml-2">
              답변 생성 중...
            </div>
          )}
        </div>

        {/* 메시지 입력창 */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="메시지 입력..."
              className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF8243] text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-[#FF8243] text-white px-4 rounded-xl text-sm font-medium hover:bg-[#e6753c] disabled:bg-gray-300"
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 우측: 검색 및 음식 카드 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 검색/필터 섹션 - 고정 */}
        <div className="shrink-0 space-y-2 mb-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="식단 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2.5 pl-4 bg-white rounded-xl shadow-sm border border-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8243]"
              />
              <FaSearch
                className="absolute right-4 top-3 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
            <button onClick={handleFavorite} className="p-2">
              <FaStar size={20} color="#FF8243" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {filterTags.map((label) => (
              <button
                key={label}
                onClick={() => handleFilter(label)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  selectedTags.includes(label)
                    ? 'bg-[#FF8243] text-white border-[#FF8243]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                #{label}
              </button>
            ))}
          </div>
        </div>

        {/* 음식 카드 그리드 - 세로 스크롤 */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {displayFoods.length > 0 ? (
              displayFoods.map((food) => (
                <FoodCardRecommend key={food.id} food={food} />
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm">결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendPage;
