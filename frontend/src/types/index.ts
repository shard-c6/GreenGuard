// ═══════════════════════════════════════════════════════════
// Green Guard — TypeScript Type Definitions
// Aligned with backend Supabase schema & controller responses
// ═══════════════════════════════════════════════════════════

// ─── Enums ──────────────────────────────────────────────────

export type UserRole = 'admin' | 'ngo' | 'adopter';
export type PlantStatus = 'available' | 'pending' | 'adopted';
export type PlantHealth = 'healthy' | 'needs_attention' | 'critical' | 'dead';
export type AdoptionStatus = 'pending' | 'approved' | 'rejected';
export type NgoStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ReportReason = 'spam' | 'harassment' | 'fake_ngo' | 'misinformation' | 'inappropriate_content' | 'other';

// ─── Response Wrappers ──────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: { code: string; message: string };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

// ─── Auth ───────────────────────────────────────────────────

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginResponse {
  user: AuthUser;
  session: AuthSession;
}

export interface RegisterResponse {
  user: AuthUser;
  session?: AuthSession;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  display_name?: string;
  ngo_status?: NgoStatus | null;
}

// ─── User / Profile ────────────────────────────────────────

export interface User {
  id: string;
  role: UserRole;
  username: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  address: string | null;
  is_banned: boolean;
  banned_reason: string | null;
  created_at: string;
  updated_at: string;
  // Extended profile fields
  ngo_profile?: NgoProfile | null;
  followers_count?: number;
  following_count?: number;
  plants_count?: number;
  posts_count?: number;
  is_following?: boolean;
}

export interface NgoProfile {
  id?: string;
  org_name: string;
  registration_number: string | null;
  website: string | null;
  mission: string | null;
  address: string | null;
  darpan_id: string | null;
  onboarding_answers: Record<string, string> | null;
  status: NgoStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at?: string;
  // Joined profiles
  profiles?: ProfileSummary;
}

export interface ProfileSummary {
  id?: string;
  username: string;
  display_name: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  email?: string;
  phone?: string;
  is_banned?: boolean;
  created_at?: string;
}

// ─── Plant ──────────────────────────────────────────────────

export interface Plant {
  id: string;
  ngo_id: string;
  plant_name: string;
  species: string | null;
  description: string | null;
  image_urls: string[];
  location: string | null; // PostGIS POINT string
  address: string | null;
  planted_date: string | null;
  care_info: Record<string, unknown> | null;
  ai_profile: Record<string, unknown> | null;
  adoption_status: PlantStatus;
  adopted_by: string | null;
  adopted_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: ProfileSummary;
}

export interface NearbyPlant {
  id: string;
  ngo_id: string;
  plant_name: string;
  species: string | null;
  image_urls: string[];
  adoption_status: PlantStatus;
  adopted_by: string | null;
  address: string | null;
  distance_meters: number;
  latitude: number;
  longitude: number;
}

export interface MapPlant {
  id: string;
  plant_name: string;
  species: string | null;
  location: string | null;
  latitude?: number;
  longitude?: number;
  adoption_status: PlantStatus;
  adopted_by: string | null;
  image_urls: string[];
  ngo_id: string;
  profiles?: { display_name: string | null };
}

// ─── Adoption ───────────────────────────────────────────────

export interface Adoption {
  id: string;
  plant_id: string;
  adopter_id: string;
  ngo_id: string;
  status: AdoptionStatus;
  answers: Record<string, string> | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined
  plants?: {
    plant_name: string;
    species: string | null;
    image_urls: string[];
    location: string | null;
    address: string | null;
  };
  profiles?: ProfileSummary;
}

// ─── Post / Feed ────────────────────────────────────────────

export interface Post {
  id: string;
  author_id: string;
  content: string | null;
  image_urls: string[];
  plant_id: string | null;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  location: string | null;
  latitude?: number;
  longitude?: number;
  address: string | null;
  created_at: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  // Joined
  profiles?: ProfileSummary;
}

// ─── Comment ────────────────────────────────────────────────

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined
  profiles?: ProfileSummary;
}

// ─── Growth Report ──────────────────────────────────────────

export interface GrowthReport {
  id: string;
  plant_id: string;
  adopter_id: string;
  health_status: PlantHealth;
  height_cm: number | null;
  notes: string | null;
  photo_urls: string[];
  created_at: string;
  // Joined
  plants?: { plant_name: string; species: string | null };
  profiles?: ProfileSummary;
}

// ─── Notification ───────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// ─── Admin ──────────────────────────────────────────────────

export interface PlatformStats {
  total_adopters: number;
  total_approved_ngos: number;
  total_plants: number;
  total_adoptions: number;
}

export interface AdminDashboard {
  total_users: number;
  total_plants: number;
  total_adoptions: number;
  total_posts: number;
  total_ngos: number;
  total_pending_ngos: number;
  total_adopters: number;
  total_reports: number;
  total_pending_reports: number;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  // Joined
  reporter?: ProfileSummary;
  reported_user?: ProfileSummary & { is_banned?: boolean };
}

// ─── NGO Dashboard ──────────────────────────────────────────

export interface NgoDashboard {
  total_plants: number;
  total_adopted: number;
  pending_applications: number;
}

export interface NgoStatsResponse {
  chart: Array<{ month: string; planted: number; adopted: number }>;
  totals: { planted: number; adopted: number; available: number };
}

// ─── AI ─────────────────────────────────────────────────────

export interface AiIdentifyResponse {
  identification: Record<string, unknown>;
  message: string;
}

export interface AiStatusResponse {
  available: boolean;
  message: string;
}
