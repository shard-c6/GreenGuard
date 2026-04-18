import axios from 'axios';
import type {
  ApiResponse, LoginResponse, RegisterResponse, AuthUser,
  Plant, NearbyPlant, MapPlant, Adoption, Post, Comment,
  GrowthReport, Notification, PlatformStats, AdminDashboard, UserReport, NgoDashboard,
  NgoStatsResponse, NgoProfile, User, AiIdentifyResponse, AiStatusResponse
} from '@/types';

// ─── Axios Instance ──────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid
      localStorage.removeItem('gg_token');
      localStorage.removeItem('gg_refresh_token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; username: string; display_name: string; role: string }) =>
    api.post<ApiResponse<RegisterResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  logout: () =>
    api.post<ApiResponse<{ message: string }>>('/auth/logout'),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),

  updateMe: (data: { display_name?: string; bio?: string; phone?: string; address?: string }) =>
    api.put<ApiResponse<User>>('/auth/me', data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (new_password: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { new_password }),

  getAuthorizeUrl: (provider: string) =>
    api.get<ApiResponse<{ url: string }>>(`/auth/authorize/${provider}`),
};

// ─── Plants ──────────────────────────────────────────────────

export const plantsApi = {
  getPlants: (params?: { page?: number; limit?: number; status?: string; ngo_id?: string }) =>
    api.get<ApiResponse<Plant[]>>('/plants', { params }),

  getPlant: (id: string) =>
    api.get<ApiResponse<Plant>>(`/plants/${id}`),

  createPlant: (formData: FormData) =>
    api.post<ApiResponse<Plant>>('/plants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updatePlant: (id: string, data: Partial<Plant>) =>
    api.put<ApiResponse<Plant>>(`/plants/${id}`, data),

  deletePlant: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/plants/${id}`),

  getNearbyPlants: (lat: number, lng: number, radius?: number) =>
    api.get<ApiResponse<NearbyPlant[]>>('/plants/nearby', { params: { lat, lng, radius } }),

  getMapPlants: () =>
    api.get<ApiResponse<MapPlant[]>>('/plants/map'),
};

// ─── Adoptions ───────────────────────────────────────────────

export const adoptionsApi = {
  apply: (plantId: string, answers: Record<string, string>) =>
    api.post<ApiResponse<Adoption>>(`/adoptions/${plantId}/apply`, { answers }),

  getMyAdoptions: () =>
    api.get<ApiResponse<Adoption[]>>('/adoptions/my'),

  getAdoption: (id: string) =>
    api.get<ApiResponse<Adoption>>(`/adoptions/${id}`),

  approve: (id: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/adoptions/${id}/approve`),

  reject: (id: string, review_notes?: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/adoptions/${id}/reject`, { review_notes }),
};

// ─── Feed / Posts ────────────────────────────────────────────

export const feedApi = {
  getFeed: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Post[]>>('/posts', { params }),

  getPost: (id: string) =>
    api.get<ApiResponse<Post>>(`/posts/${id}`),

  createPost: (formData: FormData) =>
    api.post<ApiResponse<Post>>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deletePost: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/posts/${id}`),

  toggleLike: (id: string) =>
    api.post<ApiResponse<{ liked: boolean }>>(`/posts/${id}/like`),

  toggleBookmark: (id: string) =>
    api.post<ApiResponse<{ bookmarked: boolean }>>(`/posts/${id}/bookmark`),

  getBookmarks: () =>
    api.get<ApiResponse<Post[]>>('/posts/bookmarks'),

  getComments: (postId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`, { params }),

  addComment: (postId: string, content: string) =>
    api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content }),

  deleteComment: (postId: string, commentId: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/posts/${postId}/comments/${commentId}`),

  getMapPlantations: () =>
    api.get<ApiResponse<Post[]>>('/posts/map'),
};

// ─── Profiles / Users ────────────────────────────────────────

export const usersApi = {
  getProfile: (userId: string) =>
    api.get<ApiResponse<User>>(`/profiles/${userId}`),

  getUserPosts: (userId: string) =>
    api.get<ApiResponse<Post[]>>(`/profiles/${userId}/posts`),

  getUserPlants: (userId: string) =>
    api.get<ApiResponse<Plant[]>>(`/profiles/${userId}/plants`),

  follow: (userId: string) =>
    api.post<ApiResponse<{ following: boolean }>>(`/profiles/${userId}/follow`),

  unfollow: (userId: string) =>
    api.delete<ApiResponse<{ following: boolean }>>(`/profiles/${userId}/follow`),

  getFollowers: (userId: string) =>
    api.get<ApiResponse<AuthUser[]>>(`/profiles/${userId}/followers`),

  getFollowing: (userId: string) =>
    api.get<ApiResponse<AuthUser[]>>(`/profiles/${userId}/following`),
};

// ─── Growth Reports ──────────────────────────────────────────

export const reportsApi = {
  createReport: (formData: FormData) =>
    api.post<ApiResponse<GrowthReport>>('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMyReports: () =>
    api.get<ApiResponse<GrowthReport[]>>('/reports/my'),

  getPlantReports: (plantId: string) =>
    api.get<ApiResponse<GrowthReport[]>>(`/reports/plant/${plantId}`),
};

// ─── Notifications ───────────────────────────────────────────

export const notificationsApi = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Notification[]>>('/notifications', { params }),

  getUnreadCount: () =>
    api.get<ApiResponse<{ unread_count: number }>>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<{ message: string }>>('/notifications/read-all'),
};

// ─── Admin ───────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<AdminDashboard>>('/admin/dashboard'),

  getStats: () =>
    api.get<ApiResponse<PlatformStats>>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params }),

  getNgos: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<NgoProfile[]>>('/admin/ngos', { params }),

  approveNgo: (ngoId: string) =>
    api.patch<ApiResponse<{ ngo_id: string; status: string }>>(`/admin/ngos/${ngoId}/approve`),

  rejectNgo: (ngoId: string, reason?: string) =>
    api.patch<ApiResponse<{ ngo_id: string; status: string }>>(`/admin/ngos/${ngoId}/reject`, { reason }),

  banUser: (userId: string, reason?: string) =>
    api.patch<ApiResponse<{ user_id: string; is_banned: boolean }>>(`/admin/users/${userId}/ban`, { reason }),

  unbanUser: (userId: string) =>
    api.patch<ApiResponse<{ user_id: string; is_banned: boolean }>>(`/admin/users/${userId}/unban`),

  getReports: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<UserReport[]>>('/admin/reports', { params }),

  resolveReport: (reportId: string, status: 'resolved' | 'dismissed', admin_notes?: string) =>
    api.patch<ApiResponse<UserReport>>(`/admin/reports/${reportId}/resolve`, { status, admin_notes }),
};

// ─── NGO Dashboard ───────────────────────────────────────────

export const ngoApi = {
  getDashboard: () =>
    api.get<ApiResponse<NgoDashboard>>('/ngo/dashboard'),

  getStats: () =>
    api.get<ApiResponse<NgoStatsResponse>>('/ngo/stats'),

  getApplications: (params?: { status?: string }) =>
    api.get<ApiResponse<Adoption[]>>('/ngo/applications', { params }),

  submitOnboarding: (data: {
    org_name: string; registration_number?: string;
    website?: string; mission?: string; address?: string;
    darpan_id?: string; onboarding_answers?: Record<string, string>;
  }) =>
    api.post<ApiResponse<NgoProfile>>('/ngo/onboarding', data),
};

// ─── AI ──────────────────────────────────────────────────────

export const aiApi = {
  identify: (formData: FormData) =>
    api.post<ApiResponse<AiIdentifyResponse>>('/ai/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  identifyPlant: (formData: FormData) =>
    api.post<ApiResponse<AiIdentifyResponse>>('/ai/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getStatus: () =>
    api.get<ApiResponse<AiStatusResponse>>('/ai/status'),
};

export default api;
