import type { Card, Suit, Rank } from '@/types/poker/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${rank}-${suit}`,
      });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck: Card[], count: number): { cards: Card[]; remainingDeck: Card[] } => {
  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { cards, remainingDeck };
};

export const getCardValue = (rank: Rank): number => {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
};

export const getSuitSymbol = (suit: Suit): string => {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit];
};

export const getSuitColor = (suit: Suit): string => {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
};

export const getFourColorSuit = (suit: Suit): string => {
  const colors: Record<Suit, string> = {
    hearts: '#ef4444',    // Red
    diamonds: '#3b82f6',  // Blue
    clubs: '#22c55e',     // Green
    spades: '#1f2937',    // Black
  };
  return colors[suit];
};

export const formatCard = (card: Card): string => {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
};

export const compareCards = (a: Card, b: Card): number => {
  return getCardValue(b.rank) - getCardValue(a.rank);
};
