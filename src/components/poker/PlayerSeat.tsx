import { motion } from 'framer-motion';
import type { Player } from '@/types/poker/game';
import { useGameStore } from '@/stores/gameStore';
import { PlayingCard } from './PlayingCard';
import { PokerChip } from './PokerChip';
import { cn } from '@/lib/utils';

interface PlayerSeatProps {
  player: Player;
  position: number;
  totalPositions: number;
  isCurrentPlayer?: boolean;
  isCurrentTurn?: boolean;
  className?: string;
}

export const PlayerSeat = ({
  player,
  position,
  totalPositions,
  isCurrentPlayer = false,
  isCurrentTurn = false,
  className = '',
}: PlayerSeatProps) => {
  const { preferences, graphicsQuality } = useGameStore();
  const { showFoldedCards } = preferences;
  
  // Calculate position on the table ellipse
  const angle = (position / totalPositions) * 2 * Math.PI - Math.PI / 2;
  const x = Math.cos(angle) * 45; // 45% from center
  const y = Math.sin(angle) * 35; // 35% from center (ellipse)
  
  const getStatusBadge = () => {
    if (player.hasFolded) return (
      <span className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded-full">
        Folded
      </span>
    );
    if (player.isAllIn) return (
      <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full animate-pulse">
        ALL IN
      </span>
    );
    if (player.isSmallBlind) return (
      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
        SB
      </span>
    );
    if (player.isBigBlind) return (
      <span className="px-2 py-0.5 bg-blue-800 text-white text-xs rounded-full">
        BB
      </span>
    );
    if (player.isDealer) return (
      <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded-full">
        D
      </span>
    );
    return null;
  };
  
  return (
    <motion.div
      initial={graphicsQuality !== 'low' ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: position * 0.1 }}
      className={cn(
        'absolute transform -translate-x-1/2 -translate-y-1/2',
        'flex flex-col items-center',
        className
      )}
      style={{
        left: `${50 + x}%`,
        top: `${50 + y}%`,
      }}
    >
      {/* Player Info Card */}
      <div
        className={cn(
          'relative px-3 py-2 rounded-xl',
          'bg-gray-900/90 backdrop-blur-sm',
          'border-2 transition-all duration-200',
          isCurrentTurn 
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 scale-110' 
            : 'border-gray-700',
          isCurrentPlayer && 'ring-2 ring-blue-500',
          player.hasFolded && 'opacity-50'
        )}
      >
        {/* Avatar */}
        <div className="flex items-center gap-2 mb-1">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
            isCurrentPlayer ? 'bg-blue-600' : 'bg-gray-700',
            'border-2 border-white/20'
          )}>
            {player.avatarUrl ? (
              <img 
                src={player.avatarUrl} 
                alt={player.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              player.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold truncate max-w-20">
              {player.username}
            </span>
            <span className="text-green-400 text-xs font-mono">
              ${player.chips.toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-center mb-1">
          {getStatusBadge()}
        </div>
        
        {/* Current Bet */}
        {player.currentBet > 0 && (
          <motion.div
            initial={graphicsQuality !== 'low' ? { y: -10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center">
              <PokerChip value={Math.min(player.currentBet, 10000)} size="sm" />
              <span className="text-white text-xs font-mono bg-black/50 px-1 rounded">
                ${player.currentBet}
              </span>
            </div>
          </motion.div>
        )}
        
        {/* Last Action */}
        {player.lastAction && (
          <motion.div
            initial={graphicsQuality !== 'low' ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
              player.lastAction === 'fold' && 'bg-gray-600 text-white',
              player.lastAction === 'check' && 'bg-blue-600 text-white',
              player.lastAction === 'call' && 'bg-green-600 text-white',
              player.lastAction === 'bet' && 'bg-purple-600 text-white',
              player.lastAction === 'raise' && 'bg-orange-600 text-white',
              player.lastAction === 'all_in' && 'bg-red-600 text-white animate-pulse'
            )}>
              {player.lastAction.replace('_', ' ')}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Player Cards */}
      <div className="flex gap-1 mt-2">
        {player.cards.map((card, i) => (
          <PlayingCard
            key={i}
            card={player.showCards || (isCurrentPlayer && showFoldedCards) ? card : undefined}
            faceDown={!player.showCards && !(isCurrentPlayer && showFoldedCards)}
            size="sm"
            delay={i * 0.1}
          />
        ))}
      </div>
      
      {/* Turn Indicator */}
      {isCurrentTurn && graphicsQuality !== 'low' && (
        <motion.div
          className="absolute -inset-4 rounded-full border-2 border-yellow-400"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
};

export default PlayerSeat;
