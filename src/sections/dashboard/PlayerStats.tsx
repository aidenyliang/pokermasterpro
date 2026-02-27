import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrophyIcon, 
  StatsIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ChipIcon,
  CardIcon,
  FlameIcon,
  CrownIcon,
  ClockIcon
} from '@/components/ui/custom/PokerIcons';
import { useGameStore } from '@/stores/gameStore';
import type { PlayerStats } from '@/types/poker/game';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  stats: PlayerStats;
}

export const PlayerStatsDashboard = ({ stats }: PlayerStatsProps) => {
  const { graphicsQuality } = useGameStore();
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const getWinRateColor = (rate: number): string => {
    if (rate >= 60) return 'text-green-400';
    if (rate >= 45) return 'text-yellow-400';
    if (rate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getBBPer100Color = (bb: number): string => {
    if (bb >= 5) return 'text-green-400';
    if (bb >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const statCards = [
    {
      title: 'Total Hands',
      value: formatNumber(stats.totalHands),
      icon: <CardIcon className="w-5 h-5" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Hands Won',
      value: formatNumber(stats.handsWon),
      icon: <TrophyIcon className="w-5 h-5" />,
      color: 'bg-green-500',
      subtext: `${((stats.handsWon / stats.totalHands) * 100).toFixed(1)}%`,
    },
    {
      title: 'Net Profit',
      value: `$${formatNumber(stats.netProfit)}`,
      icon: stats.netProfit >= 0 ? <TrendingUpIcon className="w-5 h-5" /> : <TrendingDownIcon className="w-5 h-5" />,
      color: stats.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
    {
      title: 'Biggest Pot',
      value: `$${formatNumber(stats.biggestPotWon)}`,
      icon: <ChipIcon className="w-5 h-5" />,
      color: 'bg-purple-500',
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={graphicsQuality !== 'low' ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900/80 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('p-2 rounded-lg', card.color)}>
                    {card.icon}
                  </div>
                  {card.subtext && (
                    <Badge variant="secondary" className="text-xs">
                      {card.subtext}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <div className="text-sm text-gray-400">{card.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Win Rate & Performance */}
        <motion.div
          initial={graphicsQuality !== 'low' ? { opacity: 0, x: -20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/80 border-gray-700 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <StatsIcon className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Win Rate */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Win Rate</span>
                  <span className={cn('font-bold', getWinRateColor(stats.winRate))}>
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.winRate} className="h-2" />
              </div>
              
              {/* BB/100 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">BB/100 Hands</span>
                  <span className={cn('font-bold', getBBPer100Color(stats.bbPer100))}>
                    {stats.bbPer100 > 0 ? '+' : ''}{stats.bbPer100.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, (stats.bbPer100 + 10) * 5))} 
                  className="h-2"
                />
              </div>
              
              {/* VPIP */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">VPIP (Voluntarily Put $ In Pot)</span>
                  <span className="text-white font-bold">{stats.vpip.toFixed(1)}%</span>
                </div>
                <Progress value={stats.vpip} className="h-2" />
              </div>
              
              {/* PFR */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">PFR (Pre-Flop Raise)</span>
                  <span className="text-white font-bold">{stats.pfr.toFixed(1)}%</span>
                </div>
                <Progress value={stats.pfr} className="h-2" />
              </div>
              
              {/* AF */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Aggression Factor</span>
                <Badge 
                  variant={stats.af > 2 ? 'destructive' : stats.af > 1 ? 'default' : 'secondary'}
                >
                  {stats.af.toFixed(2)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Achievements & Streaks */}
        <motion.div
          initial={graphicsQuality !== 'low' ? { opacity: 0, x: 20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/80 border-gray-700 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FlameIcon className="w-5 h-5 text-orange-500" />
                Streaks & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Streak */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    stats.currentStreak > 0 ? 'bg-green-500/20 text-green-400' : 
                    stats.currentStreak < 0 ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  )}>
                    <TrendingUpIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {stats.currentStreak > 0 ? 'Winning Streak' : 
                       stats.currentStreak < 0 ? 'Losing Streak' : 'No Streak'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {Math.abs(stats.currentStreak)} hands
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={stats.currentStreak > 0 ? 'default' : 'destructive'}
                  className={stats.currentStreak > 0 ? 'bg-green-600' : ''}
                >
                  {stats.currentStreak > 0 ? '+' : ''}{stats.currentStreak}
                </Badge>
              </div>
              
              {/* Longest Win Streak */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                    <CrownIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Longest Win Streak</div>
                    <div className="text-gray-400 text-sm">Personal best</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-yellow-400">
                  {stats.longestWinStreak}
                </Badge>
              </div>
              
              {/* Tournament Wins */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <TrophyIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Tournament Wins</div>
                    <div className="text-gray-400 text-sm">Championships</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-purple-400">
                  {stats.tournamentWins}
                </Badge>
              </div>
              
              {/* Cash Game Hours */}
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Time Played</div>
                    <div className="text-gray-400 text-sm">Cash games</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-blue-400">
                  {Math.floor(stats.cashGameHours)}h
                </Badge>
              </div>
              
              {/* Best Hand */}
              {stats.bestHand && (
                <div className="p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-600/30">
                  <div className="text-yellow-400 text-sm mb-1">Best Hand Ever</div>
                  <div className="text-white font-bold text-lg">
                    {stats.bestHand.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerStatsDashboard;
