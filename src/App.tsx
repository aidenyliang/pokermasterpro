import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { LoginForm } from '@/sections/auth/LoginForm';
import { RegisterForm } from '@/sections/auth/RegisterForm';
import { RoomList } from '@/sections/lobby/RoomList';
import { CreateRoomDialog, type RoomFormData } from '@/sections/lobby/CreateRoomDialog';
import { PlayerStatsDashboard } from '@/sections/dashboard/PlayerStats';
import { SettingsPanel } from '@/sections/dashboard/SettingsPanel';
import { PokerTable } from '@/components/poker/PokerTable';
import { ActionButtons } from '@/components/poker/ActionButtons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { supabase } from '@/lib/supabase/client';
import type { PlayerAction, PlayerStats, GameRoom } from '@/types/poker/game';
import { createNewGame, processAction } from '@/utils/poker/gameState';
import { SparklesIcon, ChipIcon, TrophyIcon, TrendingUpIcon } from '@/components/ui/custom/PokerIcons';
import './App.css';

type View = 'lobby' | 'game' | 'dashboard' | 'settings';
type AuthMode = 'login' | 'register';

function App() {
  const [currentView, setCurrentView] = useState<View>('lobby');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { 
    isAuthenticated, 
    userId, 
    username,
    currentGame, 
    currentRoom,
    rooms,
    playerStats,
    setCurrentGame,
    setCurrentRoom,
    setRooms,
    setPlayerStats,
    setAuth,
  } = useGameStore();
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuth(
          session.user.id,
          session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player',
          session.user.user_metadata?.avatar_url
        );
        
        // Load player stats
        const { data: stats } = await supabase
          .from('player_stats')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (stats) {
          const s = stats as any;
          const playerStatsData: PlayerStats = {
            userId: s.user_id,
            username: s.username,
            avatarUrl: s.avatar_url,
            totalHands: s.total_hands || 0,
            handsWon: s.hands_won || 0,
            handsFolded: s.hands_folded || 0,
            totalBets: s.total_bets || 0,
            totalWinnings: s.total_winnings || 0,
            totalLosses: s.total_losses || 0,
            netProfit: s.net_profit || 0,
            biggestPotWon: s.biggest_pot_won || 0,
            bestHand: s.best_hand,
            vpip: s.vpip || 0,
            pfr: s.pfr || 0,
            af: s.af || 0,
            bbPer100: s.bb_per_100 || 0,
            winRate: s.win_rate || 0,
            currentStreak: s.current_streak || 0,
            longestWinStreak: s.longest_win_streak || 0,
            tournamentWins: s.tournament_wins || 0,
            cashGameHours: s.cash_game_hours || 0,
            lastPlayedAt: s.last_played_at ? new Date(s.last_played_at).getTime() : Date.now(),
            createdAt: new Date(s.created_at).getTime(),
            updatedAt: new Date(s.updated_at).getTime(),
          };
          setPlayerStats(playerStatsData);
        }
      }
      setIsInitializing(false);
    };
    
    checkSession();
  }, [setAuth, setPlayerStats]);
  
  // Load rooms
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadRooms = async () => {
      const { data } = await supabase
        .from('game_rooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setRooms(data.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          hostId: r.host_id,
          hostName: r.host_name,
          smallBlind: r.small_blind,
          bigBlind: r.big_blind,
          ante: r.ante,
          minBuyIn: r.min_buy_in,
          maxBuyIn: r.max_buy_in,
          maxPlayers: r.max_players,
          currentPlayers: r.current_players,
          isPrivate: r.is_private,
          password: r.password,
          status: r.status,
          createdAt: new Date(r.created_at).getTime(),
          updatedAt: new Date(r.updated_at).getTime(),
        })));
      }
    };
    
    loadRooms();
    
    // Subscribe to room changes
    const subscription = supabase
      .channel('rooms')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_rooms' },
        () => loadRooms()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, setRooms]);
  
  const handleCreateRoom = async (roomData: RoomFormData) => {
    if (!userId || !username) return;
    
    const insertData = {
      name: roomData.name,
      description: roomData.description,
      host_id: userId,
      host_name: username,
      small_blind: roomData.smallBlind,
      big_blind: roomData.bigBlind,
      ante: roomData.ante,
      min_buy_in: roomData.minBuyIn,
      max_buy_in: roomData.maxBuyIn,
      max_players: roomData.maxPlayers,
      is_private: roomData.isPrivate,
      password: roomData.isPrivate ? roomData.password : null,
      status: 'waiting' as const,
    };
    
    const { data, error } = await supabase
      .from('game_rooms')
      .insert(insertData as any)
      .select()
      .single();
    
    if (data && !error) {
      const d = data as any;
      const newRoom: GameRoom = {
        id: d.id,
        name: d.name,
        description: d.description,
        hostId: d.host_id,
        hostName: d.host_name,
        smallBlind: d.small_blind,
        bigBlind: d.big_blind,
        ante: d.ante,
        minBuyIn: d.min_buy_in,
        maxBuyIn: d.max_buy_in,
        maxPlayers: d.max_players,
        currentPlayers: d.current_players,
        isPrivate: d.is_private,
        password: d.password,
        status: d.status,
        createdAt: new Date(d.created_at).getTime(),
        updatedAt: new Date(d.updated_at).getTime(),
      };
      
      setRooms([newRoom, ...rooms]);
      
      // Auto join the room
      handleJoinRoom(d.id, roomData.isPrivate ? roomData.password : undefined);
    }
  };
  
  const handleJoinRoom = async (roomId: string, password?: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !userId || !username) return;
    
    // Check password for private rooms
    if (room.isPrivate && room.password !== password) {
      alert('Incorrect password');
      return;
    }
    
    setCurrentRoom(room);
    
    // Create a new game or join existing
    const mockPlayers = [{
      id: userId,
      userId,
      username,
      chips: room.maxBuyIn,
      position: 0,
      cards: [],
      isActive: true,
      isDealer: true,
      isSmallBlind: false,
      isBigBlind: false,
      hasFolded: false,
      hasActed: false,
      currentBet: 0,
      totalBetThisRound: 0,
      isAllIn: false,
      isSittingOut: false,
      showCards: false,
    }];
    
    // Add some AI players for demo
    for (let i = 1; i < 4; i++) {
      mockPlayers.push({
        id: `ai-${i}`,
        userId: `ai-${i}`,
        username: `Player ${i + 1}`,
        chips: room.maxBuyIn,
        position: i,
        cards: [],
        isActive: true,
        isDealer: false,
        isSmallBlind: i === 1,
        isBigBlind: i === 2,
        hasFolded: false,
        hasActed: false,
        currentBet: i === 1 ? room.smallBlind : i === 2 ? room.bigBlind : 0,
        totalBetThisRound: 0,
        isAllIn: false,
        isSittingOut: false,
        showCards: false,
      });
    }
    
    const game = createNewGame(
      roomId,
      mockPlayers,
      room.smallBlind,
      room.bigBlind,
      room.ante,
      room.maxPlayers
    );
    
    setCurrentGame(game);
    setCurrentView('game');
  };
  
  const handleGameAction = (action: PlayerAction, amount?: number) => {
    if (!currentGame || !userId) return;
    
    const currentPlayer = currentGame.players.find(p => p.userId === userId);
    if (!currentPlayer) return;
    
    const newGameState = processAction(currentGame, currentPlayer.id, action, amount);
    setCurrentGame(newGameState);
  };
  
  const handleLeaveGame = () => {
    setCurrentGame(null);
    setCurrentRoom(null);
    setCurrentView('lobby');
  };
  
  // Loading screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  // Auth screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              PokerMaster <span className="text-blue-400">Pro</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The ultimate online poker experience. Play Texas Hold'em with friends, 
              track your stats, and climb the leaderboard.
            </p>
          </motion.div>
          
          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
          >
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <ChipIcon className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Real-time Gameplay</h3>
                <p className="text-gray-400 text-sm">Smooth, lag-free poker action with friends</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <TrophyIcon className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Track Stats</h3>
                <p className="text-gray-400 text-sm">Detailed analytics and performance metrics</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <TrendingUpIcon className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Climb Ranks</h3>
                <p className="text-gray-400 text-sm">Compete on global leaderboards</p>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Auth Form */}
          <div className="max-w-md mx-auto">
            {authMode === 'login' ? (
              <LoginForm onToggleMode={() => setAuthMode('register')} />
            ) : (
              <RegisterForm onToggleMode={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {currentView === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Game Lobby</h2>
                <p className="text-gray-400">Join an existing room or create your own</p>
              </div>
              <RoomList 
                onJoinRoom={handleJoinRoom}
                onCreateRoom={() => setCreateRoomOpen(true)}
              />
            </motion.div>
          )}
          
          {currentView === 'game' && currentGame && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentRoom?.name}</h2>
                  <p className="text-gray-400">
                    Blinds: ${currentRoom?.smallBlind}/${currentRoom?.bigBlind}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLeaveGame}
                  className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                >
                  Leave Game
                </Button>
              </div>
              
              {/* Poker Table */}
              <PokerTable 
                gameState={currentGame}
                currentUserId={userId || ''}
              />
              
              {/* Action Buttons */}
              <ActionButtons
                gameState={currentGame}
                currentUserId={userId || ''}
                onAction={handleGameAction}
              />
            </motion.div>
          )}
          
          {currentView === 'dashboard' && playerStats && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Your Stats</h2>
                <p className="text-gray-400">Track your poker performance</p>
              </div>
              <PlayerStatsDashboard stats={playerStats} />
            </motion.div>
          )}
          
          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
                <p className="text-gray-400">Customize your poker experience</p>
              </div>
              <SettingsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={createRoomOpen}
        onOpenChange={setCreateRoomOpen}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}

export default App;
