import { motion } from 'framer-motion';
import type { Card } from '@/types/poker/game';
import { getSuitSymbol, getSuitColor, getFourColorSuit } from '@/utils/poker/deck';
import { useGameStore } from '@/stores/gameStore';

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  delay?: number;
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-8 h-11', font: 'text-xs', suit: 'text-sm' },
  md: { container: 'w-12 h-16', font: 'text-sm', suit: 'text-lg' },
  lg: { container: 'w-16 h-22', font: 'text-base', suit: 'text-xl' },
  xl: { container: 'w-20 h-28', font: 'text-lg', suit: 'text-2xl' },
};

export const PlayingCard = ({
  card,
  faceDown = false,
  size = 'md',
  animated = true,
  delay = 0,
  className = '',
}: PlayingCardProps) => {
  const { preferences, graphicsQuality } = useGameStore();
  const { cardDesign, fourColorDeck } = preferences;
  
  const sizeClass = sizeClasses[size];
  
  if (faceDown) {
    return (
      <motion.div
        initial={animated ? { rotateY: 180, opacity: 0 } : false}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay }}
        className={`
          ${sizeClass.container}
          rounded-lg shadow-lg
          flex items-center justify-center
          ${getCardBackStyle(cardDesign)}
          ${className}
        `}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="w-full h-full rounded-lg overflow-hidden">
          <CardBackPattern design={cardDesign} quality={graphicsQuality} />
        </div>
      </motion.div>
    );
  }
  
  if (!card) return null;
  
  const suitColor = fourColorDeck 
    ? getFourColorSuit(card.suit)
    : getSuitColor(card.suit) === 'red' ? '#ef4444' : '#1f2937';
  
  return (
    <motion.div
      initial={animated ? { y: -50, opacity: 0, rotateY: -180 } : false}
      animate={{ y: 0, opacity: 1, rotateY: 0 }}
      transition={{ 
        duration: graphicsQuality === 'low' ? 0.1 : 0.4, 
        delay,
        type: graphicsQuality === 'low' ? 'tween' : 'spring',
        stiffness: 100,
      }}
      className={`
        ${sizeClass.container}
        bg-white rounded-lg shadow-lg
        flex flex-col items-center justify-between py-1
        border border-gray-200
        relative overflow-hidden
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top left corner */}
      <div 
        className={`absolute top-0.5 left-1 ${sizeClass.font} font-bold leading-none`}
        style={{ color: suitColor }}
      >
        {card.rank}
      </div>
      
      {/* Top left suit */}
      <div 
        className={`absolute top-3 left-0.5 ${sizeClass.suit}`}
        style={{ color: suitColor }}
      >
        {getSuitSymbol(card.suit)}
      </div>
      
      {/* Center suit/pattern */}
      <div 
        className={`${sizeClass.suit} opacity-90`}
        style={{ color: suitColor }}
      >
        {getSuitSymbol(card.suit)}
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div 
        className={`absolute bottom-0.5 right-1 ${sizeClass.font} font-bold leading-none rotate-180`}
        style={{ color: suitColor }}
      >
        {card.rank}
      </div>
      
      {/* Bottom right suit (rotated) */}
      <div 
        className={`absolute bottom-3 right-0.5 ${sizeClass.suit} rotate-180`}
        style={{ color: suitColor }}
      >
        {getSuitSymbol(card.suit)}
      </div>
      
      {/* Card shine effect for high quality */}
      {graphicsQuality === 'ultra' && <CardShineEffect />}
    </motion.div>
  );
};

const getCardBackStyle = (design: string): string => {
  switch (design) {
    case 'classic':
      return 'bg-blue-800';
    case 'modern':
      return 'bg-gradient-to-br from-indigo-900 to-purple-900';
    case 'minimal':
      return 'bg-gray-800';
    case 'dark':
      return 'bg-gradient-to-br from-gray-900 to-black';
    case 'gold':
      return 'bg-gradient-to-br from-yellow-700 to-yellow-900';
    default:
      return 'bg-blue-800';
  }
};

const CardBackPattern = ({ design, quality }: { design: string; quality: string }) => {
  if (quality === 'low') {
    return <div className="w-full h-full bg-current opacity-20" />;
  }
  
  const patterns: Record<string, React.ReactNode> = {
    classic: (
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <defs>
          <pattern id="classic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <rect width="100" height="140" fill="url(#classic-pattern)" />
        <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" rx="5" />
      </svg>
    ),
    modern: (
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <defs>
          <linearGradient id="modern-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0.3)" />
          </linearGradient>
          <pattern id="modern-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 0 L30 15 L15 30 L0 15 Z" fill="url(#modern-grad)" />
          </pattern>
        </defs>
        <rect width="100" height="140" fill="url(#modern-pattern)" />
        <rect x="8" y="8" width="84" height="124" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" rx="8" />
      </svg>
    ),
    minimal: (
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <rect width="100" height="140" fill="rgba(255,255,255,0.05)" />
        <rect x="10" y="10" width="80" height="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="4" />
      </svg>
    ),
    dark: (
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <defs>
          <pattern id="dark-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100" height="140" fill="url(#dark-pattern)" />
        <rect x="6" y="6" width="88" height="128" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" rx="6" />
      </svg>
    ),
    gold: (
      <svg viewBox="0 0 100 140" className="w-full h-full">
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(251,191,36,0.4)" />
            <stop offset="100%" stopColor="rgba(180,83,9,0.4)" />
          </linearGradient>
          <pattern id="gold-pattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
            <rect width="25" height="25" fill="url(#gold-grad)" />
            <circle cx="12.5" cy="12.5" r="4" fill="rgba(251,191,36,0.2)" />
          </pattern>
        </defs>
        <rect width="100" height="140" fill="url(#gold-pattern)" />
        <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="2" rx="5" />
      </svg>
    ),
  };
  
  return patterns[design] || patterns.classic;
};

const CardShineEffect = () => (
  <div 
    className="absolute inset-0 pointer-events-none"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.1) 100%)',
    }}
  />
);

export default PlayingCard;
