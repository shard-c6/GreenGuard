import axios from 'axios';

interface GreenGuardUser {
  id: string;
  username?: string;
  display_name?: string;
}

interface GreenGuardSession {
  access_token: string;
  refresh_token: string;
}

interface ApiEnvelope<T> {
  data: T;
}

// Pointing to the existing GreenGuard backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  getMe: () => api.get<ApiEnvelope<GreenGuardUser>>('/auth/me'),
  login: (data: { email: string; password: string }) =>
    api.post<ApiEnvelope<{ session: GreenGuardSession }>>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const plantsApi = {
  getMyAdoptions: () => api.get('/adoptions/my'),
  getPlants: (params: Record<string, string | number | boolean | undefined>) =>
    api.get('/plants', { params }),
};

export default api;
