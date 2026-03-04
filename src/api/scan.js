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
