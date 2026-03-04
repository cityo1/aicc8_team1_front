const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'accessToken';

// 토큰 가져오기
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// API 요청 함수
async function request(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message ?? `요청 실패 (${res.status})`);
    }

    return data;
}

export const authApi = {
    signup: (email, password, nickname) =>
        request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, nickname }),
        }),

    login: (email, password) =>
        request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    logout: () =>
        request('/api/auth/logout', { method: 'POST' }),

    refresh: () =>
        request('/api/auth/refresh', { method: 'POST' }),
};

// 일반 API 요청용 (인증 필요한 API에서 사용)
export const api = {
    get: (path) => request(path, { method: 'GET' }),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
};
