import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';

interface PokerChipProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  stacked?: boolean;
  className?: string;
}

const chipColors: Record<number, { base: string; border: string; text: string }> = {
  1: { base: 'bg-white', border: 'border-gray-300', text: 'text-gray-800' },
  5: { base: 'bg-red-500', border: 'border-red-700', text: 'text-white' },
  10: { base: 'bg-blue-500', border: 'border-blue-700', text: 'text-white' },
  25: { base: 'bg-green-500', border: 'border-green-700', text: 'text-white' },
  50: { base: 'bg-purple-500', border: 'border-purple-700', text: 'text-white' },
  100: { base: 'bg-black', border: 'border-gray-600', text: 'text-yellow-400' },
  500: { base: 'bg-pink-500', border: 'border-pink-700', text: 'text-white' },
  1000: { base: 'bg-yellow-500', border: 'border-yellow-700', text: 'text-gray-900' },
  5000: { base: 'bg-orange-500', border: 'border-orange-700', text: 'text-white' },
  10000: { base: 'bg-cyan-500', border: 'border-cyan-700', text: 'text-white' },
};

const sizeClasses = {
  sm: { chip: 'w-6 h-6', text: 'text-[8px]', border: 'border-2' },
  md: { chip: 'w-10 h-10', text: 'text-xs', border: 'border-3' },
  lg: { chip: 'w-14 h-14', text: 'text-sm', border: 'border-4' },
};

export const PokerChip = ({
  value,
  size = 'md',
  count = 1,
  stacked = false,
  className = '',
}: PokerChipProps) => {
  const { graphicsQuality } = useGameStore();
  const colors = chipColors[value] || chipColors[1];
  const sizeClass = sizeClasses[size];
  
  const formatValue = (v: number): string => {
    if (v >= 1000) return `${v / 1000}K`;
    return String(v);
  };
  
  if (stacked && count > 1) {
    return (
      <div className={`relative ${className}`}>
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <motion.div
            key={i}
            initial={graphicsQuality !== 'low' ? { y: -20, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`
              absolute
              ${sizeClass.chip}
              rounded-full
              ${colors.base}
              ${sizeClass.border}
              ${colors.border}
              flex items-center justify-center
              shadow-lg
            `}
            style={{
              transform: `translateY(${-i * 3}px)`,
              zIndex: count - i,
            }}
          >
            <span className={`${sizeClass.text} ${colors.text} font-bold`}>
              {formatValue(value)}
            </span>
            {graphicsQuality !== 'low' && <ChipPattern size={size} />}
          </motion.div>
        ))}
        {count > 5 && (
          <div 
            className={`
              absolute
              ${sizeClass.chip}
              rounded-full
              bg-gray-800
              flex items-center justify-center
              text-white text-xs font-bold
            `}
            style={{ transform: `translateY(${-5 * 3}px)`, zIndex: 0 }}
          >
            +{count - 5}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <motion.div
      whileHover={graphicsQuality !== 'low' ? { scale: 1.1 } : undefined}
      className={`
        ${sizeClass.chip}
        rounded-full
        ${colors.base}
        ${sizeClass.border}
        ${colors.border}
        flex items-center justify-center
        shadow-lg
        relative overflow-hidden
        ${className}
      `}
    >
      <span className={`${sizeClass.text} ${colors.text} font-bold z-10`}>
        {formatValue(value)}
      </span>
      {graphicsQuality !== 'low' && <ChipPattern size={size} />}
    </motion.div>
  );
};

const ChipPattern = ({ size }: { size: string }) => {
  const patternSize = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  
  return (
    <svg 
      className="absolute inset-0 w-full h-full opacity-30"
      viewBox="0 0 100 100"
    >
      <defs>
        <pattern 
          id={`chip-pattern-${size}`} 
          x="0" 
          y="0" 
          width={patternSize * 5} 
          height={patternSize * 5} 
          patternUnits="userSpaceOnUse"
        >
          <rect 
            x={patternSize} 
            y={patternSize} 
            width={patternSize * 3} 
            height={patternSize * 3} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1"
            rx="2"
          />
        </pattern>
      </defs>
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill={`url(#chip-pattern-${size})`}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
    </svg>
  );
};

export const ChipStack = ({ 
  totalValue, 
  size = 'md',
  className = '' 
}: { 
  totalValue: number; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const chipValues = [10000, 5000, 1000, 500, 100, 50, 25, 10, 5, 1];
  const stacks: { value: number; count: number }[] = [];
  
  let remaining = totalValue;
  for (const value of chipValues) {
    const count = Math.floor(remaining / value);
    if (count > 0) {
      stacks.push({ value, count: Math.min(count, 20) });
      remaining -= count * value;
    }
  }
  
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {stacks.map(({ value, count }) => (
        <PokerChip 
          key={value} 
          value={value} 
          size={size} 
          count={count} 
          stacked 
        />
      ))}
    </div>
  );
};

export default PokerChip;
