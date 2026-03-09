import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodCardRecommend from './FoodCardRecommend';
import { FaStar, FaSearch } from 'react-icons/fa';
import { TbMessageChatbot } from 'react-icons/tb';
import { IoMdRefresh } from 'react-icons/io';
import { LuPanelTopOpen } from 'react-icons/lu';

const RecommendPage = () => {
  const navigate = useNavigate();
  const [recommendedFoods, setRecommendedFoods] = useState([]);

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [finalSearchTerm, setFinalSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFavoriteView, setIsFavoriteView] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [sortType, setSortType] = useState('latest');

  // 즐겨찾기 로컬스토리지 연동
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('food-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('food-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // 초기 랜덤 데이터 로드 (기존 기능 유지)
  useEffect(() => {
    const fetchRandomFoods = async () => {
      try {
        const res = await fetch('/api/recommend/random');
        const data = await res.json();
        if (data.success) setRecommendedFoods(data.foods);
      } catch (err) {
        console.error('초기 로드 실패', err);
      }
    };
    fetchRandomFoods();
  }, []);

  // AI 챗봇 상태
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '안녕하세요! 당신의 현재 영양 상태를 분석하여 최적의 식단을 추천해 드립니다. 어떤 음식이 궁금하신가요?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // 태그 목록
  const filterTags = ['고단백', '다이어트', '비건', '저탄수', '0kcal', '저당'];

  /**
   * [핵심] AI 챗봇 전송 및 데이터 파싱
   * OpenAI 분석 결과와 DB의 음식 데이터를 한꺼번에 가져옵니다.
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = { role: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // 사용자의 현재 영양 상태 (예시: 실제 데이터 연동 가능)
    const userNutrientStatus = {
      deficiency: 'Protein', // 단백질 결핍 상태 가정
      dailyGoal: '2000kcal',
      status: 'Active',
    };

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          inputMessage: currentInput,
          userNutrients: userNutrientStatus,
        }),
      });

      const data = await response.json();

      // AI 답변 추가
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);

      // DB 검색 결과가 있으면 카드 리스트 맨 앞에 추가
      if (data.foods && data.foods.length > 0) {
        setRecommendedFoods((prev) => [...data.foods, ...prev]);
        triggerLoading();
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '서버와 통신 중 에러가 발생했습니다.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // 로딩 트리거
  const triggerLoading = () => {
    setIsDataLoading(true);
    setTimeout(() => setIsDataLoading(false), 300);
  };

  const handleSearch = () => {
    triggerLoading();
    setFinalSearchTerm(searchTerm);
  };

  const toggleFavorite = (id) => {
    const isFav = favorites.includes(id);
    setFavorites((prev) =>
      isFav ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

  const handleFilter = (label) => {
    triggerLoading();
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label],
    );
  };

  const resetFilters = () => {
    triggerLoading();
    setSearchTerm('');
    setFinalSearchTerm('');
    setSelectedTags([]);
    setIsFavoriteView(false);
  };

  // 식단 로그 페이지로 이동
  const handleToggleCheck = (food) => {
    navigate('/dailyLog', { state: { food } });
  };

  // 삭제 및 토스트 관련 로직 (기존 기능 유지)
  const deletedFoodRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(
      () => setToast({ visible: false, message: '' }),
      3000,
    );
  };

  const handleDelete = (id, name) => {
    const targetIndex = recommendedFoods.findIndex((f) => f.id === id);
    deletedFoodRef.current = {
      food: recommendedFoods[targetIndex],
      index: targetIndex,
    };
    setRecommendedFoods((prev) => prev.filter((f) => f.id !== id));
    showToast(`${name}이(가) 삭제되었습니다.`);
  };

  const handleUndo = () => {
    if (deletedFoodRef.current) {
      const { food, index } = deletedFoodRef.current;
      setRecommendedFoods((prev) => {
        const newList = [...prev];
        newList.splice(index, 0, food);
        return newList;
      });
      setToast({ visible: false, message: '' });
      deletedFoodRef.current = null;
    }
  };

  // 필터링 및 정렬 로직
  const displayFoods = recommendedFoods
    .filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(finalSearchTerm.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => food.tags?.includes(tag));
      const matchesFavorite = isFavoriteView
        ? favorites.includes(food.id)
        : true;
      return matchesSearch && matchesTags && matchesFavorite;
    })
    .sort((a, b) => {
      if (sortType === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sortType === 'namereverse') return b.name.localeCompare(a.name, 'ko');
      if (sortType === 'oldest') return a.id - b.id;
      return b.id - a.id;
    });

  return (
    <div className="flex p-4 gap-4 text-[#1E2923] bg-gray-50 h-[92vh] max-h-[1000px] overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF8203; border-radius: 10px; }
      `}</style>

      {/* 좌측: AI 챗봇 영역 */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="font-bold flex items-center gap-2">
            <TbMessageChatbot size={24} color="#FF8243" />
            <span className="text-lg">AI 식단 분석가</span>
          </h2>
        </div>
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
                className={`p-3 px-4 rounded-2xl shadow-sm max-w-[85%] text-sm whitespace-pre-wrap ${
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
            <div className="p-3 px-4 rounded-2xl shadow-sm text-sm text-gray-400 bg-white border border-gray-100 rounded-tl-none animate-pulse">
              AI가 최적의 식단을 분석 중입니다...
            </div>
          )}
        </div>
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="음식 이름이나 영양 고민을 입력하세요..."
              className="flex-1 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF8243] text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-[#FF8243] text-white px-5 rounded-xl text-sm font-medium disabled:bg-gray-300"
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 우측: 검색 및 카드 리스트 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="shrink-0 space-y-2 mb-2 px-1">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="식단 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full p-2.5 pl-4 bg-white rounded-xl shadow-sm border border-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8243]"
              />
              <FaSearch
                className="absolute right-4 top-3.5 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
            <button
              onClick={() => {
                triggerLoading();
                setIsFavoriteView(!isFavoriteView);
              }}
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              <FaStar
                size={18}
                color={isFavoriteView ? '#FF8243' : '#D1D5DB'}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={resetFilters}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:text-[#FF8243] transition-colors shrink-0"
            >
              <IoMdRefresh size={20} />
            </button>
            <div className="flex-1 flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
              {filterTags.map((label) => (
                <button
                  key={label}
                  onClick={() => handleFilter(label)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${
                    selectedTags.includes(label)
                      ? 'bg-[#FF8243] text-white border-[#FF8243]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  #{label}
                </button>
              ))}
            </div>
            <div className="relative shrink-0">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="appearance-none pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순(ㄱ~ㅎ)</option>
                <option value="namereverse">이름순(ㅎ~ㄱ)</option>
              </select>
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <LuPanelTopOpen size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#F9FBFA] overflow-y-auto pr-1 custom-scrollbar relative">
          {isDataLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-10">
              <div className="w-8 h-8 border-4 border-[#FF8243] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {displayFoods.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-4">
              {displayFoods.map((food) => (
                <FoodCardRecommend
                  key={food.id}
                  food={food}
                  isFavorite={favorites.includes(food.id)}
                  onToggleFavorite={() => toggleFavorite(food.id)}
                  onDelete={() => handleDelete(food.id, food.name)}
                  onToggleCheck={() => handleToggleCheck(food)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm font-medium">검색 결과가 없습니다.</p>
              <button
                onClick={resetFilters}
                className="mt-2 text-xs text-[#FF8243] underline"
              >
                초기화
              </button>
            </div>
          )}
        </div>

        {/* 토스트 알림 */}
        {toast.visible && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-[#1E2923]/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={handleUndo}
                className="text-[#FF8243] text-sm font-bold border-l border-gray-600 pl-4"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendPage;
