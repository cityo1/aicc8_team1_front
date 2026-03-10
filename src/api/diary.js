const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * AI 식단 분석 결과를 diary_entries에 저장 (ai_scan_id 연동)
 * @param {Object} params
 * @param {string} params.userId - 사용자 ID
 * @param {string} params.mealType - breakfast | lunch | dinner | snack
 * @param {string} [params.mealTime] - ISO string (선택, 기본 현재 시각)
 * @param {string} [params.aiScanId] - ai_scans 테이블의 ID (image_url은 백엔드에서 조회)
 * @param {string} [params.imageUrl] - 분석한 사진 (선택, aiScanId 있으면 생략 가능)
 * @param {Array<{ name: string, amount: number, calories: number, carbohydrate: number, protein: number, fat: number, sugars: number }>} params.foods - 음식 목록
 */
export async function saveScanToDiary({ userId, mealType, mealTime, aiScanId, imageUrl, foods }) {
  const res = await fetch(`${BASE_URL}/api/scan/save-diary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      meal_type: mealType,
      mealTime: mealTime || new Date().toISOString(),
      ai_scan_id: aiScanId || null,
      image_url: imageUrl || null,
      foods,
    }),
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `저장 실패 (${res.status})`);
  return data;
}
