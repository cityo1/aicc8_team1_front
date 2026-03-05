const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * 식사 사진 업로드 → AI 영양 분석
 * @param {File} file - 이미지 파일 (JPEG, PNG, WebP)
 * @returns {Promise<{ success: boolean, foods: Array, totalCalories: number }>}
 */
export async function analyzeFoodImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/api/scan/food`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `요청 실패 (${res.status})`);
  return data;
}

/**
 * 수정된 음식량으로 AI 재분석 (비율 곱 대신 AI가 새 영양정보 산출)
 * @param {Array<{ name: string, amount: number }>} foods - 사용자가 수정한 음식 목록
 * @returns {Promise<{ success: boolean, foods: Array, totalCalories: number }>}
 */
export async function reanalyzeFood(foods) {
  const res = await fetch(`${BASE_URL}/api/scan/food/reanalyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foods }),
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `요청 실패 (${res.status})`);
  return data;
}
