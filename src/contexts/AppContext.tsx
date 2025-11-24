
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Spot, User, Coordinate, Difficulty, DriftAnalysisResult, DangerZone, DangerType, Comment, DriftRun, AppNotification, NotificationType, Message, AppView } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { analyzeDriftRun } from '../services/geminiService';
import { db, generateUsernameSuggestions } from '../lib/supabase/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { validateUsername, validateSpotName, sanitize } from '../lib/validation';
import { useSimpleSpotCreator } from '../hooks/useSimpleSpotCreator';

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

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  authMode: 'login' | 'register';
  setAuthMode: React.Dispatch<React.SetStateAction<'login' | 'register'>>;
  authForm: any;
  setAuthForm: React.Dispatch<React.SetStateAction<any>>;
  authError: string | null;
  usernameSuggestions: string[];
  handleAuth: (e?: React.FormEvent) => void;
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
  
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  videoUploadInputRef: React.RefObject<HTMLInputElement | null>;

  handleLogout: () => void;
  handleDeleteAccount: () => void;
  handleMapClick: (e: any) => void;
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
  
  // NEW SPOT CREATOR PROPS
  isCreating: boolean;
  newSpotPoints: Coordinate[];
  newSpotName: string;
  setNewSpotName: React.Dispatch<React.SetStateAction<string>>;
  startCreating: () => void;
  cancelCreating: () => void;
  finishCreating: () => void;
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);

  const { location: userLocation, error: locationError } = useGeolocation(isLoggedIn);
  const t = (key: string) => (TRANSLATIONS[lang] as any)[key] || key;
  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'ru' : 'en');
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- THE NEW SIMPLE CREATOR HOOK ---
  const spotCreator = useSimpleSpotCreator(currentUser, setView, setToast, setSelectedSpot);

  // Sync new spots to state when created
  const originalFinish = spotCreator.finishCreating;
  spotCreator.finishCreating = async () => {
     await originalFinish();
     // Re-fetch spots to show the new one immediately
     const newSpots = await db.fetchSpots();
     setSpots(newSpots);
  };

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
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- GEO NOTIFICATIONS ---
  useEffect(() => {
    if (!userLocation) return;
    spots.forEach(spot => {
      const alertKey = `spot-${spot.id}`;
      if (alertsTriggered.has(alertKey)) return;
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, spot.points[0].lat, spot.points[0].lng);
      if (dist < 2.0) { 
        setAlertsTriggered(prev => new Set(prev).add(alertKey));
        setNotifications(prev => [{
          id: `alert-${Date.now()}`,
          type: NotificationType.SPOT_NEARBY,
          title: 'Spot Nearby!',
          message: `You are near "${spot.name}".`,
          timestamp: Date.now(),
          isRead: false,
          relatedId: spot.id,
          data: spot
        }, ...prev]);
        playAlertSound('info');
      }
    });
  }, [userLocation, spots, alertsTriggered]);

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
  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('[AppContext] Attempting auth...');
    setAuthError(null);
    setUsernameSuggestions([]);
    
    const username = sanitize(authForm.username.trim());
    const userVal = validateUsername(username);
    if (!userVal.valid) {
      console.warn('[AppContext] Invalid username');
      setAuthError(userVal.error || "Invalid user");
      return;
    }

    try {
        if (authMode === 'register') {
           const isUnique = await db.checkUsernameUnique(username);
            if (!isUnique) {
                setAuthError("Username taken");
                setUsernameSuggestions(generateUsernameSuggestions(username));
                return;
            }
             if (isSupabaseConfigured()) {
                const { error } = await supabase!.auth.signUp({ email: `${username}@driftspots.app`, password: authForm.password });
                if (error) throw error;
            }
            const newUser: User = { ...INITIAL_USER, id: `user-${Date.now()}`, username, carModel: sanitize(authForm.carModel) };
            await db.createUserProfile(newUser);
            setCurrentUser(newUser);
        } else {
            if (isSupabaseConfigured()) {
                const { error } = await supabase!.auth.signInWithPassword({ email: `${username}@driftspots.app`, password: authForm.password });
                if(error) { 
                    console.error('[AppContext] Login failed', error);
                    setAuthError("Login failed"); 
                    return; 
                }
            }
            const existing = await db.getUserProfile('u1'); // Mock lookup for non-supabase
            setCurrentUser(existing || { ...INITIAL_USER, id: 'u1', username });
        }
        console.log('[AppContext] LOGIN SUCCESS');
        setIsLoggedIn(true);
        setView('map');
        setAuthError(null);
    } catch (err: any) {
        console.error('[AppContext] Auth Error', err);
        setAuthError(err.message || "Auth error");
    }
  };

  const handleLogout = () => {
    if (isSupabaseConfigured()) supabase!.auth.signOut();
    setIsLoggedIn(false);
    spotCreator.cancelCreating(); // Cancel creation on logout
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

  // Clean, simple map click handler
  const handleMapClick = useCallback((e: any) => {
    if (spotCreator.isCreating) {
        spotCreator.handleMapClick(e);
    } else if (addingDanger) {
      const newZone: DangerZone = {
        id: `d${Date.now()}`,
        type: addingDanger,
        location: { lat: e.latlng.lat, lng: e.latlng.lng },
        timestamp: Date.now(),
        reportedBy: currentUser.id,
        comments: []
      };
      // Fire and forget danger creation (can be improved, but out of scope for spot fix)
      db.addDangerZone(newZone).then(() => {
          setDangerZones(prev => [...prev, newZone]);
          setAddingDanger(null);
      });
    } else {
      setSelectedSpot(null);
      setSelectedDangerZone(null);
      setShowShareModal(false);
      setFlyToTarget(null);
    }
  }, [addingDanger, currentUser.id, spotCreator]);

  const handleSpotClick = (spot: Spot, e?: any) => {
    if (e && e.originalEvent) e.originalEvent.stopPropagation();
    if (!spotCreator.isCreating && !addingDanger) {
      setSelectedSpot(spot);
      setEditSpotName(spot.name);
      setIsEditingSpot(false);
      setSpotDetailTab('info');
      setSelectedDangerZone(null);
    }
  };

  const handleDangerClick = (zone: DangerZone) => {
     if(!spotCreator.isCreating && !addingDanger) {
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
     navigator.clipboard.writeText(`https://driftspots.app/spot/${selectedSpot.id}`);
     setToast({ id: 'sh', type: NotificationType.SYSTEM, title: t('shareSuccess'), message: 'Link copied', timestamp: Date.now(), isRead: true });
     setTimeout(() => setToast(null), 2000);
  };

  const handleLikeSpot = () => {
    if (!selectedSpot) return;
    const hasLiked = selectedSpot.likedBy.includes(currentUser.id);
    const updatedSpot = { 
        ...selectedSpot, 
        likes: hasLiked ? selectedSpot.likes - 1 : selectedSpot.likes + 1,
        likedBy: hasLiked ? selectedSpot.likedBy.filter(id => id !== currentUser.id) : [...selectedSpot.likedBy, currentUser.id]
    };
    setSpots(prev => prev.map(s => s.id === selectedSpot.id ? updatedSpot : s));
    setSelectedSpot(updatedSpot);
  };

  const handlePostComment = () => {
     if (!selectedSpot || !commentText.trim()) return;
     const newComment: Comment = { id: `c${Date.now()}`, userId: currentUser.id, username: currentUser.username, text: sanitize(commentText), timestamp: Date.now() };
     const updatedSpot = { ...selectedSpot, comments: selectedSpot.comments + 1, commentsList: [...(selectedSpot.commentsList || []), newComment] };
     setSpots(prev => prev.map(s => s.id === selectedSpot.id ? updatedSpot : s));
     setSelectedSpot(updatedSpot);
     setCommentText('');
  };
  
  const triggerRunUpload = () => videoUploadInputRef.current?.click();
  const handleRunFileChange = (e: any) => {};
  const handleDeleteRun = (id: string) => {};
  const handleDeleteDanger = () => { setDangerZones(prev => prev.filter(d => d.id !== selectedDangerZone?.id)); setSelectedDangerZone(null); };
  const handleCommentDanger = () => {};
  const handleSendFriendRequest = (id: string) => {};
  const handleUnfriend = (id: string) => {};
  const handleAcceptFriendRequest = (id: string) => {};
  const handleDeclineFriendRequest = (id: string) => {};
  const openProfile = (u: User) => { setViewingProfileUser(u); setView('profile'); };
  const openChat = (id: string) => { setView('chat'); };
  const handleSendMessage = () => {};
  const handleSendSpotToFriend = (id: string) => { setShowShareModal(false); };
  const handleAvatarFileChange = (e: any) => {};
  const saveProfile = () => { setView('profile'); };
  const startChallenge = () => setShowChallenge(true);
  const handleRecordToggle = () => setIsRecording(!isRecording);
  const handleFileUpload = (e: any) => {};
  const calculateUserRating = (id: string, s: Spot[]) => 0;
  const requestLocation = () => navigator.geolocation.getCurrentPosition(() => {}, () => {});
  const markAllAsRead = useCallback(() => setNotifications(prev => prev.map(n => ({...n, isRead: true}))), []);

  const value = {
    isLoggedIn, setIsLoggedIn, authMode, setAuthMode, authForm, setAuthForm, authError, usernameSuggestions, handleAuth,
    lang, t, toggleLanguage, theme, toggleTheme, showDisclaimer, setShowDisclaimer, currentUser, setCurrentUser,
    view, setView, viewingProfileUser, setViewingProfileUser, spots, setSpots, selectedSpot, setSelectedSpot,
    spotDetailTab, setSpotDetailTab, flyToTarget, setFlyToTarget, dangerZones, setDangerZones,
    selectedDangerZone, setSelectedDangerZone, notifications, setNotifications, toast, setToast,
    unreadCount, markAllAsRead,
    messages, activeChatUser, chatInput, setChatInput, showShareModal, setShowShareModal,
    addingDanger, setAddingDanger, isEditingSpot, setIsEditingSpot, editSpotName, setEditSpotName,
    commentText, setCommentText, dangerCommentText, setDangerCommentText, editProfileData, setEditProfileData,
    searchQuery, setSearchQuery, showChallenge, setShowChallenge, isRecording, analysisResult,
    isAnalyzing, activeVideo, setActiveVideo, userLocation, locationError, mockOtherUsers,
    fileInputRef, videoUploadInputRef,
    handleLogout, handleDeleteAccount, handleMapClick, handleSpotClick,
    handleDangerClick, handleDeleteSpot, handleSaveSpotEdit, handleCopyLink, handleLikeSpot, handlePostComment,
    triggerRunUpload, handleRunFileChange, handleDeleteRun, handleDeleteDanger, handleCommentDanger,
    handleSendFriendRequest, handleUnfriend, handleAcceptFriendRequest, handleDeclineFriendRequest,
    openProfile, openChat, handleSendMessage, handleSendSpotToFriend, handleAvatarFileChange, saveProfile,
    startChallenge, handleRecordToggle, handleFileUpload, calculateUserRating, requestLocation,
    
    // NEW SPOT CREATOR PROPS
    isCreating: spotCreator.isCreating,
    newSpotPoints: spotCreator.points,
    newSpotName: spotCreator.spotName,
    setNewSpotName: spotCreator.setSpotName,
    startCreating: spotCreator.startCreating,
    cancelCreating: spotCreator.cancelCreating,
    finishCreating: spotCreator.finishCreating
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
