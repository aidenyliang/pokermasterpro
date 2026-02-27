import type { 
  GameState, 
  Player, 
  PlayerAction
} from '@/types/poker/game';
import { createDeck, shuffleDeck, dealCards } from './deck';

export const createNewGame = (
  roomId: string,
  players: Player[],
  smallBlind: number,
  bigBlind: number,
  ante: number = 0,
  maxPlayers: number = 9
): GameState => {
  const deck = shuffleDeck(createDeck());
  
  // Deal 2 cards to each player
  let currentDeck = deck;
  const updatedPlayers = players.map(player => {
    const { cards, remainingDeck } = dealCards(currentDeck, 2);
    currentDeck = remainingDeck;
    return {
      ...player,
      cards,
      isActive: true,
      hasFolded: false,
      hasActed: false,
      currentBet: 0,
      totalBetThisRound: 0,
      isAllIn: false,
    };
  });
  
  // Set dealer, small blind, big blind positions
  const dealerPosition = 0;
  const smallBlindPos = getNextActivePosition(updatedPlayers, dealerPosition);
  const bigBlindPos = getNextActivePosition(updatedPlayers, smallBlindPos);
  
  updatedPlayers[smallBlindPos].isSmallBlind = true;
  updatedPlayers[smallBlindPos].currentBet = smallBlind;
  updatedPlayers[smallBlindPos].chips -= smallBlind;
  
  updatedPlayers[bigBlindPos].isBigBlind = true;
  updatedPlayers[bigBlindPos].currentBet = bigBlind;
  updatedPlayers[bigBlindPos].chips -= bigBlind;
  
  // Collect ante if applicable
  if (ante > 0) {
    updatedPlayers.forEach(player => {
      if (player.chips >= ante) {
        player.currentBet += ante;
        player.chips -= ante;
      }
    });
  }
  
  const firstToAct = getNextActivePosition(updatedPlayers, bigBlindPos);
  
  return {
    id: generateId(),
    roomId,
    players: updatedPlayers,
    communityCards: [],
    deck: currentDeck,
    pots: [{
      id: generateId(),
      amount: smallBlind + bigBlind + (ante * players.length),
      eligiblePlayers: players.map(p => p.id),
    }],
    currentRound: 'preflop',
    currentPosition: firstToAct,
    dealerPosition,
    smallBlind,
    bigBlind,
    ante,
    minBet: bigBlind,
    maxBet: Infinity,
    gamePhase: 'betting',
    actions: [],
    lastRaiseAmount: bigBlind,
    handNumber: 1,
    startedAt: Date.now(),
    maxPlayers,
    isPrivate: false,
  };
};

export const processAction = (
  gameState: GameState,
  playerId: string,
  action: PlayerAction,
  amount?: number
): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return gameState;
  
  const player = gameState.players[playerIndex];
  if (player.id !== gameState.players[gameState.currentPosition].id) return gameState;
  if (player.hasFolded || player.isAllIn) return gameState;
  
  const newState = { ...gameState };
  const newPlayer = { ...player };
  
  const currentBetToCall = getCurrentBetToCall(gameState);
  const minRaise = gameState.lastRaiseAmount;
  
  switch (action) {
    case 'fold':
      newPlayer.hasFolded = true;
      newPlayer.lastAction = 'fold';
      break;
      
    case 'check':
      if (newPlayer.currentBet < currentBetToCall) {
        return gameState; // Can't check if there's a bet to call
      }
      newPlayer.hasActed = true;
      newPlayer.lastAction = 'check';
      break;
      
    case 'call':
      const callAmount = currentBetToCall - newPlayer.currentBet;
      if (newPlayer.chips <= callAmount) {
        // All-in call
        newPlayer.currentBet += newPlayer.chips;
        newState.pots[0].amount += newPlayer.chips;
        newPlayer.chips = 0;
        newPlayer.isAllIn = true;
        newPlayer.lastAction = 'all_in';
      } else {
        newPlayer.currentBet += callAmount;
        newState.pots[0].amount += callAmount;
        newPlayer.chips -= callAmount;
        newPlayer.hasActed = true;
        newPlayer.lastAction = 'call';
      }
      break;
      
    case 'bet':
      if (currentBetToCall > 0) return gameState; // Can't bet if there's already a bet
      if (!amount || amount < gameState.bigBlind) return gameState;
      if (amount > newPlayer.chips) return gameState;
      
      if (amount === newPlayer.chips) {
        newPlayer.isAllIn = true;
        newPlayer.lastAction = 'all_in';
      } else {
        newPlayer.hasActed = true;
        newPlayer.lastAction = 'bet';
      }
      
      newPlayer.currentBet += amount;
      newState.pots[0].amount += amount;
      newPlayer.chips -= amount;
      newState.lastRaiseAmount = amount;
      break;
      
    case 'raise':
      if (currentBetToCall === 0) return gameState; // Can't raise if there's no bet
      if (!amount) return gameState;
      
      const totalBet = amount;
      const raiseAmount = totalBet - newPlayer.currentBet;
      const actualRaise = totalBet - currentBetToCall;
      
      if (actualRaise < minRaise && totalBet < newPlayer.chips + newPlayer.currentBet) {
        return gameState; // Raise too small
      }
      if (raiseAmount > newPlayer.chips) return gameState;
      
      if (raiseAmount === newPlayer.chips) {
        newPlayer.isAllIn = true;
        newPlayer.lastAction = 'all_in';
      } else {
        newPlayer.hasActed = true;
        newPlayer.lastAction = 'raise';
      }
      
      newState.pots[0].amount += raiseAmount;
      newPlayer.chips -= raiseAmount;
      newPlayer.currentBet = totalBet;
      newState.lastRaiseAmount = actualRaise;
      break;
      
    case 'all_in':
      const allInAmount = newPlayer.chips;
      newState.pots[0].amount += allInAmount;
      newPlayer.currentBet += allInAmount;
      newPlayer.chips = 0;
      newPlayer.isAllIn = true;
      newPlayer.lastAction = 'all_in';
      
      if (newPlayer.currentBet > currentBetToCall + minRaise) {
        newState.lastRaiseAmount = newPlayer.currentBet - currentBetToCall;
      }
      break;
  }
  
  newState.players[playerIndex] = newPlayer;
  newState.actions.push({
    id: generateId(),
    playerId,
    action,
    amount: newPlayer.currentBet,
    timestamp: Date.now(),
    round: newState.currentRound,
  });
  
  // Move to next position
  newState.currentPosition = getNextActivePosition(newState.players, newState.currentPosition);
  
  // Check if round is complete
  if (isRoundComplete(newState)) {
    return advanceToNextRound(newState);
  }
  
  return newState;
};

const getCurrentBetToCall = (gameState: GameState): number => {
  return Math.max(...gameState.players.map(p => p.currentBet));
};

const getNextActivePosition = (players: Player[], currentPosition: number): number => {
  let nextPos = (currentPosition + 1) % players.length;
  let attempts = 0;
  
  while (attempts < players.length) {
    const player = players[nextPos];
    if (player && !player.hasFolded && !player.isAllIn && player.isActive) {
      return nextPos;
    }
    nextPos = (nextPos + 1) % players.length;
    attempts++;
  }
  
  return currentPosition;
};

const isRoundComplete = (gameState: GameState): boolean => {
  const activePlayers = gameState.players.filter(p => !p.hasFolded && p.isActive);
  const playersToAct = activePlayers.filter(p => !p.isAllIn);
  
  // If only one player left, round is complete
  if (activePlayers.length === 1) return true;
  
  // If all remaining players are all-in, round is complete
  if (playersToAct.length === 0) return true;
  
  // Check if all players have acted and bets are equal
  const currentBet = getCurrentBetToCall(gameState);
  const allActed = playersToAct.every(p => p.hasActed || p.currentBet === currentBet);
  const allBetsEqual = playersToAct.every(p => p.currentBet === currentBet);
  
  return allActed && allBetsEqual;
};

const advanceToNextRound = (gameState: GameState): GameState => {
  const newState = { ...gameState };
  
  // Reset player bets for new round
  newState.players = newState.players.map(p => ({
    ...p,
    currentBet: 0,
    hasActed: false,
  }));
  
  newState.lastRaiseAmount = newState.bigBlind;
  
  switch (newState.currentRound) {
    case 'preflop':
      // Deal flop
      const { cards: flop, remainingDeck: afterFlop } = dealCards(newState.deck, 3);
      newState.communityCards = flop;
      newState.deck = afterFlop;
      newState.currentRound = 'flop';
      break;
      
    case 'flop':
      // Deal turn
      const { cards: turn, remainingDeck: afterTurn } = dealCards(newState.deck, 1);
      newState.communityCards = [...newState.communityCards, ...turn];
      newState.deck = afterTurn;
      newState.currentRound = 'turn';
      break;
      
    case 'turn':
      // Deal river
      const { cards: river, remainingDeck: afterRiver } = dealCards(newState.deck, 1);
      newState.communityCards = [...newState.communityCards, ...river];
      newState.deck = afterRiver;
      newState.currentRound = 'river';
      break;
      
    case 'river':
      newState.currentRound = 'showdown';
      return handleShowdown(newState);
  }
  
  // Set first to act (first active player after dealer)
  newState.currentPosition = getNextActivePosition(newState.players, newState.dealerPosition);
  
  return newState;
};

const handleShowdown = (gameState: GameState): GameState => {
  const newState = { ...gameState };
  newState.gamePhase = 'showdown';
  
  // Show all cards at showdown
  newState.players = newState.players.map(p => ({
    ...p,
    showCards: !p.hasFolded,
  }));
  
  newState.endedAt = Date.now();
  
  return newState;
};

export const canPlayerAct = (gameState: GameState, playerId: string): boolean => {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return false;
  if (player.hasFolded || player.isAllIn) return false;
  
  const currentPlayer = gameState.players[gameState.currentPosition];
  return currentPlayer?.id === playerId;
};

export const getValidActions = (gameState: GameState, playerId: string): PlayerAction[] => {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return [];
  if (!canPlayerAct(gameState, playerId)) return [];
  
  const actions: PlayerAction[] = ['fold'];
  const currentBet = getCurrentBetToCall(gameState);
  const toCall = currentBet - player.currentBet;
  
  if (toCall === 0) {
    actions.push('check');
    if (player.chips >= gameState.bigBlind) {
      actions.push('bet');
    }
  } else {
    if (player.chips >= toCall) {
      actions.push('call');
    }
    if (player.chips > toCall) {
      actions.push('raise');
    }
  }
  
  if (player.chips > 0) {
    actions.push('all_in');
  }
  
  return actions;
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
