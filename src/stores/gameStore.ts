import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  GameState, 
  GameRoom, 
  PlayerStats, 
  UserPreferences,
  ChatMessage,
  PlayerAction 
} from '@/types/poker/game';

interface GameStore {
  // Auth
  userId: string | null;
  username: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string, username: string, avatarUrl?: string) => void;
  clearAuth: () => void;
  
  // Game State
  currentGame: GameState | null;
  currentRoom: GameRoom | null;
  setCurrentGame: (game: GameState | null) => void;
  setCurrentRoom: (room: GameRoom | null) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  
  // Rooms
  rooms: GameRoom[];
  setRooms: (rooms: GameRoom[]) => void;
  addRoom: (room: GameRoom) => void;
  updateRoom: (roomId: string, updates: Partial<GameRoom>) => void;
  removeRoom: (roomId: string) => void;
  
  // Player Stats
  playerStats: PlayerStats | null;
  setPlayerStats: (stats: PlayerStats) => void;
  updatePlayerStats: (updates: Partial<PlayerStats>) => void;
  
  // Preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Game Actions
  performAction: (action: PlayerAction, amount?: number) => Promise<void>;
  
  // Graphics Settings
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high' | 'ultra') => void;
}

const defaultPreferences: UserPreferences = {
  userId: '',
  graphicsQuality: 'high',
  animationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.7,
  musicEnabled: true,
  musicVolume: 0.5,
  cardDesign: 'modern',
  tableColor: 'green',
  autoMuck: true,
  showFoldedCards: false,
  fourColorDeck: false,
  showHandStrength: true,
  autoActionDelay: 0,
  confirmAllIn: true,
  confirmBigBets: true,
  bigBetThreshold: 100,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Auth
      userId: null,
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
      setAuth: (userId, username, avatarUrl) => 
        set({ userId, username, avatarUrl, isAuthenticated: true }),
      clearAuth: () => 
        set({ userId: null, username: null, avatarUrl: null, isAuthenticated: false }),
      
      // Game State
      currentGame: null,
      currentRoom: null,
      setCurrentGame: (game) => set({ currentGame: game }),
      setCurrentRoom: (room) => set({ currentRoom: room }),
      updateGameState: (updates) => 
        set((state) => ({ 
          currentGame: state.currentGame ? { ...state.currentGame, ...updates } : null 
        })),
      
      // Rooms
      rooms: [],
      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      updateRoom: (roomId, updates) =>
        set((state) => ({
          rooms: state.rooms.map(r => r.id === roomId ? { ...r, ...updates } : r),
        })),
      removeRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter(r => r.id !== roomId),
        })),
      
      // Player Stats
      playerStats: null,
      setPlayerStats: (stats) => set({ playerStats: stats }),
      updatePlayerStats: (updates) =>
        set((state) => ({
          playerStats: state.playerStats ? { ...state.playerStats, ...updates } : null,
        })),
      
      // Preferences
      preferences: defaultPreferences,
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      
      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages.slice(-99), message],
        })),
      clearChat: () => set({ chatMessages: [] }),
      
      // UI State
      isLoading: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Game Actions
      performAction: async (action, amount) => {
        const { currentGame, userId } = get();
        if (!currentGame || !userId) return;
        
        // This will be implemented with Supabase realtime
        console.log('Performing action:', action, amount);
      },
      
      // Graphics Settings
      graphicsQuality: 'high',
      setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
    }),
    {
      name: 'poker-game-store',
      partialize: (state) => ({
        preferences: state.preferences,
        graphicsQuality: state.graphicsQuality,
      }),
    }
  )
);
