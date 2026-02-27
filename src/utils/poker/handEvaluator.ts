import type { Card, HandEvaluation, HandRank } from '@/types/poker/game';
import { getCardValue } from './deck';

export const evaluateHand = (holeCards: Card[], communityCards: Card[]): HandEvaluation => {
  const allCards = [...holeCards, ...communityCards];
  const cardsByRank = groupByRank(allCards);
  const cardsBySuit = groupBySuit(allCards);
  
  // Check for straight flush (including royal flush)
  const straightFlush = checkStraightFlush(cardsBySuit);
  if (straightFlush) {
    const isRoyal = straightFlush.kickers[0] === 14;
    return {
      rank: isRoyal ? 'royal_flush' : 'straight_flush',
      value: isRoyal ? 10 : 9,
      kickers: straightFlush.kickers,
      description: isRoyal ? 'Royal Flush' : `Straight Flush, ${formatRank(straightFlush.kickers[0])} high`,
    };
  }
  
  // Check for four of a kind
  const fourOfAKind = checkFourOfAKind(cardsByRank);
  if (fourOfAKind) {
    return {
      rank: 'four_of_a_kind',
      value: 8,
      kickers: fourOfAKind.kickers,
      description: `Four of a Kind, ${formatRank(fourOfAKind.kickers[0])}s`,
    };
  }
  
  // Check for full house
  const fullHouse = checkFullHouse(cardsByRank);
  if (fullHouse) {
    return {
      rank: 'full_house',
      value: 7,
      kickers: fullHouse.kickers,
      description: `Full House, ${formatRank(fullHouse.kickers[0])}s full of ${formatRank(fullHouse.kickers[1])}s`,
    };
  }
  
  // Check for flush
  const flush = checkFlush(cardsBySuit);
  if (flush) {
    return {
      rank: 'flush',
      value: 6,
      kickers: flush.kickers,
      description: `Flush, ${formatRank(flush.kickers[0])} high`,
    };
  }
  
  // Check for straight
  const straight = checkStraight(cardsByRank);
  if (straight) {
    return {
      rank: 'straight',
      value: 5,
      kickers: straight.kickers,
      description: `Straight, ${formatRank(straight.kickers[0])} high`,
    };
  }
  
  // Check for three of a kind
  const threeOfAKind = checkThreeOfAKind(cardsByRank);
  if (threeOfAKind) {
    return {
      rank: 'three_of_a_kind',
      value: 4,
      kickers: threeOfAKind.kickers,
      description: `Three of a Kind, ${formatRank(threeOfAKind.kickers[0])}s`,
    };
  }
  
  // Check for two pair
  const twoPair = checkTwoPair(cardsByRank);
  if (twoPair) {
    return {
      rank: 'two_pair',
      value: 3,
      kickers: twoPair.kickers,
      description: `Two Pair, ${formatRank(twoPair.kickers[0])}s and ${formatRank(twoPair.kickers[1])}s`,
    };
  }
  
  // Check for pair
  const pair = checkPair(cardsByRank);
  if (pair) {
    return {
      rank: 'pair',
      value: 2,
      kickers: pair.kickers,
      description: `Pair of ${formatRank(pair.kickers[0])}s`,
    };
  }
  
  // High card
  const highCard = getHighCard(cardsByRank);
  return {
    rank: 'high_card',
    value: 1,
    kickers: highCard.kickers,
    description: `High Card, ${formatRank(highCard.kickers[0])}`,
  };
};

export const compareHands = (a: HandEvaluation, b: HandEvaluation): number => {
  if (a.value !== b.value) {
    return a.value - b.value;
  }
  
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) {
      return a.kickers[i] - b.kickers[i];
    }
  }
  
  return 0;
};

const groupByRank = (cards: Card[]): Map<number, number> => {
  const map = new Map<number, number>();
  for (const card of cards) {
    const value = getCardValue(card.rank);
    map.set(value, (map.get(value) || 0) + 1);
  }
  return map;
};

const groupBySuit = (cards: Card[]): Map<string, Card[]> => {
  const map = new Map<string, Card[]>();
  for (const card of cards) {
    const existing = map.get(card.suit) || [];
    existing.push(card);
    map.set(card.suit, existing);
  }
  return map;
};

const checkStraightFlush = (cardsBySuit: Map<string, Card[]>): { kickers: number[] } | null => {
  for (const [, cards] of cardsBySuit) {
    if (cards.length >= 5) {
      const values = cards.map(c => getCardValue(c.rank)).sort((a, b) => b - a);
      
      // Check for A-5 straight flush (wheel)
      if (values.includes(14) && values.includes(5) && values.includes(4) && 
          values.includes(3) && values.includes(2)) {
        return { kickers: [5] };
      }
      
      // Check for normal straight flush
      for (let i = 0; i <= values.length - 5; i++) {
        if (values[i] - values[i + 4] === 4) {
          return { kickers: [values[i]] };
        }
      }
    }
  }
  return null;
};

const checkFourOfAKind = (cardsByRank: Map<number, number>): { kickers: number[] } | null => {
  let fourRank: number | null = null;
  let kicker: number | null = null;
  
  for (const [rank, count] of cardsByRank) {
    if (count === 4) {
      fourRank = rank;
    } else if (kicker === null || rank > kicker) {
      kicker = rank;
    }
  }
  
  if (fourRank !== null && kicker !== null) {
    return { kickers: [fourRank, kicker] };
  }
  return null;
};

const checkFullHouse = (cardsByRank: Map<number, number>): { kickers: number[] } | null => {
  let threeRank: number | null = null;
  let pairRank: number | null = null;
  
  for (const [rank, count] of cardsByRank) {
    if (count >= 3) {
      if (threeRank === null || rank > threeRank) {
        if (threeRank !== null) {
          pairRank = threeRank;
        }
        threeRank = rank;
      } else if (pairRank === null || rank > pairRank) {
        pairRank = rank;
      }
    } else if (count >= 2) {
      if (pairRank === null || rank > pairRank) {
        pairRank = rank;
      }
    }
  }
  
  if (threeRank !== null && pairRank !== null) {
    return { kickers: [threeRank, pairRank] };
  }
  return null;
};

const checkFlush = (cardsBySuit: Map<string, Card[]>): { kickers: number[] } | null => {
  for (const [, cards] of cardsBySuit) {
    if (cards.length >= 5) {
      const values = cards.map(c => getCardValue(c.rank)).sort((a, b) => b - a);
      return { kickers: values.slice(0, 5) };
    }
  }
  return null;
};

const checkStraight = (cardsByRank: Map<number, number>): { kickers: number[] } | null => {
  const uniqueValues = Array.from(cardsByRank.keys()).sort((a, b) => b - a);
  
  // Check for A-5 straight (wheel)
  if (uniqueValues.includes(14) && uniqueValues.includes(5) && 
      uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
    return { kickers: [5] };
  }
  
  // Check for normal straight
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      return { kickers: [uniqueValues[i]] };
    }
  }
  
  return null;
};

const checkThreeOfAKind = (cardsByRank: Map<number, number>): { kickers: number[] } | null => {
  let threeRank: number | null = null;
  const kickers: number[] = [];
  
  for (const [rank, count] of cardsByRank) {
    if (count === 3) {
      threeRank = rank;
    } else {
      kickers.push(rank);
    }
  }
  
  if (threeRank !== null && kickers.length >= 2) {
    kickers.sort((a, b) => b - a);
    return { kickers: [threeRank, kickers[0], kickers[1]] };
  }
  return null;
};

const checkTwoPair = (cardsByRank: Map<number, number>): { kickers: number[] } | null => {
  const pairs: number[] = [];
  let kicker: number | null = null;
  
  for (const [rank, count] of cardsByRank) {
    if (count >= 2) {
      pairs.push(rank);
    } else if (kicker === null || rank > kicker) {
      kicker = rank;
    }
  }
  
  if (pairs.length >= 2 && kicker !== null) {
    pairs.sort((a, b) => b - a);
    return { kickers: [pairs[0], pairs[1], kicker] };
  }
  return null;
};

const checkPair = (cardsByRank: Map<number, number>): { kickers: number[] } | null => {
  let pairRank: number | null = null;
  const kickers: number[] = [];
  
  for (const [rank, count] of cardsByRank) {
    if (count === 2) {
      pairRank = rank;
    } else {
      kickers.push(rank);
    }
  }
  
  if (pairRank !== null && kickers.length >= 3) {
    kickers.sort((a, b) => b - a);
    return { kickers: [pairRank, kickers[0], kickers[1], kickers[2]] };
  }
  return null;
};

const getHighCard = (cardsByRank: Map<number, number>): { kickers: number[] } => {
  const values = Array.from(cardsByRank.keys()).sort((a, b) => b - a);
  return { kickers: values.slice(0, 5) };
};

const formatRank = (value: number): string => {
  const ranks: Record<number, string> = {
    2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace',
  };
  return ranks[value] || String(value);
};

export const getHandRankName = (rank: HandRank): string => {
  const names: Record<HandRank, string> = {
    high_card: 'High Card',
    pair: 'Pair',
    two_pair: 'Two Pair',
    three_of_a_kind: 'Three of a Kind',
    straight: 'Straight',
    flush: 'Flush',
    full_house: 'Full House',
    four_of_a_kind: 'Four of a Kind',
    straight_flush: 'Straight Flush',
    royal_flush: 'Royal Flush',
  };
  return names[rank];
};
