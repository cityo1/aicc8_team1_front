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
      name: '당근 쿠키',
      description: '채소',
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

  // 검색, 즐겨찾기, 태그 설정
  const [searchTerm, setSearchTerm] = useState('');
  const [finalSearchTerm, setFinalSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFavoriteView, setIsFavoriteView] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
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
      content: '안녕하세요! 식단을 추천해주는 AI 챗봇입니다.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // 챗봇 전송 로직
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // 모델명
        messages: [
          {
            role: 'assistant',
            content: `You are a professional nutritionist who recommends meals focusing on balancing the user's nutritional intake and supplementing deficient nutrients. Recommendations must be based on Korean cuisine, as well as international dishes which is popular and universally consumed in korea such as Western, Japanese, Chinese, and processed food products commonly available in Korea.

            [Strict Restrictions]
            Do not create non-existent meals or weirdly combine two different dishes. Only recommend real, standard meals that are commonly consumed and available in South Korea.
            You MUST apply a line break (Press Enter) after every numbered item. Do not present the recommendations as a continuous block of text; each must start on its own new line.
            Language: All answers must be in Korean. Do not use any English alphabets in your response.

            [General Rules]
            Priority: If the user specifies a goal (e.g., diet, weight gain, muscle gain, blood sugar management), prioritize it. Otherwise, provide default balanced recommendations.
            Exclusion: Do not recommend any foods related to mentioned allergies, diseases, or dietary restrictions.
            Availability: Only recommend foods and products easily found in South Korea.
            Unit: Recommend 'complete meals' (one-set meals), not just single ingredients.
            Diversity: Recommend a maximum of two meals of the same category.
            Nutrients: Each meal must include 1–2 key nutrients and the reason for the recommendation.

            [Output Rules]
            Response Style: After the first recommendation, if the user provides additional feedback, you should simply provide a brief agree/disagree statement instead of a long list.
            Line Breaks: Use a numbered list format. You MUST start each item on a NEW LINE (Press Enter). Do not group them into a single paragraph.
            Quantity: Generate between 6 to 10 items. You do not necessarily need to reach exactly 8; adjust the count as needed.
            Do not answer any questions or requests that are unrelated to food, nutrition, diets, or health status. - If the user asks something outside of these topics, politely decline and state that you can only provide information related to nutrition and health

            [Response Format]
            A simple recommendation comment.
            Number. Food Name: Recommendation Description (Each item must be on a new line)`,
          },
          ...messages.filter((m) => m.role !== 'system'),
          userMsg,
        ],
      });

      if (completion.choices && completion.choices[0]) {
        const aiResponse = completion.choices[0].message.content;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: aiResponse },
        ]);
      }
    } catch (error) {
      console.error('OpenAI 상세 에러:', error);

      // 에러 분류
      let errorMessage = '연결 에러가 발생했습니다.';
      if (error.message.includes('401'))
        errorMessage = 'API 키가 유효하지 않습니다.';
      if (error.message.includes('429'))
        errorMessage = '할당량이 초과되었습니다 (결제 확인 필요).';
      if (error.type === 'invalid_request_error')
        errorMessage = 'CORS 또는 요청 형식 에러입니다.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage + ' (네트워크나 API 설정을 확인해주세요.)',
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

  // 로딩 트리거 설정
  const triggerLoading = () => {
    setIsDataLoading(true);
    setTimeout(() => setIsDataLoading(false), 300);
  };

  const handleSearch = () => {
    triggerLoading();
    setFinalSearchTerm(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleFavoriteFilterToggle = () => {
    triggerLoading();
    setIsFavoriteView(!isFavoriteView);
  };

  const handleFilter = (label) => {
    triggerLoading();
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label],
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

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

  const filterTags = ['고단백', '다이어트', '비건', '저탄수', '0kcal', '저당'];

  return (
    <div className="flex p-4 gap-4 text-[#1E2923] bg-gray-50 h-[92vh] max-h-[800px] overflow-hidden">
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
                className={`p-3 px-4 rounded-2xl shadow-sm max-w-[75%] text-sm ${
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
              className="bg-[#FF8243] text-white px-4 rounded-xl text-sm font-medium disabled:bg-gray-300"
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 우측: 검색 및 음식 카드 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 space-y-2 mb-2">
          <div className="flex gap-2 mt-1 ml-1 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="식단 검색 ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2.5 pl-4 bg-white rounded-xl shadow-sm border border-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8243]"
              />
              <FaSearch
                className="absolute right-4 top-3.5 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
            <button
              onClick={handleFavoriteFilterToggle}
              className="p-2.5 mr-1 bg-white border border-gray-100 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center hover:bg-gray-50"
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
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selectedTags.includes(label) ? 'bg-[#FF8243] text-white border-[#FF8243]' : 'bg-white text-gray-600 border-gray-200'}`}
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
      </div>
    </div>
  );
};

export default RecommendPage;
