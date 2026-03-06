import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  TextField,
  Button,
  LinearProgress,
  Collapse,
  Stack,
  Avatar,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AddPhotoAlternate,
  ExpandMore,
  ExpandLess,
  FreeBreakfast,
  LunchDining,
  DinnerDining,
  Icecream,
  LocalFireDepartment,
  Add,
  ArrowBack,
  CheckCircle,
  EditNote,
  DeleteOutline,
} from '@mui/icons-material';
import FoodSearchInput from '../components/FoodSearchInput';
import { useAuth } from '../contexts/AuthContext';

// ─── API 기본 URL ──────────────────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:8000';

// ─── 상수 ────────────────────────────────────────────────────────────────────
const MEALS = [
  {
    key: 'breakfast',
    label: '아침',
    Icon: FreeBreakfast,
    color: '#FF8A65',
    bg: '#FFF3E0',
    darkColor: '#E64A19',
  },
  {
    key: 'lunch',
    label: '점심',
    Icon: LunchDining,
    color: '#66BB6A',
    bg: '#E8F5E9',
    darkColor: '#2E7D32',
  },
  {
    key: 'dinner',
    label: '저녁',
    Icon: DinnerDining,
    color: '#7986CB',
    bg: '#E8EAF6',
    darkColor: '#303F9F',
  },
  {
    key: 'snack',
    label: '간식',
    Icon: Icecream,
    color: '#F06292',
    bg: '#FCE4EC',
    darkColor: '#C2185B',
  },
];

const NUTRIENT_CONFIG = [
  { key: 'carbs', label: '탄수화물', color: '#FFA726', daily: 300 },
  { key: 'protein', label: '단백질', color: '#66BB6A', daily: 60 },
  { key: 'fat', label: '지방', color: '#EF5350', daily: 65 },
  { key: 'sugar', label: '당류', color: '#AB47BC', daily: 50 },
];

// ─── 유틸 함수 ────────────────────────────────────────────────────────────────
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function getKoreanDate(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}
function getMealTotalCalories(meal) {
  if (!meal?.foods?.length) return 0;
  return meal.foods.reduce((sum, f) => sum + f.calories, 0);
}

// ─── API 응답을 프론트엔드 형식으로 변환 ────────────────────────────────────
function transformApiResponse(apiData) {
  if (!apiData || !apiData.success) return null;

  const transformMeal = (meal) => {
    const foods = meal.foods || [];
    // 모든 음식의 메모를 수집 (중복 제거, 빈 값 제외)
    const allMemos = foods
      .map((f) => f.memo)
      .filter((memo) => memo && memo.trim())
      .filter((memo, index, arr) => arr.indexOf(memo) === index); // 중복 제거

    return {
      foods: foods.map((f) => ({
        id: f.id,
        name: f.foodName || '알 수 없는 음식',
        calories: f.calories || 0,
        nutrients: f.nutrients || { carbs: 0, protein: 0, fat: 0, sugar: 0 },
        image: f.imageUrl || null,
      })),
      nutrients: meal.nutrients || { carbs: 0, protein: 0, fat: 0, sugar: 0 },
      memos: allMemos, // 메모 배열로 저장
    };
  };

  return {
    summary: apiData.summary || { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 },
    breakfast: transformMeal(apiData.breakfast),
    lunch: transformMeal(apiData.lunch),
    dinner: transformMeal(apiData.dinner),
    snack: transformMeal(apiData.snack),
  };
}

// ─── 영양소 바 ────────────────────────────────────────────────────────────────
function NutrientBar({ label, value, daily, color }) {
  const pct = Math.min((value / daily) * 100, 100);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color }}>
          {Number(value).toFixed(2)}g{' '}
          <Typography component="span" variant="caption" color="text.disabled">
            / {daily}g
          </Typography>
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 4,
          bgcolor: '#f1f5f9',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

// ─── 식사 카드 ────────────────────────────────────────────────────────────────
function MealCard({ meal, data, isToday, dateStr, scanImage, scanMealType }) {
  const [open, setOpen] = useState(false);
  const totalCal = getMealTotalCalories(data);
  const { Icon, color, bg, darkColor } = meal;

  // 저장된 메모 배열
  const savedMemos = data?.memos || [];

  // 음식 중 사진이 있는 항목들 필터링
  const foodsWithImages = data?.foods?.filter((f) => f.image) || [];

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1.5px solid ${open ? color : '#e8ecf0'}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        flexGrow: 1,
      }}
    >
      {/* 카드 헤더 */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          bgcolor: open ? bg : 'transparent',
          transition: 'background 0.2s',
          '&:hover': { bgcolor: bg },
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: color }}>
          <Icon sx={{ fontSize: 18, color: '#fff' }} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={700} fontSize="0.95rem">
            {meal.label}
          </Typography>
          {data?.foods?.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {data.foods.map((f) => f.name).join(', ')}
            </Typography>
          )}
        </Box>
        {totalCal > 0 ? (
          <Chip
            icon={
              <LocalFireDepartment
                sx={{
                  fontSize: '14px !important',
                  color: `${darkColor} !important`,
                }}
              />
            }
            label={`${totalCal} kcal`}
            size="small"
            sx={{
              bgcolor: bg,
              color: darkColor,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        ) : (
          <Chip
            label="미기록"
            size="small"
            variant="outlined"
            sx={{ color: 'text.disabled', borderColor: '#e2e8f0' }}
          />
        )}
        <IconButton size="small" sx={{ ml: 0.5 }}>
          {open ? (
            <ExpandLess fontSize="small" />
          ) : (
            <ExpandMore fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* 카드 내용 */}
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2.5 }}>
          {/* AI 식단분석 기록 이미지 (해당 식사 구분 탭, 음식 목록 바로 위) */}
          {scanImage && scanMealType === meal.key && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ display: 'block', mb: 1 }}
              >
                AI 식단분석 기록
              </Typography>
              <Box
                component="img"
                src={scanImage}
                alt="분석된 식사 사진"
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '2px solid #FF8243',
                  boxShadow: 1,
                }}
              />
            </Box>
          )}
          {/* 음식 리스트 */}
          <Typography
            variant="body2"
            fontWeight={700}
            mb={1}
            color="text.secondary"
          >
            음식 목록
          </Typography>
          {data?.foods?.length > 0 ? (
            <Stack spacing={1} mb={2}>
              {data.foods.map((food, i) => (
                <Box
                  key={i}
                  sx={{
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    p: 1.5,
                    border: '1px solid #e8ecf0',
                  }}
                >
                  {/* 음식 이름과 칼로리 */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {food.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={darkColor}
                      fontWeight={700}
                    >
                      {food.calories} kcal
                    </Typography>
                  </Box>
                  {/* 사진이 있는 경우에만 표시 */}
                  {food.image && (
                    <Box sx={{ mt: 1 }}>
                      <Box
                        component="img"
                        src={food.image}
                        alt={`${food.name} 사진`}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                          border: `2px solid ${color}`,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  pt: 0.5,
                  pr: 1.5,
                }}
              >
                <Typography variant="body2" fontWeight={700} color={color}>
                  합계 {totalCal} kcal
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                mb: 2,
              }}
            >
              <Typography variant="body2" color="text.disabled">
                아직 기록된 음식이 없습니다.
              </Typography>
            </Box>
          )}

          {/* 기존 사진 추가 영역 - 주석처리 */}
          {/*
                    <Typography variant="body2" fontWeight={700} mb={1} color="text.secondary">
                        사진
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                    {image ? (
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <Box
                                component="img"
                                src={image}
                                alt="식사 사진"
                                sx={{
                                    width: '100%',
                                    maxHeight: 200,
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                    border: `2px solid ${color}`,
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={handleImageRemove}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    color: '#fff',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                }}
                            >
                                <DeleteOutline fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Box
                            onClick={handleImageClick}
                            sx={{
                                border: '2px dashed #e2e8f0', borderRadius: 2, p: 3,
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                cursor: 'pointer', mb: 2, transition: '0.2s',
                                '&:hover': { borderColor: color, bgcolor: bg },
                            }}
                        >
                            <AddPhotoAlternate sx={{ fontSize: 32, color: '#cbd5e1', mb: 0.5 }} />
                            <Typography variant="caption" color="text.disabled">사진을 추가하세요</Typography>
                        </Box>
                    )}
                    */}

          {/* 영양소 */}
          {data?.nutrients && (
            <>
              <Typography
                variant="body2"
                fontWeight={700}
                mb={1.5}
                color="text.secondary"
              >
                영양소
              </Typography>
              <Stack spacing={1.2} mb={2}>
                {NUTRIENT_CONFIG.map((n) => (
                  <NutrientBar
                    key={n.key}
                    label={n.label}
                    value={data.nutrients[n.key]}
                    daily={n.daily}
                    color={n.color}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* 메모 */}
          <Typography
            variant="body2"
            fontWeight={700}
            mb={1}
            color="text.secondary"
          >
            메모
          </Typography>
          {savedMemos.length > 0 ? (
            <Box
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: 2,
                p: 1.5,
                border: '1px solid #e8ecf0',
              }}
            >
              {savedMemos.map((memoText, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    py: 0.5,
                    mt: idx > 0 ? '6px' : 0,
                    borderBottom:
                      idx < savedMemos.length - 1
                        ? '1px dashed #e2e8f0'
                        : 'none',
                  }}
                >
                  <EditNote
                    sx={{ fontSize: 18, color: color, mt: '2px', flexShrink: 0 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {memoText}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                border: '1px dashed #e2e8f0',
              }}
            >
              <Typography variant="body2" color="text.disabled">
                저장된 메모가 없습니다.
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─── 기록 추가 카드 ───────────────────────────────────────────────────────────
const EMPTY_FOOD = () => ({
  name: '',
  calories: '',
  foodCode: '',
  nutrients: { carbs: 0, protein: 0, fat: 0, sugar: 0 },
  image: null,
});

function AddRecordCard({ onRefresh, userId }) {
  const [open, setOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foods, setFoods] = useState([EMPTY_FOOD()]);
  const [memo, setMemo] = useState('');
  const fileInputRefs = useRef([]);

  const selectedMealInfo = MEALS.find((m) => m.key === selectedMeal);
  const totalCalories = foods.reduce(
    (sum, f) => sum + (Number(f.calories) || 0),
    0,
  );

  const handleFoodChange = (index, field, value) => {
    setFoods((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
  };

  // 음식 검색에서 선택 시 이름, 칼로리, 영양소, foodCode 동시 업데이트
  const handleFoodSelect = (index, name, calories, nutrientsData = null) => {
    setFoods((prev) =>
      prev.map((f, i) => {
        if (i !== index) return f;

        // nutrientsData에서 foodCode 추출
        const foodCode = nutrientsData?.foodCode || f.foodCode;
        const nutrients = nutrientsData
          ? {
              carbs: nutrientsData.carbs,
              protein: nutrientsData.protein,
              fat: nutrientsData.fat,
              sugar: nutrientsData.sugar,
            }
          : f.nutrients;

        return {
          ...f,
          name,
          calories: calories !== '' ? String(calories) : f.calories,
          foodCode,
          nutrients,
        };
      }),
    );
  };

  const handleAddRow = () => setFoods((prev) => [...prev, EMPTY_FOOD()]);

  const handleRemoveRow = (index) => {
    setFoods((prev) => prev.filter((_, i) => i !== index));
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (index) => {
    fileInputRefs.current[index]?.click();
  };

  // 이미지 변경 핸들러
  const handleImageChange = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setFoods((prev) =>
          prev.map((f, i) => (i === index ? { ...f, image: imageData } : f)),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = (index, e) => {
    e.stopPropagation();
    setFoods((prev) =>
      prev.map((f, i) => (i === index ? { ...f, image: null } : f)),
    );
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = '';
    }
  };

  const handleCancel = () => {
    setFoods([EMPTY_FOOD()]);
    setMemo('');
    setOpen(false);
  };

  const handleSubmit = async () => {
    const validFoods = foods.filter((f) => f.name.trim() && f.foodCode);
    if (!validFoods.length) {
      alert('음식을 검색하여 선택해주세요.\n(음식 이름을 입력 후 드롭다운에서 선택해야 합니다)');
      return;
    }

    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 각 음식별로 API POST 요청
      const results = await Promise.all(
        validFoods.map(async (f) => {
          const response = await fetch(`${API_BASE_URL}/api/meals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              foodCode: f.foodCode,
              foodName: f.name,
              servings: 1,
              mealType: selectedMeal,
              mealTime: new Date().toISOString(),
              memo: memo || null,
              imageUrl: f.image || null,
            }),
          });

          const data = await response.json();
          console.log('API 응답:', response.status, data);

          if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
          }
          return data;
        }),
      );

      console.log('저장 완료:', results);

      // 저장 성공 후 데이터 새로고침
      if (onRefresh) {
        await onRefresh();
      }

      setFoods([EMPTY_FOOD()]);
      setMemo('');
      setOpen(false);
    } catch (error) {
      console.error('식사 기록 저장 실패:', error);
      alert(`저장에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1.5px dashed',
        borderColor: open ? '#FF8243' : '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        mt: 1,
      }}
    >
      {/* 헤더 */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#fff8f5' },
          transition: 'background 0.2s',
        }}
      >
        <Avatar
          sx={{ width: 36, height: 36, bgcolor: '#fff3ed', color: '#FF8243' }}
        >
          <Add sx={{ fontSize: 20 }} />
        </Avatar>
        <Typography fontWeight={600} color="#FF8243">
          기록 추가
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small">
          {open ? (
            <ExpandLess fontSize="small" />
          ) : (
            <ExpandMore fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {/* 끼니 선택 */}
            <FormControl size="small" fullWidth>
              <InputLabel>끼니 선택</InputLabel>
              <Select
                value={selectedMeal}
                label="끼니 선택"
                onChange={(e) => setSelectedMeal(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                {MEALS.map((m) => (
                  <MenuItem key={m.key} value={m.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <m.Icon sx={{ fontSize: 18, color: m.color }} />
                      {m.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 음식 목록 입력 행들 */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="text.secondary"
                >
                  음식 목록
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {foods.length}개 항목
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {foods.map((food, index) => (
                  <Box
                    key={index}
                    sx={{
                      bgcolor: '#f8fafc',
                      borderRadius: 2,
                      p: 1.5,
                      border: '1px solid #e8ecf0',
                    }}
                  >
                    {/* 상단: 순번, 음식이름, 칼로리, 삭제버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* 순번 */}
                      <Typography
                        variant="caption"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: selectedMealInfo?.bg,
                          color: selectedMealInfo?.darkColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          flexShrink: 0,
                          fontSize: '0.65rem',
                        }}
                      >
                        {index + 1}
                      </Typography>

                      {/* 음식 이름 (검색 자동완성) */}
                      <FoodSearchInput
                        value={food.name}
                        onChange={(name, calories, nutrients) =>
                          handleFoodSelect(index, name, calories, nutrients)
                        }
                      />

                      {/* 칼로리 */}
                      <TextField
                        size="small"
                        placeholder="kcal"
                        type="number"
                        value={food.calories}
                        onChange={(e) =>
                          handleFoodChange(index, 'calories', e.target.value)
                        }
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            bgcolor: '#fff',
                            fontSize: '0.875rem',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e8ecf0',
                          },
                          '& input': { textAlign: 'right' },
                        }}
                      />

                      {/* 삭제 버튼 */}
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRow(index)}
                        disabled={foods.length === 1}
                        sx={{
                          color: '#cbd5e1',
                          flexShrink: 0,
                          '&:hover': { color: '#EF5350', bgcolor: '#fef2f2' },
                          '&.Mui-disabled': { opacity: 0.3 },
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* 하단: 사진 추가 영역 */}
                    <Box sx={{ mt: 1, ml: 3.5 }}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        onChange={(e) => handleImageChange(index, e)}
                        style={{ display: 'none' }}
                      />
                      {food.image ? (
                        <Box
                          sx={{ position: 'relative', display: 'inline-block' }}
                        >
                          <Box
                            component="img"
                            src={food.image}
                            alt="음식 사진"
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1.5,
                              border: '2px solid #e8ecf0',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleImageClick(index)}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => handleImageRemove(index, e)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              width: 20,
                              height: 20,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            <DeleteOutline sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          onClick={() => handleImageClick(index)}
                          sx={{
                            width: 80,
                            height: 80,
                            border: '2px dashed #d0d5dd',
                            borderRadius: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: '0.2s',
                            '&:hover': {
                              borderColor: '#FF8243',
                              bgcolor: '#fff8f5',
                            },
                          }}
                        >
                          <AddPhotoAlternate
                            sx={{ fontSize: 24, color: '#cbd5e1' }}
                          />
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: '0.65rem', mt: 0.3 }}
                          >
                            사진 추가
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* 행 추가 버튼 */}
              <Button
                size="small"
                startIcon={<Add />}
                onClick={handleAddRow}
                sx={{
                  mt: 1,
                  color: '#FF8243',
                  fontSize: '0.8rem',
                  '&:hover': { bgcolor: '#fff3ed' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 1.5,
                }}
              >
                음식 추가
              </Button>
            </Box>

            {/* 칼로리 합계 */}
            {totalCalories > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: '#fff3ed',
                  borderRadius: 2,
                  px: 2,
                  py: 1.2,
                  border: '1px solid #ffe0cc',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  합계 칼로리
                </Typography>
                <Typography fontWeight={800} color="#E05A1F">
                  {totalCalories.toLocaleString()} kcal
                </Typography>
              </Box>
            )}

            {/* 메모 입력 */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                mb={1}
                color="text.secondary"
              >
                메모
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="식사에 대한 메모를 남겨보세요..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <EditNote
                      sx={{
                        color: 'text.disabled',
                        mr: 1,
                        mt: '2px',
                        alignSelf: 'flex-start',
                        fontSize: 20,
                      }}
                    />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    bgcolor: '#fff',
                    borderRadius: 2,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e8ecf0',
                  },
                }}
              />
            </Box>

            {/* 하단 버튼 */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderColor: '#e2e8f0',
                  color: 'text.secondary',
                  borderRadius: 2,
                }}
              >
                취소
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSubmit}
                startIcon={<Add />}
                sx={{ borderRadius: 2 }}
              >
                {foods.filter((f) => f.name.trim()).length}개 저장
              </Button>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─── 달력 ────────────────────────────────────────────────────────────────────
function CustomCalendar({
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
  dayData,
}) {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekLabels = ['일', '월', '화', '수', '목', '금', '토'];

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 선택된 날짜의 총 칼로리 계산
  const selectedDateStr = formatDate(selectedDate);
  const selectedDayCalories = dayData?.summary?.calories || 0;

  return (
    <Box>
      {/* 월 이동 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <IconButton size="small" onClick={() => onMonthChange(-1)}>
          <ChevronLeft />
        </IconButton>
        <Typography fontWeight={700} fontSize="1rem">
          {year}년 {month + 1}월
        </Typography>
        <IconButton
          size="small"
          onClick={() => onMonthChange(1)}
          disabled={year === today.getFullYear() && month >= today.getMonth()}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* 요일 헤더 */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}
      >
        {weekLabels.map((d, i) => (
          <Typography
            key={d}
            variant="caption"
            align="center"
            fontWeight={600}
            sx={{
              color:
                i === 0 ? '#EF5350' : i === 6 ? '#5C6BC0' : 'text.secondary',
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* 날짜 그리드 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.3,
        }}
      >
        {cells.map((day, idx) => {
          if (!day) return <Box key={idx} />;

          const thisDate = new Date(year, month, day);
          const dateStr = formatDate(thisDate);
          const isToday = isSameDay(thisDate, today);
          const isSelected = isSameDay(thisDate, selectedDate);
          const isFuture = thisDate > today;
          // 선택된 날짜만 데이터 유무 표시 (DB에서 불러온 데이터 기준)
          const hasData = isSelected && selectedDayCalories > 0;
          const dayOfWeek = thisDate.getDay();

          return (
            <Tooltip
              key={idx}
              title={hasData ? `${selectedDayCalories} kcal` : ''}
              arrow
              placement="top"
            >
              <Box
                onClick={() => !isFuture && onDateSelect(thisDate)}
                sx={{
                  position: 'relative',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  cursor: isFuture ? 'default' : 'pointer',
                  bgcolor: isSelected
                    ? '#FF8243'
                    : isToday
                      ? '#fff3ed'
                      : 'transparent',
                  border:
                    isToday && !isSelected
                      ? '2px solid #FF8243'
                      : '2px solid transparent',
                  opacity: isFuture ? 0.3 : 1,
                  transition: 'all 0.15s',
                  '&:hover': !isFuture
                    ? { bgcolor: isSelected ? '#E05A1F' : '#fff3ed' }
                    : {},
                }}
              >
                {isToday && isSelected && (
                  <CheckCircle
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      fontSize: 10,
                      color: '#fff',
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  fontWeight={isToday || isSelected ? 700 : 400}
                  sx={{
                    color: isSelected
                      ? '#fff'
                      : isToday
                        ? '#FF8243'
                        : dayOfWeek === 0
                          ? '#EF5350'
                          : dayOfWeek === 6
                            ? '#5C6BC0'
                            : 'text.primary',
                    fontSize: '0.8rem',
                    lineHeight: 1,
                  }}
                >
                  {day}
                </Typography>
                {hasData && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: isSelected ? 'rgba(255,255,255,0.8)' : '#FF8243',
                      mt: 0.3,
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── 영양 요약 (이전 날짜 선택 시 표시) ─────────────────────────────────────
function NutritionSummaryPanel({ date, data }) {
  const today = new Date();
  const isPast = !isSameDay(date, today);
  if (!isPast || !data) return null;

  const { calories, carbs, protein, fat, sugar } = data.summary;

  return (
    <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px dashed #e2e8f0' }}>
      <Typography
        variant="body2"
        fontWeight={700}
        color="text.secondary"
        mb={1.5}
      >
        📊 {date.getMonth() + 1}월 {date.getDate()}일 요약
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
        }}
      >
        {[
          {
            label: '칼로리',
            value: `${calories} kcal`,
            color: '#FF8243',
            bg: '#fff3ed',
          },
          {
            label: '탄수화물',
            value: `${carbs}g`,
            color: '#FFA726',
            bg: '#fff8f0',
          },
          {
            label: '단백질',
            value: `${protein}g`,
            color: '#66BB6A',
            bg: '#f0faf0',
          },
          { label: '지방', value: `${fat}g`, color: '#EF5350', bg: '#fff0f0' },
          {
            label: '당류',
            value: `${sugar}g`,
            color: '#AB47BC',
            bg: '#faf0ff',
          },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              bgcolor: item.bg,
              borderRadius: 2,
              p: 1.2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: item.color }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function DailyLogPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [dayData, setDayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanPreview, setScanPreview] = useState(null); // { image, mealType }

  // API에서 날짜별 식사 데이터 불러오기
  const fetchDailyData = async (date, userId) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const dateStr = formatDate(date);
      const response = await fetch(
        `${API_BASE_URL}/api/diary/daily?userId=${userId}&date=${dateStr}`,
      );
      if (response.ok) {
        const data = await response.json();
        console.log('식사 기록 조회:', data);
        const transformed = transformApiResponse(data);
        setDayData(transformed);
      } else {
        console.error('식사 기록 조회 실패:', response.status);
        setDayData(null);
      }
    } catch (error) {
      console.error('식사 기록 조회 실패:', error);
      setDayData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 오늘 날짜 데이터 불러오기
  useEffect(() => {
    if (user?.id) {
      fetchDailyData(today, user.id);
    }
  }, [user?.id]);

  // ScanAnalysis에서 기록하기로 넘어온 데이터 처리
  const scanProcessedRef = useRef(false);
  useEffect(() => {
    const s = location.state;
    if (
      !s?.fromScan ||
      !s.mealType ||
      !s.foods?.length ||
      scanProcessedRef.current
    )
      return;
    scanProcessedRef.current = true;

    const scanDate = s.date ? new Date(s.date + 'T12:00:00') : today;
    setSelectedDate(scanDate);
    setCurrentMonth(new Date(scanDate.getFullYear(), scanDate.getMonth(), 1));
    if (s.image && s.mealType)
      setScanPreview({ image: s.image, mealType: s.mealType });

    // ScanAnalysis에서 넘어온 후 해당 날짜 데이터 새로고침
    if (user?.id) {
      fetchDailyData(scanDate, user.id);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [user?.id]);

  const handleMonthChange = (delta) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));

    // 해당 날짜의 식사 기록 조회
    if (user?.id) {
      await fetchDailyData(date, user.id);
    }
  };

  // 저장 후 데이터 새로고침
  const handleRefreshData = async () => {
    if (user?.id) {
      await fetchDailyData(selectedDate, user.id);
    }
  };

  const dateStr = formatDate(selectedDate);
  const isToday = isSameDay(selectedDate, today);

  const totalCalories = dayData
    ? MEALS.reduce((sum, m) => sum + getMealTotalCalories(dayData[m.key]), 0)
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* 상단 네비 */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #e8ecf0',
          px: { xs: 2, md: 4 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box>
          <Typography fontWeight={800} fontSize="1.1rem" lineHeight={1.2}>
            일일 식단 기록
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Daily Log
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {isToday && totalCalories > 0 && (
          <Chip
            icon={
              <LocalFireDepartment
                sx={{
                  fontSize: '16px !important',
                  color: '#FF8243 !important',
                }}
              />
            }
            label={`오늘 ${totalCalories} kcal`}
            size="small"
            sx={{ bgcolor: '#fff3ed', color: '#E05A1F', fontWeight: 700 }}
          />
        )}
      </Box>

      {/* 본문 */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          p: { xs: 2, md: 3 },
          maxWidth: 1100,
          mx: 'auto',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* ── 왼쪽: 달력 패널 ── */}
        <Box sx={{ width: { xs: '100%', md: 400, lg: 500 }, flexShrink: 0 }}>
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e8ecf0' }}
          >
            <CustomCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              dayData={dayData}
            />
            <NutritionSummaryPanel date={selectedDate} data={dayData} />
          </Paper>
        </Box>

        {/* ── 오른쪽: 타임라인 ── */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* 날짜 헤더 */}
          <Box
            sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box>
              <Typography component="div" fontWeight={800} fontSize="1.2rem">
                {getKoreanDate(selectedDate)}
                {isToday && (
                  <Chip
                    label="오늘"
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: '#FF8243',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                )}
              </Typography>
              {totalCalories > 0 && (
                <Typography variant="body2" color="text.secondary">
                  총 섭취 칼로리:{' '}
                  <Typography component="span" fontWeight={700} color="#FF8243">
                    {totalCalories} kcal
                  </Typography>
                </Typography>
              )}
            </Box>
          </Box>

          {/* 타임라인 */}
          <Stack spacing={0}>
            {MEALS.map((meal, index) => (
              <Box key={meal.key} sx={{ display: 'flex', gap: 2 }}>
                {/* 타임라인 인디케이터 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 20,
                    flexShrink: 0,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: dayData?.[meal.key]?.foods?.length
                        ? meal.color
                        : '#e2e8f0',
                      border: `2px solid ${meal.color}`,
                      zIndex: 1,
                      flexShrink: 0,
                    }}
                  />
                  {index < MEALS.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        bgcolor: '#e8ecf0',
                        my: 0.5,
                        minHeight: 24,
                      }}
                    />
                  )}
                </Box>

                {/* 식사 카드 */}
                <Box
                  sx={{ flexGrow: 1, pb: index < MEALS.length - 1 ? 1.5 : 0 }}
                >
                  <MealCard
                    meal={meal}
                    data={dayData?.[meal.key]}
                    isToday={isToday}
                    dateStr={dateStr}
                    scanImage={scanPreview?.image}
                    scanMealType={scanPreview?.mealType}
                  />
                </Box>
              </Box>
            ))}

            {/* 기록 추가 영역 */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
              <Box sx={{ width: 20, flexShrink: 0 }} />
              <Box sx={{ flexGrow: 1 }}>
                <AddRecordCard onRefresh={handleRefreshData} userId={user?.id} />
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
