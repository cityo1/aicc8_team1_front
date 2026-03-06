import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동용
import FoodCardRecommend from './FoodCardRecommend';
import { FaStar, FaSearch } from 'react-icons/fa';
import { TbMessageChatbot } from 'react-icons/tb';
import { IoMdRefresh } from 'react-icons/io';
import { LuPanelTopOpen } from 'react-icons/lu';
// 분리한 서비스 임포트

const RecommendPage = () => {
  const navigate = useNavigate();
  const [recommendedFoods, setRecommendedFoods] = useState([]);

  // 검색, 즐겨찾기, 태그 설정 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [finalSearchTerm, setFinalSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFavoriteView, setIsFavoriteView] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 즐겨찾기 로컬스토리지 연동
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('food-favorites');
    return saved ? JSON.parse(saved) : [];
  });

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

  // useEffect(() => {
  //   localStorage.setItem('food-favorites', JSON.stringify(favorites));
  // }, [favorites]);

  // AI 챗봇 상태
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '안녕하세요! 식단을 추천해주는 AI 챗봇입니다. 어떤 음식을 추천해 드릴까요?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // AI가 사용할 수 있는 태그 목록
  const filterTags = ['고단백', '다이어트', '비건', '저탄수', '0kcal', '저당'];

  // 챗봇 전송 및 데이터 파싱
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/recommend/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, inputMessage: currentInput }),
      });
      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.chatContent },
        ]);
        // DB에서 온 추천 음식을 리스트 맨 앞에 추가
        if (data.foods) {
          setRecommendedFoods((prev) => [...data.foods, ...prev]);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '에러가 발생했습니다.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // 로딩 트리거 및 필터 핸들러
  const triggerLoading = () => {
    setIsDataLoading(true);
    setTimeout(() => setIsDataLoading(false), 300);
  };

  const handleSearch = () => {
    triggerLoading();
    setFinalSearchTerm(searchTerm);
  };

  const toggleFavorite = async (id) => {
    const isFav = favorites.includes(id);
    setFavorites((prev) =>
      isFav ? prev.filter((favId) => favId !== id) : [...prev, id],
    );

    console.log(`음식 ID: ${id}, 현재상태: ${isFav ? '해제' : '등록'}`);
    // try {
    //   await fetch('/api/recommend/favorite', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ foodId: id, isFavorite: !isFav }),
    //   });
    // } catch (err) {
    //   console.error('즐겨찾기 저장 실패');
    // }
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

  const [sortType, setSortType] = useState('latest');

  // 체크박스 상태
  const handleToggleCheck = (food) => {
    // food 객체를 상태에 담아 페이지 이동
    navigate('/dailyLog', { state: { food } });
  };

  // 삭제된 데이터를 임시 보관할 Ref (재렌더링 방지)
  const deletedFoodRef = useRef(null);
  const toastTimerRef = useRef(null);

  // 삭제 알림
  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ visible: false, message: '' });
      deletedFoodRef.current = null;
    }, 3000);
  };

  // 삭제 핸들러
  const handleDelete = (id, name) => {
    const targetIndex = recommendedFoods.findIndex((f) => f.id === id);
    const targetFood = recommendedFoods[targetIndex];
    deletedFoodRef.current = { food: targetFood, index: targetIndex };
    setRecommendedFoods((prevFoods) =>
      prevFoods.filter((food) => food.id !== id),
    );
    setFavorites((prevFoods) => prevFoods.filter((favId) => favId !== id)); // 즐겨찾기 목록에서 해당 id 삭제
    showToast(`${name}이(가) 삭제되었습니다.`);

    // API 서버 삭제 요청 공간
  };

  // 삭제 롤백 핸들러
  const handleUndo = () => {
    if (deletedFoodRef.current) {
      const { food, index } = deletedFoodRef.current;

      setRecommendedFoods((prev) => {
        const newList = [...prev];
        newList.splice(index, 0, food);
        return newList;
      });

      // 토스트 즉시 닫기
      setToast({ visible: false, message: '' });
      deletedFoodRef.current = null;
    }
  };

  // 필터링된 결과 (상태 기반)
  const displayFoods = recommendedFoods
    .filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(finalSearchTerm.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => food.tags.includes(tag));
      const matchesFavorite = isFavoriteView
        ? favorites.includes(food.id)
        : true;
      return matchesSearch && matchesTags && matchesFavorite;
    })
    .sort((a, b) => {
      if (sortType === 'name') {
        return a.name.localeCompare(b.name, 'ko');
      }
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
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden shadow-sm mt-1 mb-1">
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <h2 className="font-bold flex items-center gap-2">
            <TbMessageChatbot size={24} color="#FF8243" />
            <span className="text-lg">AI 식단 가이드</span>
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
            <div className="p-3 px-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap bg-white border border-gray-100 rounded-tl-none text-gray-400 animate-pulse ml-2">
              답변 생성 중 ...
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
              placeholder="메시지 입력 ..."
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

      {/* 우측: 검색 및 음식 카드 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="shrink-0 space-y-2 mt-1 mb-1 px-1">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="식단 검색 ..."
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
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm transition-all hover:bg-gray-50"
            >
              <FaStar
                size={18}
                color={isFavoriteView ? '#FF8243' : '#D1D5DB'}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:text-[#FF8243] transition-colors shrink-0"
              title="필터 초기화"
            >
              <IoMdRefresh size={20} />
            </button>
            <div className="flex-1 flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
              {filterTags.map((label) => (
                <button
                  key={label}
                  onClick={() => handleFilter(label)}
                  className={`whitespace-nowrap px-2.5 py-1.5 rounded-full border text-[12.5px] font-medium transition-all ${
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
                className="appearance-none pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순(ㄱ~ㅎ)</option>
                <option value="namereverse">이름순(ㅎ~ㄱ)</option>
              </select>
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <LuPanelTopOpen size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#F9FBFA] overflow-y-auto pr-1 custom-scrollbar relative ">
          {isDataLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-10">
              <div className="w-8 h-8 border-4 border-[#FF8243] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayFoods.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-4">
              {displayFoods.map((food) => (
                <FoodCardRecommend
                  key={food.id}
                  food={food}
                  isFavorite={favorites.includes(food.id)}
                  onToggleFavorite={() => toggleFavorite(food.id)}
                  onDelete={() => handleDelete(food.id, food.name)}
                  isChecked={checkedItems.includes(food.id)} // 체크 상태 전달
                  onToggleCheck={() => handleToggleCheck(food)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm font-medium">
                {isFavoriteView
                  ? '즐겨찾기한 식단이 없습니다.'
                  : '검색 결과가 없습니다.'}
              </p>
              <button
                onClick={() => {
                  triggerLoading();
                  setIsFavoriteView(false);
                  setSearchTerm('');
                  setFinalSearchTerm('');
                  setSelectedTags([]);
                }}
                className="mt-2 text-xs text-[#FF8243] underline"
              >
                초기화
              </button>
            </div>
          )}
        </div>
        {toast.visible && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-bottom">
            <div className="bg-[#1E2923]/85 backdrop-blur-sm text-white px-5 py-3 rounded-2xl flex items-center gap-4 border border-white/10 min-w-[420px] justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FF8243] rounded-full"></div>
                <span className="text-sm font-medium pl-1">
                  {toast.message}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUndo();
                }}
                className="text-[#FF8243] text-sm font-bold hover:text-[#ff9d6a] border-l border-gray-600 pl-4"
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
