import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ChevronRight,
  PieChart,
  Info,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeFoodImage, reanalyzeFood } from '../../api/scan';

const App = () => {
  const [step, setStep] = useState('upload'); // upload, scanning, result
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [editableFoods, setEditableFoods] = useState([]); // { name, amount } 편집 중
  const [appliedFoods, setAppliedFoods] = useState([]); // '다시 분석하기'로 적용된 값
  const [isReanalyzing, setIsReanalyzing] = useState(false); // AI 재분석 로딩
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (analysis?.rawFoods?.length) {
      const initial = analysis.rawFoods.map((f) => ({
        name: String(f.name ?? '').trim() || '음식',
        amount: Number(f.amount) || 0,
      }));
      setEditableFoods(initial);
      setAppliedFoods(initial);
    }
  }, [analysis?.rawFoods]);

  const updateFoodName = (index, newName) => {
    setEditableFoods((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = {
          ...next[index],
          name: String(newName ?? '').trim() || '음식',
        };
      return next;
    });
  };

  const updateFoodAmount = (index, value) => {
    setEditableFoods((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = {
          ...next[index],
          amount: Math.max(0, Number(value) || 0),
        };
      return next;
    });
  };

  const handleReanalyze = async () => {
    const payload = editableFoods.map((f) => ({
      name: f.name,
      amount: Number(f.amount) || 0,
    }));
    if (payload.length === 0) return;

    setIsReanalyzing(true);
    setError(null);
    try {
      const res = await reanalyzeFood(payload);
      const { foods, totalCalories } = res;
      const protein = foods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
      const fat = foods.reduce((s, f) => s + (Number(f.fat) || 0), 0);
      const carbs = foods.reduce(
        (s, f) => s + (Number(f.carbohydrate) || 0),
        0,
      );
      const sugar = foods.reduce((s, f) => s + (Number(f.sugars) || 0), 0);

      setAnalysis((prev) => ({
        ...prev,
        rawFoods: foods,
        calories: totalCalories,
        macros: { protein, fat, carbs, sugar },
      }));
      setAppliedFoods(payload);
    } catch (err) {
      setError(err.message || '재분석 중 오류가 발생했습니다.');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const computedTotals = (() => {
    if (!analysis?.rawFoods?.length || !appliedFoods.length) return null;
    let calories = 0,
      carbs = 0,
      sugar = 0,
      protein = 0,
      fat = 0;
    analysis.rawFoods.forEach((raw, i) => {
      const applied = appliedFoods[i];
      if (!applied) return;
      const baseAmount = raw.amount || 1;
      const ratio = (applied.amount || 0) / baseAmount;
      calories += (Number(raw.calories) || 0) * ratio;
      carbs += (Number(raw.carbohydrate) || 0) * ratio;
      sugar += (Number(raw.sugars) || 0) * ratio;
      protein += (Number(raw.protein) || 0) * ratio;
      fat += (Number(raw.fat) || 0) * ratio;
    });
    return { calories: Math.round(calories), carbs, sugar, protein, fat };
  })();

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      startScanning(file);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const startScanning = async (file) => {
    setStep('scanning');
    try {
      const res = await analyzeFoodImage(file);
      const { foods, totalCalories } = res;
      const protein = foods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
      const fat = foods.reduce((s, f) => s + (Number(f.fat) || 0), 0);
      const carbs = foods.reduce(
        (s, f) => s + (Number(f.carbohydrate) || 0),
        0,
      );
      const sugar = foods.reduce((s, f) => s + (Number(f.sugars) || 0), 0);
      setAnalysis({
        foodName: foods.map((f) => f.name).join(', ') || '분석된 음식',
        calories: totalCalories,
        macros: { protein, fat, carbs, sugar },
        score: 85,
        tips:
          foods.length > 1
            ? `총 ${foods.length}종의 음식이 분석되었습니다.`
            : '영양 균형을 위해 다양한 식재료를 곁들이면 좋습니다.',
        rawFoods: foods,
      });
    } catch (err) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
      setStep('upload');
      setSelectedImage(null);
      setSelectedFile(null);
      return;
    }
    setStep('result');
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysis(null);
    setEditableFoods([]);
    setAppliedFoods([]);
    setError(null);
    setStep('upload');
  };

  return (
    <div className=" w-full bg-[#F2F9F5] flex flex-col items-center font-sans text-[#1E2923]">
      <header className="w-full max-w-lg mb-1  bg-white rounded-3xl p-2 shadow-xl border border-slate-100">
        <h1 className="text-[1.75rem] font-bold text-[#1E2923] flex items-center gap-3  ">
          <div className="w-10 h-10 bg-[#FF8243] rounded-xl flex items-center justify-center text-white shadow-md">
            <PieChart size={24} />
          </div>
          AI 식단 분석
        </h1>
        <p className="text-[#1E2923] text-base mt-2 opacity-90">
          식사 사진을 업로드하여 식단의 영양 성분을 즉시 확인하세요.
        </p>
      </header>

      <main
        className={`w-full flex-1 flex flex-col justify-center ${step === 'result' ? 'max-w-7xl p-3' : 'max-w-lg p-3'}`}
      >
        {/* 에러 표시 */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`aspect-square bg-white border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all group shadow-sm ${
                isDragOver
                  ? 'border-[#FF8243] bg-orange-50/50 scale-[1.02]'
                  : 'border-slate-300 hover:border-[#FF8243] hover:bg-orange-50/30'
              }`}
            >
              <div className="w-20 h-20 bg-[#F2F9F5] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Camera
                  className="text-[#1E2923] group-hover:text-[#FF8243]"
                  size={40}
                />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#1E2923]">
                  식사 사진 촬영 또는 업로드
                </p>
                <p className="text-sm text-[#1E2923] mt-2 opacity-70">
                  오늘 무엇을 드셨나요?
                </p>
                <p className="text-xs text-[#1E2923] mt-1 opacity-50">
                  또는 여기에 사진을 드래그하여 업로드
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="bg-[#FF8243] p-5 rounded-3xl flex gap-4 items-center shadow-md">
              <Info className="text-white shrink-0" size={24} />
              <p className="text-[0.95rem] text-white font-medium leading-relaxed">
                AI가 사진 속 음식의 이름과 무게를 분석하여 식단의
                <br />
                칼로리와 탄수화물, 단백질, 지방, 당류를 자동으로 계산합니다.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Scanning */}
        {step === 'scanning' && (
          <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <img
              src={selectedImage}
              className="w-full h-full object-cover filter brightness-50"
              alt="Scanning"
            />
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF8243] shadow-[0_0_20px_#FF8243] animate-[scan_2s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
              <div className="bg-white/20 p-5 rounded-full backdrop-blur-md mb-6 border border-white/30">
                <Loader2 size={44} className="animate-spin" />
              </div>
              <h3 className="text-2xl font-bold mb-2">이미지 분석 중...</h3>
              <p className="text-base opacity-80 font-light">
                메뉴와 영양 정보를 구성하고 있습니다
              </p>
            </div>
            <style>{`
              @keyframes scan {
                0% { top: 0%; opacity: 0.3; }
                50% { top: 100%; opacity: 1; }
                100% { top: 0%; opacity: 0.3; }
              }
            `}</style>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && analysis && (
          <div className="flex items-stretch gap-5 p-1">
            {/* 사진 박스 - 원본 비율 유지, 가로로 넓게 */}
            <div className="flex-[2.5] min-w-0 rounded-3xl ring-4 ring-orange-50 relative bg-slate-100 flex items-center justify-center">
              <img
                src={selectedImage}
                className="object-contain rounded-3xl w-full h-full"
                alt="Food"
              />
              {/* 추후 추가 예정: 분석한 음식에 박스 영역 표시 */}
              {/* {analysis.rawFoods?.some((f) => f.bbox) && (
                <div className="absolute inset-0 pointer-events-none">
                  {analysis.rawFoods.map(
                    (food, i) =>
                      food.bbox && (
                        <div
                          key={i}
                          className="absolute border-2 border-yellow-400 bg-yellow-400/20"
                          style={{
                            left: `${food.bbox.x ?? food.bbox.left ?? 0}%`,
                            top: `${food.bbox.y ?? food.bbox.top ?? 0}%`,
                            width: `${food.bbox.w ?? food.bbox.width ?? 10}%`,
                            height: `${food.bbox.h ?? food.bbox.height ?? 10}%`,
                          }}
                        >
                          <span className="absolute -top-6 left-0 text-xs font-bold text-yellow-900 bg-yellow-200/95 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {appliedFoods[i]?.name ?? food.name}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              )} */}
            </div>
            {/* 결과 박스 */}
            <div className="flex-[1.5] min-w-0 space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative">
                <div className="absolute -top-3 -right-3">
                  <div className="w-16 h-16 bg-[#FF8243] rounded-full flex flex-col items-center justify-center text-white shadow-lg border-4 border-white">
                    <span className="text-[10px] font-bold uppercase">
                      Score
                    </span>
                    <span className="font-black text-xl">{analysis.score}</span>
                  </div>
                </div>

                {/* 음식별 분석 기준 표 (이름·g 수정 가능) */}
                {editableFoods.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-bold text-[#1E2923]/60 uppercase mb-2">
                      분석 기준 (음식량)
                    </p>
                    <div className="rounded-3xl border border-emerald-100/80 bg-white/50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#F2F9F5]/80">
                            <th className="text-left py-2.5 px-3 font-bold text-[#1E2923]">
                              음식 이름
                            </th>
                            <th className="text-right py-2 px-4 font-bold text-[#1E2923] w-24">
                              g
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {editableFoods.map((food, i) => (
                            <tr
                              key={i}
                              className="border-t border-emerald-100/60"
                            >
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={food.name}
                                  onChange={(e) =>
                                    updateFoodName(i, e.target.value)
                                  }
                                  className="w-full bg-transparent border-b border-transparent hover:border-[#1E2923]/20 focus:border-[#FF8243] focus:outline-none py-1 text-[#1E2923] font-medium"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={food.amount || ''}
                                  onChange={(e) =>
                                    updateFoodAmount(i, e.target.value)
                                  }
                                  placeholder="0"
                                  className="w-16 text-right bg-transparent border-b border-transparent hover:border-[#1E2923]/20 focus:border-[#FF8243] focus:outline-none py-1 text-[#1E2923] font-medium"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      type="button"
                      onClick={handleReanalyze}
                      disabled={isReanalyzing}
                      className="w-full mt-3 py-2.5 rounded-xl bg-[#FF8243] text-white font-bold text-sm hover:bg-[#E05A1F] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isReanalyzing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          AI 재분석 중...
                        </>
                      ) : (
                        '다시 분석하기'
                      )}
                    </button>
                  </div>
                )}

                {/* 칼로리, 영양소 총합 */}
                {(() => {
                  const totals = computedTotals ?? {
                    calories: analysis.calories,
                    carbs: analysis.macros.carbs,
                    sugar: analysis.macros.sugar,
                    protein: analysis.macros.protein,
                    fat: analysis.macros.fat,
                  };
                  return (
                    <>
                      <div className="flex items-center gap-5 mb-1">
                        <p className="text-xl font-bold text-[#FF8243]">
                          {totals.calories}{' '}
                          <span className="text-sm font-medium text-[#1E2923]/60">
                            kcal
                          </span>
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          {
                            label: '탄수화물 / 당류',
                            val: `${Math.round(totals.carbs * 10) / 10}g / ${Math.round(totals.sugar * 10) / 10}g`,
                          },
                          {
                            label: '단백질',
                            val: `${Math.round(totals.protein * 10) / 10}g`,
                          },
                          {
                            label: '지방',
                            val: `${Math.round(totals.fat * 10) / 10}g`,
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="bg-[#F2F9F5] rounded-2xl py-4 px-2 text-center border border-emerald-100/50"
                          >
                            <p className="text-[10px] text-[#1E2923]/60 font-black mb-1 uppercase">
                              {item.label}
                            </p>
                            <p className="font-bold text-[0.95rem]">
                              {item.val}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                          <span>영양 밸런스</span>
                          <span className="text-[#FF8243]">
                            {analysis.score}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF8243] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,130,67,0.4)]"
                            style={{ width: `${analysis.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="bg-[#1E2923] rounded-3xl p-4 text-white shadow-lg relative">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={22} className="text-[#FF8243]" />
                  <h3 className="font-bold text-lg">AI 코멘트</h3>
                </div>
                <p className="text-[1rem] leading-relaxed opacity-90 font-medium">
                  "{analysis.tips}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={resetScanner}
                  className="bg-white border-2 border-[#1E2923] text-[#1E2923] py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <RefreshCw size={20} /> 다시 찍기
                </button>
                <button
                  className="bg-[#1E2923] text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-[#2a3a31] transition-all shadow-lg active:scale-95"
                  onClick={() => navigate('/home/dailyLog')}
                >
                  기록하기 <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-[#1E2923]/40 text-sm font-medium tracking-tight">
        Powered by Advanced AI Recognition
      </footer>
    </div>
  );
};

export default App;
