
import { supabase, isSupabaseConfigured } from './client';
import { User, Spot, DangerZone, NotificationType, Difficulty } from '../../types';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_SPOTS: Spot[] = [
  {
    id: 's1',
    name: 'Industrial Zone',
    creatorId: 'u2',
    creatorName: 'Driver_77',
    points: [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 40.7138, lng: -74.0050 },
      { lat: 40.7148, lng: -74.0070 }
    ],
    difficulty: Difficulty.HARD,
    driftScore: 890,
    likes: 124,
    likedBy: ['u3'],
    comments: 12,
    commentsList: [],
    runs: []
  },
  {
    id: 's2',
    name: 'Harbor Loop',
    creatorId: 'u3',
    creatorName: 'T_Master',
    points: [
      { lat: 40.7110, lng: -74.0090 },
      { lat: 40.7100, lng: -74.0100 },
    ],
    difficulty: Difficulty.MEDIUM,
    driftScore: 650,
    likes: 45,
    likedBy: [],
    comments: 3,
    commentsList: [],
    runs: []
  }
];

const MOCK_USER: User = {
  id: 'u1',
  username: 'DriftKing',
  bio: 'Sideways since 2012. Touge specialist.',
  carModel: 'Nissan Silvia S15',
  carColor: '#FF0033',
  totalDriftPoints: 0,
  rank: 1,
  avatarUrl: 'https://picsum.photos/200/200?random=1',
  friends: ['u2'],
  incomingFriendRequests: [],
  outgoingFriendRequests: []
};

// --- DB FUNCTIONS ---

export const db = {
  // --- USERS ---
  async checkUsernameUnique(username: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
       // Mock: "admin" is taken
       return username.toLowerCase() !== 'admin';
    }
    const { count, error } = await supabase!
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('username', username);
    
    if (error) throw error;
    return count === 0;
  },

  async createUserProfile(user: User): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase!.from('profiles').insert(user);
    if (error) throw error;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured()) return MOCK_USER;
    const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data as User;
  },

  // --- SPOTS ---
  async fetchSpots(): Promise<Spot[]> {
    if (!isSupabaseConfigured()) return MOCK_SPOTS;
    const { data, error } = await supabase!.from('spots').select('*');
    if (error) {
      console.error('Error fetching spots:', error);
      return [];
    }
    return data as Spot[];
  },

  async createSpot(spot: Spot): Promise<Spot> {
    if (!isSupabaseConfigured()) return spot;
    const { data, error } = await supabase!.from('spots').insert(spot).select().single();
    if (error) throw error;
    return data as Spot;
  },

  async checkSpotNameUnique(name: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    const { count, error } = await supabase!
      .from('spots')
      .select('*', { count: 'exact', head: true })
      .ilike('name', name);
    
    if (error) throw error;
    return count === 0;
  },

  // --- NOTIFICATIONS ---
  async fetchNotifications(userId: string) {
     if (!isSupabaseConfigured()) return [];
     const { data } = await supabase!.from('notifications').select('*').eq('user_id', userId);
     return data || [];
  },

  // --- DANGER ZONES ---
  async fetchDangerZones(): Promise<DangerZone[]> {
     if (!isSupabaseConfigured()) return [];
     const { data } = await supabase!.from('danger_zones').select('*');
     return data || [];
  },

  async addDangerZone(zone: DangerZone): Promise<void> {
     if (!isSupabaseConfigured()) return;
     await supabase!.from('danger_zones').insert(zone);
  }
};

// Helper for username suggestions
export const generateUsernameSuggestions = (base: string): string[] => {
  const random = () => Math.floor(Math.random() * 999);
  return [
    `${base}_${random()}`,
    `${base}${random()}`,
    `Drift${base}`,
    `${base}_official`
  ];
};
