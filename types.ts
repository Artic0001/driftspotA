

export interface Coordinate {
  lat: number;
  lng: number;
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EXTREME = 'Extreme'
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string; // 'me' or the friend's ID
  text: string;
  spotId?: string; // If this message is a shared spot
  timestamp: number;
  isRead?: boolean;
}

export interface DriftRun {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl: string;
  carModel: string;
  score: number; // AI Score (technical)
  likes: number; // Community Rating
  videoUrl?: string; // In real app, URL to storage
  timestamp: number;
  thumbnailUrl?: string;
}

export interface Spot {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  points: Coordinate[]; // The actual geometry path
  waypoints?: Coordinate[]; // The user clicks (start, mid, end)
  difficulty: Difficulty;
  driftScore: number; // Max recorded score
  likes: number;
  likedBy: string[]; // List of user IDs who liked this spot
  comments: number;
  commentsList?: Comment[];
  runs: DriftRun[];
}

export interface User {
  id: string;
  username: string;
  bio?: string;
  carModel: string; // e.g., "Nissan Silvia S15"
  carColor: string;
  totalDriftPoints: number; // Now used as "Reputation"
  rank: number;
  avatarUrl: string;
  friends: string[]; // List of friend User IDs
  incomingFriendRequests: string[]; // IDs of users who sent a request
  outgoingFriendRequests: string[]; // IDs of users we sent a request to
}

export interface DriftAnalysisResult {
  score: number;
  difficulty: Difficulty;
  commentary: string;
  technicalDetails: {
    angle: number;
    speed: number;
    continuity: number;
  };
}

export enum DangerType {
  POLICE = 'Police',
  CAMERA = 'Camera',
  POTHOLE = 'Pothole'
}

export interface DangerZone {
  id: string;
  type: DangerType;
  location: Coordinate;
  timestamp: number;
  reportedBy: string;
  comments?: Comment[];
}

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPTED = 'friend_accepted',
  SPOT_NEARBY = 'spot_nearby',
  DANGER_NEARBY = 'danger_nearby',
  SYSTEM = 'system'
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  readAt?: number;
  relatedId?: string; // userId for friend req, spotId for spot, etc.
  data?: any;
}

export type AppView = 'map' | 'profile' | 'settings' | 'leaderboard' | 'create' | 'search' | 'notifications' | 'friends' | 'chats' | 'chat';