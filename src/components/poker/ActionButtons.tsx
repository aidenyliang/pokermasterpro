import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  FoldIcon, 
  CheckIcon, 
  CallIcon, 
  BetIcon, 
  RaiseIcon, 
  AllInIcon 
} from '@/components/ui/custom/PokerIcons';
import { useGameStore } from '@/stores/gameStore';
import { getValidActions } from '@/utils/poker/gameState';
import type { GameState, PlayerAction } from '@/types/poker/game';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  gameState: GameState;
  currentUserId: string;
  onAction: (action: PlayerAction, amount?: number) => void;
  className?: string;
}

const getCurrentBetToCall = (gameState: GameState): number => {
  return Math.max(...gameState.players.map(p => p.currentBet));
};

export const ActionButtons = ({
  gameState,
  currentUserId,
  onAction,
  className = '',
}: ActionButtonsProps) => {
  const { preferences, graphicsQuality } = useGameStore();
  const { confirmAllIn, confirmBigBets, bigBetThreshold } = preferences;
  
  const [showBetSlider, setShowBetSlider] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: PlayerAction; amount?: number } | null>(null);
  
  const currentPlayer = gameState.players.find(p => p.userId === currentUserId);
  const isCurrentTurn = currentPlayer && 
    gameState.players[gameState.currentPosition]?.id === currentPlayer.id;
  
  if (!currentPlayer || !isCurrentTurn || currentPlayer.hasFolded || currentPlayer.isAllIn) {
    return null;
  }
  
  const validActions = getValidActions(gameState, currentPlayer.id);
  const currentBet = getCurrentBetToCall(gameState);
  const toCall = currentBet - currentPlayer.currentBet;
  const minBet = gameState.bigBlind;
  const maxBet = currentPlayer.chips;
  
  const handleAction = (action: PlayerAction, amount?: number) => {
    // Check if confirmation needed
    if (action === 'all_in' && confirmAllIn) {
      setPendingAction({ action, amount });
      setShowConfirmDialog(true);
      return;
    }
    
    if ((action === 'bet' || action === 'raise') && amount && amount >= bigBetThreshold && confirmBigBets) {
      setPendingAction({ action, amount });
      setShowConfirmDialog(true);
      return;
    }
    
    onAction(action, amount);
    setShowBetSlider(false);
  };
  
  const confirmAction = () => {
    if (pendingAction) {
      onAction(pendingAction.action, pendingAction.amount);
      setPendingAction(null);
      setShowConfirmDialog(false);
      setShowBetSlider(false);
    }
  };
  
  const getButtonConfig = (action: PlayerAction) => {
    switch (action) {
      case 'fold':
        return {
          label: 'FOLD',
          icon: <FoldIcon className="w-5 h-5" />,
          variant: 'destructive' as const,
          className: 'bg-red-600 hover:bg-red-700',
        };
      case 'check':
        return {
          label: 'CHECK',
          icon: <CheckIcon className="w-5 h-5" />,
          variant: 'secondary' as const,
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
        };
      case 'call':
        return {
          label: `CALL $${toCall}`,
          icon: <CallIcon className="w-5 h-5" />,
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700',
        };
      case 'bet':
        return {
          label: 'BET',
          icon: <BetIcon className="w-5 h-5" />,
          variant: 'default' as const,
          className: 'bg-purple-600 hover:bg-purple-700',
        };
      case 'raise':
        return {
          label: 'RAISE',
          icon: <RaiseIcon className="w-5 h-5" />,
          variant: 'default' as const,
          className: 'bg-orange-600 hover:bg-orange-700',
        };
      case 'all_in':
        return {
          label: 'ALL IN',
          icon: <AllInIcon className="w-5 h-5" />,
          variant: 'destructive' as const,
          className: 'bg-red-700 hover:bg-red-800 animate-pulse',
        };
      default:
        return {
          label: action.toUpperCase(),
          icon: null,
          variant: 'default' as const,
          className: '',
        };
    }
  };
  
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Main Action Buttons */}
      <AnimatePresence mode="wait">
        {!showBetSlider ? (
          <motion.div
            initial={graphicsQuality !== 'low' ? { y: 20, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={graphicsQuality !== 'low' ? { y: -20, opacity: 0 } : undefined}
            className="flex flex-wrap justify-center gap-2"
          >
            {validActions.map((action) => {
              const config = getButtonConfig(action);
              const isBetOrRaise = action === 'bet' || action === 'raise';
              
              return (
                <motion.div
                  key={action}
                  whileHover={graphicsQuality !== 'low' ? { scale: 1.05 } : undefined}
                  whileTap={graphicsQuality !== 'low' ? { scale: 0.95 } : undefined}
                >
                  <Button
                    variant={config.variant}
                    size="lg"
                    className={cn(
                      'min-w-[100px] h-14 text-lg font-bold',
                      config.className
                    )}
                    onClick={() => {
                      if (isBetOrRaise) {
                        setShowBetSlider(true);
                        setBetAmount(action === 'bet' ? minBet : toCall + minBet);
                      } else {
                        handleAction(action);
                      }
                    }}
                  >
                    {config.icon}
                    <span className="ml-2">{config.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={graphicsQuality !== 'low' ? { y: 20, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={graphicsQuality !== 'low' ? { y: -20, opacity: 0 } : undefined}
            className="flex flex-col items-center gap-4 bg-gray-900/90 p-6 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <span className="text-white font-mono">${betAmount}</span>
              <Slider
                value={[betAmount]}
                onValueChange={([value]) => setBetAmount(value)}
                min={minBet}
                max={maxBet}
                step={gameState.bigBlind}
                className="w-64"
              />
            </div>
            
            {/* Quick Bet Buttons */}
            <div className="flex gap-2">
              {[0.5, 0.75, 1].map((multiplier) => (
                <Button
                  key={multiplier}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(Math.floor(maxBet * multiplier))}
                >
                  {multiplier === 1 ? 'Max' : `${multiplier * 100}%`}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(gameState.pots[0]?.amount || minBet)}
              >
                Pot
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowBetSlider(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(
                  currentBet > 0 ? 'raise' : 'bet', 
                  betAmount
                )}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {currentBet > 0 ? 'Raise' : 'Bet'} ${betAmount}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {pendingAction?.action === 'all_in' 
                ? `Are you sure you want to go ALL IN with $${currentPlayer.chips}?`
                : `Are you sure you want to ${pendingAction?.action} $${pendingAction?.amount}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction} className="bg-red-600 hover:bg-red-700">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionButtons;
