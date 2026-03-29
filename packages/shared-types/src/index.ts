// --- Auth ---
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileEmoji: string;
  household: { id: string; name: string; role: MemberRole } | null;
}

// --- Household ---
export type MemberRole = 'admin' | 'member';

export interface HouseholdMember {
  userId: string;
  name: string;
  profileEmoji: string;
  role: MemberRole;
  joinedAt: string;
}

// --- Item ---
export interface Item {
  id: string;
  emoji: string;
  name: string;
  quantity: number;
  space: string;
  zone: string | null;
  details: string[];
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

export interface CreateItemRequest {
  emoji?: string;
  name: string;
  quantity?: number;
  space: string;
  zone?: string;
  details?: string[];
}

export interface UpdateItemRequest {
  emoji?: string;
  name?: string;
  quantity?: number;
  space?: string;
  zone?: string;
  details?: string[];
}

// --- Invite ---
export interface InviteInfo {
  householdName: string;
  invitedByName: string;
  expiresAt: string;
}

// --- WebSocket ---
export type WsEvent =
  | { event: 'item:created'; data: Item }
  | { event: 'item:updated'; data: Item }
  | { event: 'item:deleted'; data: { id: string } }
  | { event: 'member:joined'; data: HouseholdMember }
  | { event: 'member:removed'; data: { userId: string } };
