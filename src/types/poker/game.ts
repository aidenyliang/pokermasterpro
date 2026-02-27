// Poker Game Types

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export type HandRank = 
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush';

export interface HandEvaluation {
  rank: HandRank;
  value: number;
  kickers: number[];
  description: string;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  chips: number;
  position: number;
  cards: Card[];
  isActive: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  hasFolded: boolean;
  hasActed: boolean;
  currentBet: number;
  totalBetThisRound: number;
  isAllIn: boolean;
  isSittingOut: boolean;
  lastAction?: PlayerAction;
  showCards: boolean;
}

export type PlayerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in' | 'sit_out' | 'sit_in';

export interface GameAction {
  id: string;
  playerId: string;
  action: PlayerAction;
  amount?: number;
  timestamp: number;
  round: BettingRound;
}

export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type GamePhase = 'waiting' | 'dealing' | 'betting' | 'dealing_community' | 'showdown' | 'finished';

export interface Pot {
  id: string;
  amount: number;
  eligiblePlayers: string[];
  winner?: string;
}

export interface GameState {
  id: string;
  roomId: string;
  players: Player[];
  communityCards: Card[];
  deck: Card[];
  pots: Pot[];
  currentRound: BettingRound;
  currentPosition: number;
  dealerPosition: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  minBet: number;
  maxBet: number;
  gamePhase: GamePhase;
  actions: GameAction[];
  lastRaiseAmount: number;
  handNumber: number;
  startedAt: number;
  endedAt?: number;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
}

export interface GameRoom {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  hostName: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  minBuyIn: number;
  maxBuyIn: number;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: 'waiting' | 'playing' | 'paused' | 'closed';
  createdAt: number;
  updatedAt: number;
  gameState?: GameState;
}

export interface PlayerStats {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalHands: number;
  handsWon: number;
  handsFolded: number;
  totalBets: number;
  totalWinnings: number;
  totalLosses: number;
  netProfit: number;
  biggestPotWon: number;
  bestHand: HandEvaluation | null;
  vpip: number; // Voluntarily Put $ In Pot
  pfr: number; // Pre-Flop Raise
  af: number; // Aggression Factor
  bbPer100: number; // Big Blinds per 100 hands
  winRate: number;
  currentStreak: number;
  longestWinStreak: number;
  tournamentWins: number;
  cashGameHours: number;
  lastPlayedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface HandHistory {
  id: string;
  gameId: string;
  roomId: string;
  handNumber: number;
  timestamp: number;
  players: Player[];
  communityCards: Card[];
  actions: GameAction[];
  pots: Pot[];
  winners: { playerId: string; amount: number; hand: HandEvaluation }[];
  smallBlind: number;
  bigBlind: number;
}

export interface UserPreferences {
  userId: string;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  cardDesign: 'classic' | 'modern' | 'minimal' | 'dark' | 'gold';
  tableColor: 'green' | 'blue' | 'red' | 'black' | 'purple';
  autoMuck: boolean;
  showFoldedCards: boolean;
  fourColorDeck: boolean;
  showHandStrength: boolean;
  autoActionDelay: number;
  confirmAllIn: boolean;
  confirmBigBets: boolean;
  bigBetThreshold: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'player' | 'system' | 'dealer';
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  buyIn: number;
  prizePool: number;
  startingChips: number;
  blindLevels: BlindLevel[];
  maxPlayers: number;
  registeredPlayers: string[];
  status: 'registering' | 'starting' | 'running' | 'paused' | 'finished';
  startedAt?: number;
  finishedAt?: number;
  createdAt: number;
}

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // in minutes
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  unlockedAt?: number;
  progress: number;
}
