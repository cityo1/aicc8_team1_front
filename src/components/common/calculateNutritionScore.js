/**
 * 종합 영양 점수 계산기 (HoneyMat Engine)
 * @param {Object} user - { age, gender, height, weight }
 * @param {Object} meal - { calories, carbs, sugar, protein, fat } (단위: kcal, g)
 * @returns {{ totalScore: number, breakdown: Object, target: Object }}
 */
export function calculateNutritionScore(user, meal) {
  // 1. 기초대사량(BMR) 계산 (Mifflin-St Jeor 공식)
  let bmr;
  if (user.gender === 'male') {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }

  // 2. 활동 계수 적용 (보통 활동량 기준 1.4) 및 한 끼 권장량(1/3) 설정
  const dailyCalories = bmr * 1.4;
  const target = {
    calories: dailyCalories / 3,
    carbs: (dailyCalories * 0.5) / 4 / 3, // 탄수화물 50%, 1g=4kcal
    protein: (dailyCalories * 0.2) / 4 / 3, // 단백질 20%, 1g=4kcal
    fat: (dailyCalories * 0.3) / 9 / 3, // 지방 30%, 1g=9kcal
    sugar: (dailyCalories * 0.1) / 4 / 3, // 당류 10% 미만 권고
  };

  // 3. 각 요소별 점수 계산 (가우스 함수 형태의 유사 로직)
  // 목표치에 가까울수록 고점, 멀어질수록 감점
  const getComponentScore = (input, goal, type) => {
    const ratio = input / goal;

    if (type === 'sugar') {
      // 당류는 적을수록 좋고, 권장량 초과 시 급격히 감점
      return ratio <= 1 ? 100 : Math.max(0, 100 - (ratio - 1) * 150);
    }

    if (type === 'protein') {
      // 단백질은 부족하면 감점이 크고, 초과 시 감점은 적게 (근성장 유리)
      if (ratio < 1) return ratio * 100;
      return Math.max(70, 100 - (ratio - 1) * 20);
    }

    // 칼로리, 탄수화물, 지방 (범위 점수)
    // 목표치의 80%~120% 사이면 고점
    let score = 100 - Math.abs(1 - ratio) * 80;
    return Math.max(0, score);
  };

  const scores = {
    cal: getComponentScore(meal.calories, target.calories, 'calories'),
    carb: getComponentScore(meal.carbs, target.carbs, 'carbs'),
    pro: getComponentScore(meal.protein, target.protein, 'protein'),
    fat: getComponentScore(meal.fat, target.fat, 'fat'),
    sug: getComponentScore(meal.sugar, target.sugar, 'sugar'),
  };

  // 4. 가중치 설정 (사용자 유형별로 변수화 가능)
  // 여기서는 일반적인 균형 가중치 적용
  const weights = { cal: 0.2, carb: 0.2, pro: 0.25, fat: 0.15, sug: 0.2 };

  const totalScore =
    scores.cal * weights.cal +
    scores.carb * weights.carb +
    scores.pro * weights.pro +
    scores.fat * weights.fat +
    scores.sug * weights.sug;

  return {
    totalScore: Math.round(totalScore),
    breakdown: scores,
    target: target,
  };
}

/** ageGroup 문자열 → 나이 숫자 (BMR 계산용) */
export function ageGroupToAge(ageGroup) {
  const map = { '10대': 15, '20대': 25, '30대': 35, '40대': 45, '50대 이상': 55 };
  return map[ageGroup] ?? 30;
}

/** 사용자 프로필 → calculateNutritionScore용 user 객체 (없으면 기본값) */
export function buildUserForScore(userProfile) {
  const defaults = { age: 30, gender: 'male', height: 170, weight: 70 };
  if (!userProfile) return defaults;
  const age = userProfile.age ?? ageGroupToAge(userProfile.ageGroup) ?? defaults.age;
  const gender = (userProfile.gender || defaults.gender).toLowerCase();
  const height = Number(userProfile.height) || defaults.height;
  const weight = Number(userProfile.weight) || defaults.weight;
  return { age, gender: gender === 'female' ? 'female' : 'male', height, weight };
}
