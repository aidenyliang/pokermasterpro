import { motion } from 'framer-motion';
import type { GameState } from '@/types/poker/game';
import { useGameStore } from '@/stores/gameStore';
import { PlayerSeat } from './PlayerSeat';
import { PlayingCard } from './PlayingCard';
import { PokerChip } from './PokerChip';
import { cn } from '@/lib/utils';
import { evaluateHand } from '@/utils/poker/handEvaluator';

interface PokerTableProps {
  gameState: GameState;
  currentUserId: string;
  className?: string;
}

export const PokerTable = ({
  gameState,
  currentUserId,
  className = '',
}: PokerTableProps) => {
  const { preferences, graphicsQuality } = useGameStore();
  const { tableColor, showHandStrength } = preferences;
  
  const currentPlayer = gameState.players.find(p => p.userId === currentUserId);
  const currentPlayerIndex = currentPlayer 
    ? gameState.players.findIndex(p => p.id === currentPlayer.id)
    : -1;
  
  const getTableGradient = () => {
    const gradients: Record<string, string> = {
      green: 'from-green-800 via-green-700 to-green-900',
      blue: 'from-blue-800 via-blue-700 to-blue-900',
      red: 'from-red-800 via-red-700 to-red-900',
      black: 'from-gray-800 via-gray-700 to-gray-900',
      purple: 'from-purple-800 via-purple-700 to-purple-900',
    };
    return gradients[tableColor] || gradients.green;
  };
  
  const getTableBorder = () => {
    const borders: Record<string, string> = {
      green: 'border-amber-800',
      blue: 'border-blue-900',
      red: 'border-red-900',
      black: 'border-gray-600',
      purple: 'border-purple-900',
    };
    return borders[tableColor] || borders.green;
  };
  
  // Reorder players so current player is at bottom
  const getOrderedPlayers = () => {
    const totalPlayers = gameState.players.length;
    if (currentPlayerIndex === -1) {
      return gameState.players.map((p, i) => ({ player: p, position: i }));
    }
    
    return gameState.players.map((player, i) => {
      let position = (i - currentPlayerIndex + totalPlayers) % totalPlayers;
      // Adjust position to spread players properly
      if (totalPlayers <= 6) {
        position = position * (6 / totalPlayers);
      }
      return { player, position };
    });
  };
  
  const orderedPlayers = getOrderedPlayers();
  const activePlayers = gameState.players.filter(p => !p.hasFolded && p.isActive).length;
  
  return (
    <div className={cn(
      'relative w-full aspect-[4/3] max-w-5xl mx-auto',
      className
    )}>
      {/* Table Surface */}
      <div className={cn(
        'absolute inset-0 rounded-[50%]',
        'bg-gradient-to-br',
        getTableGradient(),
        'border-8',
        getTableBorder(),
        'shadow-2xl',
        graphicsQuality === 'ultra' && 'shadow-inner'
      )}>
        {/* Table Texture */}
        {graphicsQuality !== 'low' && (
          <div 
            className="absolute inset-0 rounded-[50%] opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          />
        )}
        
        {/* Table Center - Community Cards & Pot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Pot Display */}
          <div className="flex flex-col items-center mb-4">
            {gameState.pots.map((pot, i) => (
              <motion.div
                key={pot.id}
                initial={graphicsQuality !== 'low' ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-2">
                  <PokerChip value={Math.min(pot.amount, 10000)} size="md" />
                  <span className="text-white font-mono text-lg font-bold drop-shadow-lg">
                    ${pot.amount.toLocaleString()}
                  </span>
                </div>
                {gameState.pots.length > 1 && (
                  <span className="text-white/60 text-xs">Side Pot {i + 1}</span>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Community Cards */}
          <div className="flex gap-2 justify-center">
            {/* Flop */}
            {[0, 1, 2].map(i => (
              <PlayingCard
                key={`flop-${i}`}
                card={gameState.communityCards[i]}
                faceDown={!gameState.communityCards[i]}
                size="lg"
                delay={i * 0.1}
              />
            ))}
            
            {/* Turn */}
            <div className="ml-2">
              <PlayingCard
                card={gameState.communityCards[3]}
                faceDown={!gameState.communityCards[3]}
                size="lg"
                delay={0.3}
              />
            </div>
            
            {/* River */}
            <div className="ml-2">
              <PlayingCard
                card={gameState.communityCards[4]}
                faceDown={!gameState.communityCards[4]}
                size="lg"
                delay={0.4}
              />
            </div>
          </div>
          
          {/* Round Indicator */}
          <div className="mt-4 text-center">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-semibold uppercase',
              'bg-black/40 text-white/80'
            )}>
              {gameState.currentRound}
            </span>
          </div>
          
          {/* Hand Strength (if showing) */}
          {showHandStrength && currentPlayer && currentPlayer.cards.length === 2 && (
            <HandStrengthIndicator 
              holeCards={currentPlayer.cards}
              communityCards={gameState.communityCards}
            />
          )}
        </div>
        
        {/* Player Seats */}
        {orderedPlayers.map(({ player, position }) => (
          <PlayerSeat
            key={player.id}
            player={player}
            position={position}
            totalPositions={Math.max(orderedPlayers.length, 6)}
            isCurrentPlayer={player.userId === currentUserId}
            isCurrentTurn={gameState.players[gameState.currentPosition]?.id === player.id}
          />
        ))}
        
        {/* Dealer Button */}
        <DealerButton 
          position={gameState.dealerPosition}
          totalPlayers={gameState.players.length}
          currentPlayerIndex={currentPlayerIndex}
        />
        
        {/* Blinds Indicators */}
        <BlindIndicators 
          gameState={gameState}
          currentPlayerIndex={currentPlayerIndex}
        />
      </div>
      
      {/* Game Info Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
          <span className="text-white/60 text-xs">Hand #{gameState.handNumber}</span>
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
          <span className="text-white/60 text-xs">Blinds: ${gameState.smallBlind}/${gameState.bigBlind}</span>
        </div>
      </div>
      
      {/* Active Players Count */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
        <span className="text-white/60 text-xs">{activePlayers} players in hand</span>
      </div>
    </div>
  );
};

const HandStrengthIndicator = ({ 
  holeCards, 
  communityCards 
}: { 
  holeCards: any[]; 
  communityCards: any[];
}) => {
  if (communityCards.length === 0) {
    // Preflop - show starting hand strength
    const strength = getPreflopStrength(holeCards);
    return (
      <div className="mt-2 text-center">
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-semibold',
          strength >= 80 ? 'bg-green-500/80 text-white' :
          strength >= 60 ? 'bg-yellow-500/80 text-white' :
          strength >= 40 ? 'bg-orange-500/80 text-white' :
          'bg-gray-500/80 text-white'
        )}>
          Hand Strength: {strength}%
        </span>
      </div>
    );
  }
  
  // Postflop - show made hand
  const evaluation = evaluateHand(holeCards, communityCards);
  return (
    <div className="mt-2 text-center">
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/80 text-white">
        {evaluation.description}
      </span>
    </div>
  );
};

const getPreflopStrength = (cards: any[]): number => {
  if (cards.length !== 2) return 0;
  
  const values = cards.map((c: any) => {
    const rankValues: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 
      '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[c.rank] || 0;
  }).sort((a, b) => b - a);
  
  const isPair = values[0] === values[1];
  const isSuited = cards[0].suit === cards[1].suit;
  const gap = values[0] - values[1];
  
  let strength = 0;
  
  if (isPair) {
    strength = 50 + values[0] * 3;
  } else {
    strength = (values[0] + values[1]) * 2;
    if (isSuited) strength += 10;
    if (gap === 1) strength += 5;
    if (gap === 0) strength += 15; // Should be caught by pair
  }
  
  // Premium hands
  if (values[0] === 14 && values[1] === 14) strength = 100; // AA
  if (values[0] === 13 && values[1] === 13) strength = 95;  // KK
  if (values[0] === 14 && values[1] === 13 && isSuited) strength = 92; // AKs
  
  return Math.min(100, Math.round(strength));
};

const DealerButton = ({ 
  position, 
  totalPlayers,
  currentPlayerIndex 
}: { 
  position: number; 
  totalPlayers: number;
  currentPlayerIndex: number;
}) => {
  const { graphicsQuality } = useGameStore();
  
  if (currentPlayerIndex === -1) return null;
  
  const adjustedPosition = (position - currentPlayerIndex + totalPlayers) % totalPlayers;
  const angle = (adjustedPosition / Math.max(totalPlayers, 6)) * 2 * Math.PI - Math.PI / 2;
  const x = Math.cos(angle) * 30;
  const y = Math.sin(angle) * 22;
  
  return (
    <motion.div
      initial={graphicsQuality !== 'low' ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
      style={{
        left: `${50 + x}%`,
        top: `${50 + y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span className="text-gray-900 font-bold text-xs">D</span>
    </motion.div>
  );
};

const BlindIndicators = ({ 
  gameState,
  currentPlayerIndex 
}: { 
  gameState: GameState;
  currentPlayerIndex: number;
}) => {
  const { graphicsQuality } = useGameStore();
  
  if (currentPlayerIndex === -1) return null;
  
  const getPosition = (playerIndex: number) => {
    const adjustedPosition = (playerIndex - currentPlayerIndex + gameState.players.length) % gameState.players.length;
    const angle = (adjustedPosition / Math.max(gameState.players.length, 6)) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * 38,
      y: Math.sin(angle) * 28,
    };
  };
  
  const smallBlindIndex = gameState.players.findIndex(p => p.isSmallBlind);
  const bigBlindIndex = gameState.players.findIndex(p => p.isBigBlind);
  
  return (
    <>
      {smallBlindIndex !== -1 && (
        <motion.div
          initial={graphicsQuality !== 'low' ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          className="absolute w-6 h-6 rounded-full bg-blue-500 shadow flex items-center justify-center text-white text-xs font-bold"
          style={{
            left: `${50 + getPosition(smallBlindIndex).x}%`,
            top: `${50 + getPosition(smallBlindIndex).y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          SB
        </motion.div>
      )}
      {bigBlindIndex !== -1 && (
        <motion.div
          initial={graphicsQuality !== 'low' ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          className="absolute w-6 h-6 rounded-full bg-blue-800 shadow flex items-center justify-center text-white text-xs font-bold"
          style={{
            left: `${50 + getPosition(bigBlindIndex).x}%`,
            top: `${50 + getPosition(bigBlindIndex).y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          BB
        </motion.div>
      )}
    </>
  );
};

export default PokerTable;
