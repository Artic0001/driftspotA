
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Spot, User, Coordinate, Difficulty, DriftAnalysisResult, DangerZone, DangerType, Comment, DriftRun, AppNotification, NotificationType, Message, AppView } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { analyzeDriftRun } from '../services/geminiService';
import { db, generateUsernameSuggestions } from '../lib/supabase/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { validateUsername, validateSpotName, sanitize } from '../lib/validation';

// --- CONSTANTS ---
const TRANSLATIONS = {
  en: {
    map: "Map",
    leaderboard: "Top List",
    search: "Search",
    profile: "Profile",
    garage: "GARAGE",
    cityRank: "CITY RANK",
    totalPoints: "REPUTATION",
    mySpots: "MY SPOTS",
    createdSpots: "CREATED SPOTS",
    addFriend: "Add Friend",
    removeFriend: "Unfriend",
    pending: "Pending",
    accept: "Accept",
    decline: "Decline",
    friends: "Friends",
    chats: "Chats",
    notifications: "Notifications",
    noNotifications: "No new notifications",
    share: "Share",
    driveHere: "Drive Here",
    startRun: "Start Run",
    uploadRun: "UPLOAD YOUR RUN",
    info: "Info & Chat",
    runs: "Runs",
    comments: "Comments",
    writeComment: "Write a comment...",
    buildingTrack: "BUILDING SPOT",
    calculating: "CALCULATING ROUTE...",
    tapPoints: "Tap points to draw the line.",
    spotNamePlaceholder: "Name your spot...",
    finish: "Finish & Publish",
    cancel: "Cancel",
    save: "Save Changes",
    settings: "Settings",
    editProfile: "Edit Profile",
    general: "General",
    account: "Account",
    username: "Username",
    carModel: "Car Model",
    bio: "Bio",
    dangerTap: "Tap map to place",
    police: "Police",
    camera: "Camera",
    pothole: "Hazard",
    delete: "Delete",
    language: "Language",
    shareSuccess: "Link copied!",
    noRuns: "No runs recorded yet. Be the first legend.",
    noSpots: "No spots found.",
    noRacers: "No racers found.",
    noChat: "No chatter yet.",
    changePhoto: "Tap to Change Photo",
    shareWith: "Share with Friends",
    copyLink: "Copy Link",
    sent: "Sent!",
    message: "Message",
    noMessages: "No messages yet. Start a conversation!",
    you: "You",
    logout: "Log Out",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteAccountConfirm: "Are you sure? This cannot be undone.",
    login: "Login",
    register: "Register",
    welcome: "Welcome to DriftSpots",
    loginBtn: "Enter the Streets",
    registerBtn: "Join the Crew",
    disclaimerTitle: "ROAD SAFETY WARNING",
    disclaimerText: "This application is designed solely for marking dangerous road sections and navigation. The term 'Spot' is a stylized designation for a route segment.",
    disclaimerWarning: "The developers bear no responsibility for user actions in the real world. Responsibility for driving lies entirely with the driver. OBEY TRAFFIC LAWS. DRIVE SAFELY.",
    agree: "I UNDERSTAND AND AGREE",
    enableLocation: "Enable Location Access",
    locationNeeded: "DriftSpots needs your location to show spots near you.",
    usernameTaken: "Username is taken. Try one of these:",
    usernameError: "Invalid username.",
    theme: "Theme",
    light: "Light",
    dark: "Dark"
  },
  ru: {
    map: "Карта",
    leaderboard: "Топ",
    search: "Поиск",
    profile: "Профиль",
    garage: "ГАРАЖ",
    cityRank: "РЕЙТИНГ",
    totalPoints: "РЕПУТАЦИЯ",
    mySpots: "МОИ СПОТЫ",
    createdSpots: "СОЗДАННЫЕ СПОТЫ",
    addFriend: "Добавить",
    removeFriend: "Удалить",
    pending: "Ожидание",
    accept: "Принять",
    decline: "Откл.",
    friends: "Друзья",
    chats: "Чаты",
    notifications: "Уведомления",
    noNotifications: "Нет новых уведомлений",
    share: "Поделиться",
    driveHere: "Ехать сюда",
    startRun: "Начать заезд",
    uploadRun: "ЗАГРУЗИТЬ ЗАЕЗД",
    info: "Инфо",
    runs: "Заезды",
    comments: "Комменты",
    writeComment: "Написать комментарий...",
    buildingTrack: "ПОСТРОЕНИЕ СПОТА",
    calculating: "РАСЧЕТ МАРШРУТА...",
    tapPoints: "Нажимайте на карту для построения.",
    spotNamePlaceholder: "Название спота...",
    finish: "Опубликовать",
    cancel: "Отмена",
    save: "Сохранить",
    settings: "Настройки",
    editProfile: "Редактирование",
    general: "Общее",
    account: "Аккаунт",
    username: "Имя",
    carModel: "Машина",
    bio: "О себе",
    dangerTap: "Нажми на карту",
    police: "ДПС",
    camera: "Камера",
    pothole: "Опасность",
    delete: "Удалить",
    language: "Язык",
    shareSuccess: "Ссылка скопирована!",
    noRuns: "Заездов пока нет. Будь первым.",
    noSpots: "Споты не найдены.",
    noRacers: "Гонщики не найдены.",
    noChat: "Пока тишина.",
    changePhoto: "Нажми для смены фото",
    shareWith: "Отправить другу",
    copyLink: "Копировать ссылку",
    sent: "Отправлено!",
    message: "Сообщение",
    noMessages: "Сообщений пока нет. Начни чат!",
    you: "Вы",
    logout: "Выйти",
    dangerZone: "Опасная зона",
    deleteAccount: "Удалить аккаунт",
    deleteAccountConfirm: "Вы уверены? Это действие нельзя отменить.",
    login: "Вход",
    register: "Регистрация",
    welcome: "Добро пожаловать в DriftSpots",
    loginBtn: "Войти",
    registerBtn: "Создать аккаунт",
    disclaimerTitle: "ПРЕДУПРЕЖДЕНИЕ О БЕЗОПАСНОСТИ",
    disclaimerText: "Это приложение создано исключительно для отметки опасных участков дорог и навигации. Названия вроде 'Спот' — это лишь стилизация маршрутов.",
    disclaimerWarning: "Создатели не несут ответственности за действия пользователей. Вся ответственность за вождение лежит на водителе. СОБЛЮДАЙТЕ ПДД. ВОДИТЕ АККУРАТНО.",
    agree: "Я ПОНЯЛ И ПРИНИМАЮ",
    enableLocation: "Включить геолокацию",
    locationNeeded: "DriftSpots нужна ваша локация для отображения спотов рядом.",
    usernameTaken: "Имя занято. Попробуйте:",
    usernameError: "Некорректное имя.",
    theme: "Тема",
    light: "Светлая",
    dark: "Темная"
  }
};

const INITIAL_USER: User = {
  id: '',
  username: '',
  bio: '',
  carModel: '',
  carColor: '#FF0033',
  totalDriftPoints: 0,
  rank: 0,
  avatarUrl: '',
  friends: [],
  incomingFriendRequests: [],
  outgoingFriendRequests: []
};

// --- Utilities ---
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Auto Difficulty Calculation
const calculateAutoDifficulty = (points: Coordinate[]): Difficulty => {
  if (points.length < 5) return Difficulty.EASY;
  
  // Calculate total angle change to determine 'twistiness'
  let totalAngleChange = 0;
  for (let i = 1; i < points.length - 1; i++) {
     const p1 = points[i-1];
     const p2 = points[i];
     const p3 = points[i+1];
     
     const angle1 = Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat);
     const angle2 = Math.atan2(p3.lng - p2.lng, p3.lat - p2.lat);
     let diff = Math.abs(angle1 - angle2) * (180 / Math.PI);
     if (diff > 180) diff = 360 - diff;
     totalAngleChange += diff;
  }
  
  const avgAngle = totalAngleChange / (points.length - 2);
  
  if (points.length > 20 || avgAngle > 45) return Difficulty.HARD;
  if (points.length > 10 || avgAngle > 25) return Difficulty.MEDIUM;
  return Difficulty.EASY;
};

// Catmull-Rom Spline
const catmullRomSpline = (p0: Coordinate, p1: Coordinate, p2: Coordinate, p3: Coordinate, t: number): Coordinate => {
  const v0 = (c: keyof Coordinate) => 0.5 * (
    (2 * p1[c]) +
    (-p0[c] + p2[c]) * t +
    (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t * t +
    (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t * t * t
  );
  return { lat: v0('lat'), lng: v0('lng') };
};

const smoothPath = (points: Coordinate[]): Coordinate[] => {
  if (points.length < 2) return points;
  if (points.length === 2) return points;
  const path = [points[0], ...points, points[points.length - 1]];
  const smoothed: Coordinate[] = [];
  for (let i = 0; i < path.length - 3; i++) {
    const p0 = path[i];
    const p1 = path[i + 1];
    const p2 = path[i + 2];
    const p3 = path[i + 3];
    for (let t = 0; t < 1; t += 0.05) smoothed.push(catmullRomSpline(p0, p1, p2, p3, t));
  }
  smoothed.push(points[points.length - 1]);
  return smoothed;
};

// OSRM Routing
const getRoadPath = async (points: Coordinate[]): Promise<Coordinate[]> => {
  if (points.length < 2) return points;
  const coordinatesString = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const coordinates = data.routes[0].geometry.coordinates;
      return coordinates.map((coord: number[]) => ({ lat: coord[1], lng: coord[0] }));
    } else {
      return smoothPath(points);
    }
  } catch (error) {
    return smoothPath(points);
  }
};

const calculateUserRating = (userId: string, allSpots: Spot[]): number => {
    const userSpots = allSpots.filter(s => s.creatorId === userId);
    const spotPoints = userSpots.reduce((acc, s) => acc + (s.likes * 10), 0);
    let runPoints = 0;
    allSpots.forEach(spot => {
        spot.runs.forEach(run => {
            if (run.userId === userId) runPoints += (run.likes || 0) * 5;
        });
    });
    return spotPoints + runPoints;
};

// Web Audio Helper
const playAlertSound = (type: 'danger' | 'info') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'danger') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const triggerHaptic = (type: 'danger' | 'info') => {
  if (navigator.vibrate) {
    if (type === 'danger') navigator.vibrate([200, 100, 200, 100, 200]);
    else navigator.vibrate(200);
  }
};

// --- Context Type ---
interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  authMode: 'login' | 'register';
  setAuthMode: React.Dispatch<React.SetStateAction<'login' | 'register'>>;
  authForm: any;
  setAuthForm: React.Dispatch<React.SetStateAction<any>>;
  authError: string | null;
  usernameSuggestions: string[];
  handleAuth: () => void;
  lang: 'en' | 'ru';
  t: (key: string) => string;
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showDisclaimer: boolean;
  setShowDisclaimer: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  view: AppView;
  setView: (view: AppView) => void;
  viewingProfileUser: User | null;
  setViewingProfileUser: React.Dispatch<React.SetStateAction<User | null>>;
  spots: Spot[];
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
  selectedSpot: Spot | null;
  setSelectedSpot: React.Dispatch<React.SetStateAction<Spot | null>>;
  spotDetailTab: 'info' | 'runs';
  setSpotDetailTab: React.Dispatch<React.SetStateAction<'info' | 'runs'>>;
  flyToTarget: Coordinate | null;
  setFlyToTarget: React.Dispatch<React.SetStateAction<Coordinate | null>>;
  dangerZones: DangerZone[];
  setDangerZones: React.Dispatch<React.SetStateAction<DangerZone[]>>;
  selectedDangerZone: DangerZone | null;
  setSelectedDangerZone: React.Dispatch<React.SetStateAction<DangerZone | null>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  unreadCount: number;
  markAllAsRead: () => void;
  toast: AppNotification | null;
  setToast: React.Dispatch<React.SetStateAction<AppNotification | null>>;
  messages: Record<string, Message[]>;
  activeChatUser: User | null;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  showShareModal: boolean;
  setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
  isCreating: boolean;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
  newSpotName: string;
  setNewSpotName: React.Dispatch<React.SetStateAction<string>>;
  creationWaypoints: Coordinate[];
  newSpotPoints: Coordinate[];
  isProcessingRoute: boolean;
  addingDanger: DangerType | null;
  setAddingDanger: React.Dispatch<React.SetStateAction<DangerType | null>>;
  isEditingSpot: boolean;
  setIsEditingSpot: React.Dispatch<React.SetStateAction<boolean>>;
  editSpotName: string;
  setEditSpotName: React.Dispatch<React.SetStateAction<string>>;
  commentText: string;
  setCommentText: React.Dispatch<React.SetStateAction<string>>;
  dangerCommentText: string;
  setDangerCommentText: React.Dispatch<React.SetStateAction<string>>;
  editProfileData: Partial<User>;
  setEditProfileData: React.Dispatch<React.SetStateAction<Partial<User>>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showChallenge: boolean;
  setShowChallenge: React.Dispatch<React.SetStateAction<boolean>>;
  isRecording: boolean;
  analysisResult: DriftAnalysisResult | null;
  isAnalyzing: boolean;
  activeVideo: string | null;
  setActiveVideo: React.Dispatch<React.SetStateAction<string | null>>;
  userLocation: Coordinate | null;
  locationError: string | null;
  mockOtherUsers: User[];
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  videoUploadInputRef: React.RefObject<HTMLInputElement | null>;
  creationWaypointsRef: React.MutableRefObject<Coordinate[]>;

  // Functions
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  handleMapClick: (e: any) => void;
  startCreating: () => void;
  finishCreating: () => void;
  handleSpotClick: (spot: Spot, e?: any) => void;
  handleDangerClick: (zone: DangerZone) => void;
  handleDeleteSpot: () => void;
  handleSaveSpotEdit: () => void;
  handleCopyLink: () => void;
  handleLikeSpot: () => void;
  handlePostComment: () => void;
  triggerRunUpload: () => void;
  handleRunFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteRun: (runId: string) => void;
  handleDeleteDanger: () => void;
  handleCommentDanger: () => void;
  handleSendFriendRequest: (targetUserId: string) => void;
  handleUnfriend: (targetUserId: string) => void;
  handleAcceptFriendRequest: (requestingUserId: string) => void;
  handleDeclineFriendRequest: (requestingUserId: string) => void;
  openProfile: (user: User) => void;
  openChat: (friendId: string) => void;
  handleSendMessage: () => void;
  handleSendSpotToFriend: (friendId: string) => void;
  handleAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveProfile: () => void;
  startChallenge: () => void;
  handleRecordToggle: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateUserRating: (userId: string, spots: Spot[]) => number;
  requestLocation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', carModel: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  
  const [lang, setLang] = useState<'en' | 'ru'>('ru');
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [view, setView] = useState<AppView>('map');
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [spotDetailTab, setSpotDetailTab] = useState<'info' | 'runs'>('info');
  const [flyToTarget, setFlyToTarget] = useState<Coordinate | null>(null);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [selectedDangerZone, setSelectedDangerZone] = useState<DangerZone | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', type: NotificationType.FRIEND_REQUEST, title: 'Friend Request', message: 'T_Master wants to connect.', timestamp: Date.now() - 3600000, isRead: false, relatedId: 'u3' }
  ]);
  const [alertsTriggered, setAlertsTriggered] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
     'u2': [
      { id: 'm0', senderId: 'u2', text: 'Yo! Check out the new spot downtown.', timestamp: Date.now() - 86400000, isRead: true },
      { id: 'm1', senderId: 'me', text: 'Will do tonight.', timestamp: Date.now() - 86000000, isRead: true }
    ]
  });
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [creationWaypoints, setCreationWaypoints] = useState<Coordinate[]>([]);
  const [newSpotPoints, setNewSpotPoints] = useState<Coordinate[]>([]);
  const [isProcessingRoute, setIsProcessingRoute] = useState(false);
  const [addingDanger, setAddingDanger] = useState<DangerType | null>(null);
  const [isEditingSpot, setIsEditingSpot] = useState(false);
  const [editSpotName, setEditSpotName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [dangerCommentText, setDangerCommentText] = useState('');
  const [editProfileData, setEditProfileData] = useState<Partial<User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DriftAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [mockOtherUsers, setMockOtherUsers] = useState<User[]>([]);

  // Refs
  const creationWaypointsRef = useRef<Coordinate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);

  const { location: userLocation, error: locationError } = useGeolocation(isLoggedIn);
  const t = (key: string) => (TRANSLATIONS[lang] as any)[key] || key;
  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'ru' : 'en');
  
  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Computed
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- VIEWPORT FIX ---
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${vh}px`);
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- GEO NOTIFICATIONS ---
  useEffect(() => {
    if (!userLocation) return;
    
    // Check Spots
    spots.forEach(spot => {
      const alertKey = `spot-${spot.id}`;
      if (alertsTriggered.has(alertKey)) return;

      const dist = getDistanceKm(userLocation.lat, userLocation.lng, spot.points[0].lat, spot.points[0].lng);
      if (dist < 2.0) { 
        setAlertsTriggered(prev => new Set(prev).add(alertKey));
        addNotification({
          id: `alert-${Date.now()}`,
          type: NotificationType.SPOT_NEARBY,
          title: 'Spot Nearby!',
          message: `You are near "${spot.name}". Ready to drift?`,
          timestamp: Date.now(),
          isRead: false,
          relatedId: spot.id,
          data: spot
        }, true);
      }
    });

    // Check Dangers
    dangerZones.forEach(danger => {
      const alertKey = `danger-${danger.id}`;
      if (alertsTriggered.has(alertKey)) return;

      const dist = getDistanceKm(userLocation.lat, userLocation.lng, danger.location.lat, danger.location.lng);
      if (dist < 2.0) { 
        setAlertsTriggered(prev => new Set(prev).add(alertKey));
        const typeName = danger.type === DangerType.POLICE ? t('police') : danger.type === DangerType.CAMERA ? t('camera') : t('pothole');
        addNotification({
          id: `alert-danger-${Date.now()}`,
          type: NotificationType.DANGER_NEARBY,
          title: 'WARNING',
          message: `${typeName} reported ahead!`,
          timestamp: Date.now(),
          isRead: false,
          relatedId: danger.id,
          data: danger
        }, true, 'danger');
      }
    });
  }, [userLocation, spots, dangerZones, alertsTriggered]);

  // --- DATA LOADING ---
  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        const [fetchedSpots, fetchedDangers] = await Promise.all([
          db.fetchSpots(),
          db.fetchDangerZones()
        ]);
        setSpots(fetchedSpots);
        setDangerZones(fetchedDangers);
        
        setMockOtherUsers([
          { id: 'u2', username: 'Driver_77', carModel: 'Mazda RX-7', carColor: '#FFFF00', totalDriftPoints: 120, rank: 2, avatarUrl: 'https://picsum.photos/200/200?random=2', friends: ['u1'], incomingFriendRequests: [], outgoingFriendRequests: [] },
          { id: 'u3', username: 'T_Master', carModel: 'Toyota AE86', carColor: '#FFFFFF', totalDriftPoints: 95, rank: 3, avatarUrl: 'https://picsum.photos/200/200?random=3', friends: [], incomingFriendRequests: [], outgoingFriendRequests: ['u1'] },
        ]);
      };
      loadData();
    }
  }, [isLoggedIn]);

  // --- HANDLERS ---
  const handleAuth = async () => {
    setAuthError(null);
    setUsernameSuggestions([]);

    const username = sanitize(authForm.username.trim());
    const password = authForm.password;

    const userVal = validateUsername(username);
    if (!userVal.valid) {
      setAuthError(`${t('usernameError')} ${userVal.error}`);
      return;
    }

    if (authMode === 'register') {
      try {
        const isUnique = await db.checkUsernameUnique(username);
        if (!isUnique) {
          setAuthError(t('usernameTaken'));
          setUsernameSuggestions(generateUsernameSuggestions(username));
          return;
        }

        if (isSupabaseConfigured()) {
            const { error } = await supabase!.auth.signUp({
                email: `${username}@driftspots.app`,
                password: password
            });
            if (error) throw error;
        }

        const newUser: User = {
          ...INITIAL_USER,
          id: `user-${Date.now()}`,
          username: username,
          carModel: sanitize(authForm.carModel) || 'Street Car',
          totalDriftPoints: 0,
          rank: 999
        };
        
        await db.createUserProfile(newUser);
        setCurrentUser(newUser);
        setIsLoggedIn(true);
        setView('map');

      } catch (err: any) {
        setAuthError(err.message || "Registration failed");
      }
    } else {
       if (isSupabaseConfigured()) {
           const { error } = await supabase!.auth.signInWithPassword({
               email: `${username}@driftspots.app`,
               password: password
           });
           if (error) {
               setAuthError("Login failed. Check credentials.");
               return;
           }
       }
       const existing = await db.getUserProfile('u1');
       if (existing) setCurrentUser(existing);
       else {
           setCurrentUser({ ...INITIAL_USER, id: 'u1', username: username });
       }
       setIsLoggedIn(true);
       setView('map');
    }
  };

  const finishCreating = async () => {
    if (newSpotPoints.length < 2) return;
    let name = sanitize(newSpotName.trim());
    const nameVal = validateSpotName(name);
    
    if (!nameVal.valid) {
      alert(nameVal.error);
      return;
    }

    const isUnique = await db.checkSpotNameUnique(name);
    if (!isUnique) {
        if (window.confirm(`Name "${name}" is taken. Use "${name} ${Math.floor(Math.random()*100)}"?`)) {
            name = `${name} ${Math.floor(Math.random()*100)}`;
        } else {
            return;
        }
    }

    // Auto Difficulty
    const calcDifficulty = calculateAutoDifficulty(newSpotPoints);

    const newSpot: Spot = {
      id: `s${Date.now()}`,
      name: name,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      points: newSpotPoints, 
      waypoints: creationWaypoints,
      difficulty: calcDifficulty,
      driftScore: 0,
      likes: 0,
      likedBy: [],
      comments: 0,
      commentsList: [],
      runs: []
    };
    
    await db.createSpot(newSpot);
    setSpots(prev => [...prev, newSpot]); 
    
    setIsCreating(false);
    setCreationWaypoints([]);
    creationWaypointsRef.current = [];
    setNewSpotPoints([]);
    setNewSpotName('');
    setView('map');
    setSelectedSpot(newSpot); 
    setSpotDetailTab('info');
    
    setToast({
        id: `sys-${Date.now()}`,
        type: NotificationType.SYSTEM,
        title: "Spot Created",
        message: `Spot "${name}" created with ${calcDifficulty} difficulty!`,
        timestamp: Date.now(),
        isRead: true
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    if (isSupabaseConfigured()) supabase!.auth.signOut();
    setIsLoggedIn(false);
    setAuthForm({ username: '', password: '', carModel: '' });
    setAuthMode('login');
    setView('map');
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('deleteAccountConfirm'))) {
        handleLogout();
        setNotifications([]);
    }
  };

  const handleMapClick = async (e: any) => {
    if (isCreating) {
      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
      const updatedWaypoints = [...creationWaypointsRef.current, newPoint];
      setCreationWaypoints(updatedWaypoints); 

      if (updatedWaypoints.length > 1) {
        const prevPoint = updatedWaypoints[updatedWaypoints.length - 2];
        setIsProcessingRoute(true);
        try {
          const segment = await getRoadPath([prevPoint, newPoint]);
          setNewSpotPoints(prev => [...prev, ...segment]);
        } catch (err) {
          setNewSpotPoints(prev => [...prev, newPoint]);
        } finally {
          setIsProcessingRoute(false);
        }
      } else {
        setNewSpotPoints([newPoint]);
      }

    } else if (addingDanger) {
      const newZone: DangerZone = {
        id: `d${Date.now()}`,
        type: addingDanger,
        location: { lat: e.latlng.lat, lng: e.latlng.lng },
        timestamp: Date.now(),
        reportedBy: currentUser.id,
        comments: []
      };
      await db.addDangerZone(newZone);
      setDangerZones(prev => [...prev, newZone]);
      setAddingDanger(null);
    } else {
      setSelectedSpot(null);
      setSelectedDangerZone(null);
      setShowShareModal(false);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setCreationWaypoints([]);
    creationWaypointsRef.current = [];
    setNewSpotPoints([]);
    setNewSpotName('');
    setView('create');
    setSelectedSpot(null);
    setSelectedDangerZone(null);
  };

  const handleSpotClick = (spot: Spot, e?: any) => {
    if (e && e.originalEvent) e.originalEvent.stopPropagation();
    if (!isCreating && !addingDanger) {
      setSelectedSpot(spot);
      setEditSpotName(spot.name);
      setIsEditingSpot(false);
      setSpotDetailTab('info');
      setSelectedDangerZone(null);
    }
  };

  const handleDangerClick = (zone: DangerZone) => {
     if(!isCreating && !addingDanger) {
        setSelectedDangerZone(zone);
        setSelectedSpot(null);
        setDangerCommentText('');
     }
  };

  const handleDeleteSpot = () => {
    if (!selectedSpot) return;
    setSpots(prev => prev.filter(s => s.id !== selectedSpot.id));
    setSelectedSpot(null);
  };

  const handleSaveSpotEdit = () => {
    if (!selectedSpot) return;
    const cleanName = sanitize(editSpotName);
    setSpots(prev => prev.map(s => s.id === selectedSpot.id ? { ...s, name: cleanName } : s));
    setSelectedSpot(prev => prev ? { ...prev, name: cleanName } : null);
    setIsEditingSpot(false);
  };

  const handleCopyLink = () => {
    if (!selectedSpot) return;
    const shareUrl = `https://driftspots.app/spot/${selectedSpot.id}`;
    navigator.clipboard.writeText(`Check out ${selectedSpot.name}: ${shareUrl}`);
    setToast({
      id: 'share', type: NotificationType.SYSTEM, title: t('shareSuccess'), message: 'Copied to clipboard', timestamp: Date.now(), isRead: true
    });
    setTimeout(() => setToast(null), 2000);
  };

  const handleLikeSpot = () => {
    if (!selectedSpot) return;
    const hasLiked = selectedSpot.likedBy.includes(currentUser.id);
    let updatedLikes = selectedSpot.likes;
    let updatedLikedBy = [...selectedSpot.likedBy];
    if (hasLiked) {
      updatedLikes = Math.max(0, updatedLikes - 1);
      updatedLikedBy = updatedLikedBy.filter(id => id !== currentUser.id);
    } else {
      updatedLikes += 1;
      updatedLikedBy.push(currentUser.id);
    }
    const updatedSpot = { ...selectedSpot, likes: updatedLikes, likedBy: updatedLikedBy };
    setSpots(prev => prev.map(s => s.id === selectedSpot.id ? updatedSpot : s));
    setSelectedSpot(updatedSpot);
  };

  const handlePostComment = () => {
    if (!selectedSpot || !commentText.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      text: sanitize(commentText),
      timestamp: Date.now()
    };
    const updatedSpot = { 
      ...selectedSpot, 
      comments: selectedSpot.comments + 1,
      commentsList: [...(selectedSpot.commentsList || []), newComment]
    };
    setSpots(prev => prev.map(s => s.id === selectedSpot.id ? updatedSpot : s));
    setSelectedSpot(updatedSpot);
    setCommentText('');
  };

  const triggerRunUpload = () => {
    videoUploadInputRef.current?.click();
  };

  const handleRunFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!selectedSpot || !file) return;
    const videoUrl = URL.createObjectURL(file);
    const newRun: DriftRun = {
      id: `r${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatarUrl: currentUser.avatarUrl,
      carModel: currentUser.carModel,
      score: Math.floor(Math.random() * 500) + 500,
      likes: 0,
      timestamp: Date.now(),
      videoUrl: videoUrl 
    };
    const updatedSpot = {
      ...selectedSpot,
      runs: [newRun, ...selectedSpot.runs]
    };
    setSpots(prev => prev.map(s => s.id === selectedSpot.id ? updatedSpot : s));
    setSelectedSpot(updatedSpot);
    if (videoUploadInputRef.current) videoUploadInputRef.current.value = '';
  };

  const handleDeleteRun = (runId: string) => {
    if (!selectedSpot) return;
    const updatedRuns = selectedSpot.runs.filter(r => r.id !== runId);
    const updatedSpot = { ...selectedSpot, runs: updatedRuns };
    setSpots(prev => prev.map(s => s.id === selectedSpot.id ? updatedSpot : s));
    setSelectedSpot(updatedSpot);
  };

  const handleDeleteDanger = () => {
    if (!selectedDangerZone) return;
    setDangerZones(prev => prev.filter(d => d.id !== selectedDangerZone.id));
    setNotifications(prev => prev.filter(n => n.relatedId !== selectedDangerZone.id));
    setSelectedDangerZone(null);
  };

  const handleCommentDanger = () => {
     if (!selectedDangerZone || !dangerCommentText.trim()) return;
     const newComment: Comment = {
       id: `dc${Date.now()}`,
       userId: currentUser.id,
       username: currentUser.username,
       text: sanitize(dangerCommentText),
       timestamp: Date.now()
     };
     const updatedDanger = {
       ...selectedDangerZone,
       comments: [...(selectedDangerZone.comments || []), newComment]
     };
     setDangerZones(prev => prev.map(d => d.id === selectedDangerZone.id ? updatedDanger : d));
     setSelectedDangerZone(updatedDanger);
     setDangerCommentText('');
  };

  const handleSendFriendRequest = (targetUserId: string) => {
    setCurrentUser(prev => ({
        ...prev,
        outgoingFriendRequests: [...prev.outgoingFriendRequests, targetUserId]
    }));
    alert("Request Sent!");
  };

  const handleUnfriend = (targetUserId: string) => {
      setCurrentUser(prev => ({
          ...prev,
          friends: prev.friends.filter(id => id !== targetUserId)
      }));
  };

  const handleAcceptFriendRequest = (requestingUserId: string) => {
    setCurrentUser(prev => ({
        ...prev,
        friends: [...prev.friends, requestingUserId],
        incomingFriendRequests: prev.incomingFriendRequests.filter(id => id !== requestingUserId)
    }));
    setNotifications(prev => prev.filter(n => n.relatedId !== requestingUserId));
    addNotification({
        id: `sys-${Date.now()}`,
        type: NotificationType.FRIEND_ACCEPTED,
        title: 'Friend Added',
        message: 'You are now connected.',
        timestamp: Date.now(),
        isRead: false
    });
  };

  const handleDeclineFriendRequest = (requestingUserId: string) => {
      setCurrentUser(prev => ({
          ...prev,
          incomingFriendRequests: prev.incomingFriendRequests.filter(id => id !== requestingUserId)
      }));
      setNotifications(prev => prev.filter(n => n.relatedId !== requestingUserId));
  };

  const openProfile = (user: User) => {
    if (user.id === currentUser.id) {
      setViewingProfileUser(null);
    } else {
      setViewingProfileUser(user);
    }
    setView('profile');
  };

  const openChat = (friendId: string) => {
     const friend = mockOtherUsers.find(u => u.id === friendId);
     if (friend) {
        setActiveChatUser(friend);
        setView('chat');
     }
  };

  const handleSendMessage = () => {
     if (!activeChatUser || !chatInput.trim()) return;
     const msg: Message = {
        id: `m${Date.now()}`,
        senderId: 'me',
        text: sanitize(chatInput),
        timestamp: Date.now(),
        isRead: false
     };
     setMessages(prev => ({
        ...prev,
        [activeChatUser.id]: [...(prev[activeChatUser.id] || []), msg]
     }));
     setChatInput('');
  };

  const handleSendSpotToFriend = (friendId: string) => {
     if (!selectedSpot) return;
     const msg: Message = {
        id: `m${Date.now()}`,
        senderId: 'me',
        text: `Check out this spot: ${selectedSpot.name}`,
        spotId: selectedSpot.id,
        timestamp: Date.now(),
        isRead: false
     };
     setMessages(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), msg]
     }));
     setShowShareModal(false);
     setToast({
        id: 'sent', type: NotificationType.SYSTEM, title: t('sent'), message: 'Spot shared with friend.', timestamp: Date.now(), isRead: true
     });
     setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setCurrentUser(prev => ({ ...prev, ...editProfileData }));
    setView('profile');
  };

  const startChallenge = () => {
    setShowChallenge(true);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsAnalyzing(true);
      const mockDescription = "High speed entry, wide angle drift through the hairpin, slight correction at exit.";
      analyzeDriftRun(mockDescription, 12, undefined)
        .then(result => {
          setAnalysisResult(result);
          setIsAnalyzing(false);
        });
    } else {
      setIsRecording(true);
      setAnalysisResult(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeDriftRun("Video upload analysis", 10, base64);
        setAnalysisResult(result);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNotification = (notif: AppNotification, withSound = false, soundType: 'danger'|'info' = 'info') => {
    setNotifications(prev => [notif, ...prev]);
    setToast(notif);
    
    if (withSound) {
      playAlertSound(soundType);
      triggerHaptic(soundType);
    }
    
    setTimeout(() => setToast(null), 5000);
  };

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
        if (prev.every(n => n.isRead)) return prev; 
        return prev.map(n => ({...n, isRead: true, readAt: Date.now()}));
    });
  }, []);

  const requestLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (pos) => {}, 
              (err) => alert("Please enable location permissions in settings.")
          );
      }
  };

  const value = {
    isLoggedIn, setIsLoggedIn, authMode, setAuthMode, authForm, setAuthForm, authError, usernameSuggestions, handleAuth,
    lang, t, toggleLanguage, theme, toggleTheme, showDisclaimer, setShowDisclaimer, currentUser, setCurrentUser,
    view, setView, viewingProfileUser, setViewingProfileUser, spots, setSpots, selectedSpot, setSelectedSpot,
    spotDetailTab, setSpotDetailTab, flyToTarget, setFlyToTarget, dangerZones, setDangerZones,
    selectedDangerZone, setSelectedDangerZone, notifications, setNotifications, toast, setToast,
    unreadCount, markAllAsRead,
    messages, activeChatUser, chatInput, setChatInput, showShareModal, setShowShareModal,
    isCreating, setIsCreating, newSpotName, setNewSpotName, creationWaypoints, newSpotPoints,
    isProcessingRoute, addingDanger, setAddingDanger, isEditingSpot, setIsEditingSpot, editSpotName, setEditSpotName,
    commentText, setCommentText, dangerCommentText, setDangerCommentText, editProfileData, setEditProfileData,
    searchQuery, setSearchQuery, showChallenge, setShowChallenge, isRecording, analysisResult,
    isAnalyzing, activeVideo, setActiveVideo, userLocation, locationError, mockOtherUsers,
    fileInputRef, videoUploadInputRef, creationWaypointsRef,
    handleLogout, handleDeleteAccount, handleMapClick, startCreating, finishCreating, handleSpotClick,
    handleDangerClick, handleDeleteSpot, handleSaveSpotEdit, handleCopyLink, handleLikeSpot, handlePostComment,
    triggerRunUpload, handleRunFileChange, handleDeleteRun, handleDeleteDanger, handleCommentDanger,
    handleSendFriendRequest, handleUnfriend, handleAcceptFriendRequest, handleDeclineFriendRequest,
    openProfile, openChat, handleSendMessage, handleSendSpotToFriend, handleAvatarFileChange, saveProfile,
    startChallenge, handleRecordToggle, handleFileUpload, calculateUserRating, requestLocation
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
