import React, { useState, useRef } from 'react';
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

const App = () => {
  const [step, setStep] = useState('upload'); // upload, scanning, result
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const mockAnalysis = {
    foodName: '아보카도 연어 샐러드',
    calories: 450,
    macros: { protein: 25, fat: 30, carbs: 15, sugar: 10 },
    score: 85,
    tips: '오메가-3가 풍부한 식단입니다. 식이섬유 보충을 위해 통곡물 빵 한 조각을 곁들이면 더 좋습니다.',
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        startScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const startScanning = () => {
    setStep('scanning');
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setStep('result');
    }, 3500);
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setStep('upload');
  };

  return (
    <div className="h-screen w-full bg-[#F2F9F5] flex flex-col items-center p-3 font-sans text-[#1E2923] overflow-hidden">
      <header className="w-full max-w-lg mb-1  bg-white rounded-3xl p-3 shadow-xl border border-slate-100">
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
        className={`w-full  flex-1 flex flex-col justify-center ${step === 'result' ? 'max-w-5xl' : 'max-w-lg'}`}
      >
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div
              onClick={() => fileInputRef.current.click()}
              className="aspect-square bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[#FF8243] hover:bg-orange-50/30 transition-all group shadow-sm"
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
          <div className="flex items-stretch gap-5">
            <div className="flex-1 min-w-0 rounded-3xl overflow-hidden ring-4 ring-orange-50">
              <img
                src={selectedImage}
                className="w-full h-full object-cover min-h-full"
                alt="Food"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-slate-100 relative">
                <div className="absolute -top-3 -right-3">
                  <div className="w-16 h-16 bg-[#FF8243] rounded-full flex flex-col items-center justify-center text-white shadow-lg border-4 border-white">
                    <span className="text-[10px] font-bold uppercase">
                      Score
                    </span>
                    <span className="font-black text-xl">{analysis.score}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#1E2923] mb-1">
                      {analysis.foodName}
                    </h2>
                    <p className="text-xl font-bold text-[#FF8243]">
                      {analysis.calories}{' '}
                      <span className="text-sm font-medium text-[#1E2923]/60">
                        kcal
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      label: '탄수화물 / 당류',
                      val: `${analysis.macros.carbs}g / ${analysis.macros.sugar}g`,
                    },
                    { label: '단백질', val: `${analysis.macros.protein}g` },
                    { label: '지방', val: `${analysis.macros.fat}g` },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-[#F2F9F5] rounded-2xl py-4 px-2 text-center border border-emerald-100/50"
                    >
                      <p className="text-[10px] text-[#1E2923]/60 font-black mb-1 uppercase">
                        {item.label}
                      </p>
                      <p className="font-bold text-[0.95rem]">{item.val}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>영양 밸런스</span>
                    <span className="text-[#FF8243]">{analysis.score}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF8243] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,130,67,0.4)]"
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E2923] rounded-4xl p-6 text-white shadow-lg relative overflow-hidden">
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
