import React, { useState, useRef, useEffect } from 'react';
import FoodCardRecommend from './FoodCardRecommend';
import { FaStar, FaSearch } from 'react-icons/fa';
import { TbMessageChatbot } from 'react-icons/tb';
import OpenAI from 'openai';

// 1. OpenAI 설정 (Vite 환경 변수 사용)
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const RecommendPage = () => {
  // 초기 데이터를 useState로 관리하여 AI 추천 메뉴가 추가/삭제될 수 있도록 함
  const [recommendedFoods, setRecommendedFoods] = useState([
    {
      id: 1,
      name: '닭가슴살 샐러드',
      description: '신선한 야채와 저지방 단백질의 조화',
      tags: ['고단백', '저탄수', '다이어트'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 2,
      name: '당근 쿠키',
      description: '채소로 만든 건강한 디저트',
      tags: ['다이어트', '비건'],
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 3,
      name: '훈제연어 스테이크',
      description: '오메가3가 풍부한 건강한 지방 섭취',
      tags: ['고단백'],
      image: 'https://via.placeholder.com/150',
    },
  ]);

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
    localStorage.setItem('food-favorites', JSON.stringify(favorites));
  }, [favorites]);

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
    setInputMessage('');
    setIsLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 전문 영양사입니다. 사용자의 요청에 맞춰 한국의 실제 식단을 추천하세요.

            [응답 규칙]
            1. 모든 대화는 한국어로 진행하며 친절하게 설명하세요.
            2. 모든 대화에서 추천하는 구체적인 메뉴 데이터는 반드시 답변 마지막에 [DATA]와 [/DATA] 태그로 감싸서 JSON 배열 형식으로 포함하세요.
            3. JSON 구조: [{"name": "음식명", "description": "설명", "tags": ["태그1", "태그2"]}]
            4. tags는 반드시 다음 목록에서만 선택하세요: ${filterTags.join(', ')}.
            5. 한 번에 3~5개의 메뉴를 추천하세요.
            6. 추천된 메뉴는 중복되지 않도록 하세요.
            7. 없는 식단을 만들어내거나 
            8. 텍스트 답변에서는 특수문자 *, &, ^, %, $, # ,@를 출력하지 마세요.
            9. 답변 양식은 아래와 같습니다
              간단한 설명
              번호. 추천 메뉴의 이름: 추천 이유`,
          },
          ...messages.filter((m) => m.role !== 'system'),
          userMsg,
        ],
      });

      const fullResponse = completion.choices[0].message.content;

      // 1. 태그 내부의 JSON 데이터만 추출 (정규표현식)
      const jsonMatch = fullResponse.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/);

      // 2. 채팅창에 표시될 텍스트 답변 (데이터 태그 부분 제거)
      let chatContent = fullResponse
        .replace(/\[DATA\]([\s\S]*?)\[\/DATA\]/, '')
        .trim();

      if (jsonMatch) {
        try {
          const rawNewFoods = JSON.parse(jsonMatch[1]);
          const newFoodsWithId = rawNewFoods.map((food, index) => ({
            ...food,
            id: Date.now() + index, // 고유 ID 부여
            image: 'https://via.placeholder.com/150', // 기본 이미지 설정
          }));

          // 3. 신규 음식을 리스트 상단에 추가
          setRecommendedFoods((prev) => [...newFoodsWithId, ...prev]);
        } catch (error) {
          console.error('JSON 파싱 실패:', error);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: chatContent || '추천 식단을 구성했습니다.',
        },
      ]);
    } catch (error) {
      console.error('OpenAI 에러:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '연결 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
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

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

  const handleFilter = (label) => {
    triggerLoading();
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label],
    );
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
  const displayFoods = recommendedFoods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(finalSearchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => food.tags.includes(tag));
    const matchesFavorite = isFavoriteView ? favorites.includes(food.id) : true;
    return matchesSearch && matchesTags && matchesFavorite;
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
            <div className="text-xs text-gray-400 animate-pulse ml-2">
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
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {filterTags.map((label) => (
              <button
                key={label}
                onClick={() => handleFilter(label)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-[14px] font-medium transition-all ${
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

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative">
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
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm">해당하는 식단이 없습니다.</p>
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
            <div className="bg-[#1E2923]/85 backdrop-blur-sm text-white px-5 py-3 rounded-2xl flex items-center gap-4 border border-white/10 min-w-[400px] justify-between">
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
